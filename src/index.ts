#!/usr/bin/env node

// ─── Imports ───────────────────────────────────────────────────────────────

import { confirm, select } from "@clack/prompts"; // interactive y/n prompts
import { Command } from "commander"; // CLI command parser
import chalk from "chalk"; // terminal colors
import path from "path"; // file path utilities
import {
  detectProjectStructure,
  resolveInstallPath,
  detectPackageManager,
  isNodeProject,
  isPackageInstalled,
} from "./logic/detector";
import { createFolder, writeFile, fileAlreadyExists } from "./logic/writer";

// ─── CLI Setup ─────────────────────────────────────────────────────────────

const program = new Command();

program
  .name("alin")
  .description("Turn a multi-hour API integration into a single command")
  .version("0.0.1");

// ─── Install Command ───────────────────────────────────────────────────────
// Usage: alin install <integration>
// Example: alin install stripe

program
  .command("install <integration>")
  .description("Install an API integration into your project")
  .action(async (integration: string) => {
    // ── 1. Ask which variant the user wants ──────────────────────────────
    const variant = await select({
      message: "Which setup do you need?",
      options: [
        {
          value: "simple",
          label:
            "Simple — Stripe hosted checkout (recommended for most projects)",
        },
        {
          value: "advanced",
          label: "Advanced — Custom checkout with webhooks",
        },
      ],
    });

    // ── 2. Detect project type early (needed for API call) ───────────────
    const cwd = process.cwd();
    const { execSync } = await import("child_process");

    if (!isNodeProject(cwd)) {
      const setup = await confirm({
        message: "No package.json found. Set up a Node project here?",
      });

      if (!setup) {
        console.log(
          chalk.red("✗ Alin requires a Node project to install integrations."),
        );
        process.exit(1);
      }

      execSync("npm init -y", { cwd, stdio: "ignore" });
      console.log(chalk.green("✓ Node project initialized"));
    }

    const projectType = detectProjectStructure(cwd);

    // ── 3. Fetch block from API ──────────────────────────────────────────
    const API_URL = process.env.ALIN_API_URL ?? "http://localhost:3000";
    const res = await fetch(
      `${API_URL}/blocks/${integration}?variant=${String(variant)}&framework=${projectType}`,
    );

    if (!res.ok) {
      console.log(chalk.red(`✗ Unknown integration: ${integration}`));
      console.log(chalk.gray("Run `alin list` to see available integrations"));
      process.exit(1);
    }

    const { block } = await res.json();

    const installPath = resolveInstallPath(projectType);
    const fullFolderPath = path.join(cwd, installPath);

    console.log(chalk.green(`✓ Detected project type: ${projectType}`));
    createFolder(fullFolderPath);

    // ── 4. Install packages ──────────────────────────────────────────────
    const packageManager = detectPackageManager(cwd);

    // Install regular dependencies
    for (const dep of block.variant.dependencies) {
      if (isPackageInstalled(cwd, dep)) {
        console.log(chalk.yellow(`⚠ ${dep} is already installed, skipping`));
      } else {
        const installCommand = `${packageManager} ${packageManager === "npm" ? "install" : "add"} ${dep}`;
        console.log(chalk.gray(`Running: ${installCommand}`));
        execSync(installCommand, { cwd, stdio: "inherit" });
        console.log(chalk.green(`✓ Installed ${dep}`));
      }
    }

    // Install dev dependencies
    if (block.variant.devDependencies.length > 0) {
      for (const dep of block.variant.devDependencies) {
        if (isPackageInstalled(cwd, dep)) {
          console.log(chalk.yellow(`⚠ ${dep} is already installed, skipping`));
        } else {
          const devFlag = packageManager === "npm" ? "--save-dev" : "-D";
          const installCommand = `${packageManager} ${packageManager === "npm" ? "install" : "add"} ${devFlag} ${dep}`;
          console.log(chalk.gray(`Running: ${installCommand}`));
          execSync(installCommand, { cwd, stdio: "inherit" });
          console.log(chalk.green(`✓ Installed ${dep}`));
        }
      }
    }

    // ── 5. Write integration files ───────────────────────────────────────
    for (const file of block.variant.files) {
      const fullFilePath = path.join(cwd, file.name);
      const fileDir = path.dirname(fullFilePath);

      if (fileAlreadyExists(fullFilePath)) {
        console.log(chalk.yellow(`⚠ ${file.name} already exists, skipping`));
      } else {
        createFolder(fileDir);
        writeFile(fullFilePath, file.content);
        console.log(chalk.green(`✓ Created ${file.name}`));
      }
    }

    // ── 6. Write .env.example ────────────────────────────────────────────
    const envKeys = block.variant.variables
      .map((v: string) => `${v}=`)
      .join("\n");
    const envPath = path.join(cwd, ".env.example");

    if (fileAlreadyExists(envPath)) {
      const overwrite = await confirm({
        message: ".env.example already exists. Overwrite it?",
      });
      if (overwrite) {
        writeFile(envPath, envKeys);
        console.log(chalk.green(`✓ Updated .env.example with required keys`));
      } else {
        console.log(chalk.yellow(`⚠ Skipped .env.example`));
      }
    } else {
      writeFile(envPath, envKeys);
      console.log(chalk.green(`✓ Generated .env.example with required keys`));
    }

    // ── 7. Done ──────────────────────────────────────────────────────────
    console.log(chalk.cyan("\n📋 Next steps:"));
    block.variant.instructions.forEach((step: string, i: number) => {
      const coloredStep = step.replace(/(https?:\/\/[^\s,]+)/g, (url) =>
        chalk.cyan(url),
      );
      console.log(chalk.white(`   ${i + 1}. ${coloredStep}`));
    });
    console.log("");

    console.log(
      chalk.green(`✓ ${integration} is ready. Add your keys and go.`),
    );
  });

// ─── Run ───────────────────────────────────────────────────────────────────

program.parse();

// generator.ts has been removed for now in this file

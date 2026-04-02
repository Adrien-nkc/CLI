#!/usr/bin/env node

// ─── Imports ───────────────────────────────────────────────────────────────

import { confirm } from "@clack/prompts"; // interactive y/n prompts
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
    // ── 1. Fetch block from API ──────────────────────────────────────────
    const API_URL = process.env.ALIN_API_URL ?? "http://localhost:3000";
    const res = await fetch(`${API_URL}/blocks/${integration}`);

    if (!res.ok) {
      console.log(chalk.red(`✗ Unknown integration: ${integration}`));
      console.log(chalk.gray("Run `alin list` to see available integrations"));
      process.exit(1);
    }

    const { block } = await res.json();

    // ── 2. Detect project type and resolve install path ──────────────────
    const cwd = process.cwd();
    // ── Check if this is a Node project ─────────────────────────────────────
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

      const { execSync } = await import("child_process");
      execSync("npm init -y", { cwd, stdio: "ignore" });
      console.log(chalk.green("✓ Node project initialized"));
    }
    const projectType = detectProjectStructure(cwd);
    const installPath = resolveInstallPath(projectType);
    const fullFolderPath = path.join(cwd, installPath);

    console.log(chalk.green(`✓ Detected project type: ${projectType}`));
    createFolder(fullFolderPath);

    // ── Install package ───────────────────────────────────────────────────
    const packageManager = detectPackageManager(cwd);
    const installCommand = `${packageManager} ${packageManager === "npm" ? "install" : "add"} ${block.package}`;

    if (isPackageInstalled(cwd, block.package)) {
      console.log(
        chalk.yellow(`⚠ ${block.package} is already installed, skipping`),
      );
    } else {
      console.log(chalk.gray(`Running: ${installCommand}`));
      const { execSync } = await import("child_process");
      execSync(installCommand, { cwd, stdio: "inherit" });
      console.log(chalk.green(`✓ Installed ${block.package}`));
    }

    // ── 3. Write integration files ───────────────────────────────────────
    for (const file of block.files) {
      const fullFilePath = path.join(fullFolderPath, file.name);
      if (fileAlreadyExists(fullFilePath)) {
        console.log(chalk.yellow(`⚠ ${file.name} already exists, skipping`));
      } else {
        writeFile(fullFilePath, file.content);
        console.log(chalk.green(`✓ Created ${installPath}${file.name}`));
      }
    }

    // ── 4. Write .env.example ────────────────────────────────────────────
    const envKeys = block.variables.map((v: string) => `${v}=`).join("\n");
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

    // ── 5. Done ──────────────────────────────────────────────────────────

    console.log(chalk.cyan("\n📋 Next steps:"));
    block.instructions.forEach((step: string, i: number) => {
      console.log(chalk.white(`   ${i + 1}. ${step}`));
    });
    console.log("");

    console.log(
      chalk.green(`✓ ${integration} is ready. Add your keys and go.`),
    );
  });

// ─── Run ───────────────────────────────────────────────────────────────────

program.parse();

// generator.ts has been removed for now in this file

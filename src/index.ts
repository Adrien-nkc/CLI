#!/usr/bin/env node

// ─── Imports ───────────────────────────────────────────────────────────────

import { confirm, select, text } from "@clack/prompts"; // interactive y/n prompts
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
import { readFileSync, existsSync, writeFileSync } from "fs";
import open from "open"; // open URLs in the browser
import { join } from "path";
import { homedir } from "os";

// ─── CLI Setup ─────────────────────────────────────────────────────────────

const program = new Command();

program
  .name("alin")
  .description("Turn a multi-hour API integration into a single command")
  .version("0.0.1");

const CONFIG_PATH = join(homedir(), ".alin", "config.json");

if (existsSync(CONFIG_PATH)) {
  const config = JSON.parse(readFileSync(CONFIG_PATH, "utf-8"));
  if (config.apiUrl) process.env.ALIN_API_URL = config.apiUrl;
}

const API_URL = process.env.ALIN_API_URL ?? "https://alin-d1w3.onrender.com";

// ─── Install Command ───────────────────────────────────────────────────────
// Usage: alin install <integration>
// Example: alin install stripe

program
  .command("install <integration>")
  .description("Install an API integration into your project")
  .option("-y, --yes", "Skip prompts and use defaults")
  .action(async (integration: string, options: { yes: boolean }) => {
    const skip = options.yes;

    // ── 1. Ask which variant the user wants ──────────────────────────────
    const variant = await select({
      message: "Which setup do you need?",
      options: [
        {
          value: "simple",
          label: "Subscription — Recurring billing with plan management",
        },
        {
          value: "one-time",
          label: "One-time — Single payment checkout",
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

    let block;

    try {
      const res = await fetch(
        `${API_URL}/blocks/${integration}?variant=${String(variant)}&framework=${projectType}`,
      );

      // res receives the responser from the API

      console.log(chalk.gray(`(DEBUG DELETE AFTER) Using API: ${API_URL}`));

      if (!res.ok) {
        console.log(chalk.red(`✗ Unknown integration: ${integration}`));
        console.log(
          chalk.gray("Run `alin list` to see available integrations"),
        );
        process.exit(1);
      }

      ({ block } = await res.json());

      // block gets assigned the response from the API which allows me to use block.variables.variant etc

      const installPath = resolveInstallPath(projectType);
      const fullFolderPath = path.join(cwd, installPath);

      console.log(chalk.green(`✓ Detected project type: ${projectType}`));
      createFolder(fullFolderPath);
    } catch (error) {
      console.log(
        chalk.red(`✗ Our servers are taking a nap. Try again in a bit!`),
      );
      process.exit(1);
    }

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
          console.log(chalk.yellow(`Running: ${installCommand}`));
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
        if (file.name === "src/App.tsx") {
          const overwrite = skip
            ? true
            : await confirm({
                message: `App.tsx already exists. Overwrite it? This will replace your existing App.tsx with the Stripe integration version.`,
              });

          if (overwrite) {
            writeFile(fullFilePath, file.content);
            console.log(chalk.green(`✓ Overwrote App.tsx with router`));
          } else {
            console.log(
              chalk.yellow(`⚠ Skipped App.tsx. Add routes manually.`),
            );
          }
        } else {
          console.log(chalk.yellow(`⚠ ${file.name} already exists, skipping`));
        }
      } else {
        createFolder(fileDir);
        writeFile(fullFilePath, file.content);
        console.log(chalk.green(`✓ Created ${file.name}`));
      }
    }

    // ── 6. Add backend script to package.json ───────────────────────────────
    if (variant === "simple" || variant === "one-time") {
      const pkgPath = path.join(cwd, "package.json");
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8"));

      if (!pkg.scripts.backend) {
        pkg.scripts.backend =
          "node --no-warnings --experimental-strip-types backend/server.ts";
        writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
        console.log(chalk.green(`✓ Added "backend" script to package.json`));
      } else {
        console.log(
          chalk.yellow(
            `⚠ "backend" script already exists in package.json, skipping`,
          ),
        );
      }
    }

    // ── 7. Write .env ────────────────────────────────────────────
    const envKeys = block.variant.variables
      .map((v: string) => `${v}=`)
      .join("\n");
    const envPath = path.join(cwd, ".env");

    if (fileAlreadyExists(envPath)) {
      const overwrite = skip
        ? true
        : await confirm({
            message: ".env already exists. Overwrite it?",
          });
      if (overwrite) {
        writeFile(envPath, envKeys);
        console.log(chalk.green(`✓ Updated .env with required keys`));
      } else {
        console.log(chalk.yellow(`⚠ Skipped .env`));
      }
    } else {
      writeFile(envPath, envKeys);
      console.log(chalk.green(`✓ Generated .env with required keys`));
    }

    // ── 8. Done ──────────────────────────────────────────────────────────

    if (!skip) {
      const openBrowser = await confirm({
        message: "Open Stripe dashboard to get your API key?",
      });
      if (openBrowser) open("https://dashboard.stripe.com/apikeys");

      const apiKey = await text({
        message: "Paste your Stripe API (secret key) key:",
      });

      let envContent = `STRIPE_SECRET_KEY=${String(apiKey)}`;

      if (variant === "simple") {
        const priceID = await text({ message: "Paste your Stripe price ID:" });
        envContent += `\nVITE_PRICE_ID=${String(priceID)}`;
      }

      const url = await text({
        message: "Paste your domain (leave empty to use localhost)",
        placeholder: "http://localhost:5173",
      });
      envContent += `\nVITE_APP_URL=${String(url) || "http://localhost:5173"}`;

      writeFile(envPath, envContent);
    }

    if (skip) {
      console.log(
        chalk.yellow(
          `\n⚠ Since you skipped prompts, Fill in your .env file before running:`,
        ),
      );
      block.variant.variables.forEach((v: string) => {
        console.log(chalk.gray(`   ${v}=your_value_here`));
      });
      console.log("");
    }

    console.log(chalk.green(`✓ ${integration} is ready.`));

    console.log(chalk.cyan("\n📋 Next steps:"));
    block.variant.instructions.forEach((step: string, i: number) => {
      const coloredStep = step.replace(/(https?:\/\/[^\s,]+)/g, (url) =>
        chalk.cyan(url),
      );
      console.log(chalk.white(`   ${i + 1}. ${coloredStep}`));
    });
    console.log("");
  });

// ─── Run ───────────────────────────────────────────────────────────────────

program.parse();

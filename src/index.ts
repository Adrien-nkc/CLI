#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import path from "path";
import { detectProjectStructure, resolveInstallPath } from "./logic/detector";
import { generateEnvExample, isValidIntegration } from "./logic/generator";
import { createFolder, writeFile, fileAlreadyExists } from "./logic/writer";

const program = new Command();

program
  .name("alin")
  .description("Turn a multi-hour API integration into a single command")
  .version("0.0.1");

program
  .command("install <integration>")
  .description("Install an API integration into your project")
  .action((integration: string) => {
    if (!isValidIntegration(integration)) {
      console.log(chalk.red(`✗ Unknown integration: ${integration}`));
      console.log(chalk.gray("Supported: stripe, openai, twilio, resend"));
      process.exit(1);
    }

    const cwd = process.cwd();
    const projectType = detectProjectStructure(cwd);
    const installPath = resolveInstallPath(projectType);
    const fullFolderPath = path.join(cwd, installPath);
    const fullFilePath = path.join(fullFolderPath, `${integration}.ts`);
    const envPath = path.join(cwd, ".env.example");
    const envKeys = generateEnvExample(integration);

    console.log(chalk.green(`✓ Detected project type: ${projectType}`));

    if (fileAlreadyExists(fullFilePath)) {
      console.log(
        chalk.yellow(
          `⚠ ${installPath}${integration}.ts already exists, skipping`,
        ),
      );
    } else {
      createFolder(fullFolderPath);
      writeFile(
        fullFilePath,
        `// ${integration} integration\n// Add your logic here\n`,
      );
      console.log(chalk.green(`✓ Created ${installPath}${integration}.ts`));
    }

    writeFile(envPath, envKeys);
    console.log(chalk.green(`✓ Generated .env.example with required keys`));
    console.log(
      chalk.green(`✓ ${integration} is ready. Add your keys and go.`),
    );
  });

program.parse();

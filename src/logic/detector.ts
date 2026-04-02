import { existsSync } from "fs";

export type ProjectType = "nextjs" | "vite" | "express" | "generic";

export type PackageManager = "npm" | "bun" | "pnpm" | "yarn";

export function detectPackageManager(cwd: string): PackageManager {
  if (existsSync(`${cwd}/bun.lock`) || existsSync(`${cwd}/bun.lockb`)) {
    return "bun";
  }
  if (existsSync(`${cwd}/pnpm-lock.yaml`)) {
    return "pnpm";
  }
  if (existsSync(`${cwd}/yarn.lock`)) {
    return "yarn";
  }
  return "npm";
}

export function detectProjectStructure(cwd: string): ProjectType {
  if (
    existsSync(`${cwd}/next.config.js`) ||
    existsSync(`${cwd}/next.config.ts`)
  ) {
    return "nextjs";
  }
  if (
    existsSync(`${cwd}/vite.config.ts`) ||
    existsSync(`${cwd}/vite.config.js`)
  ) {
    return "vite";
  }
  if (
    existsSync(`${cwd}/app.js`) ||
    existsSync(`${cwd}/app.ts`) ||
    existsSync(`${cwd}/server.js`) ||
    existsSync(`${cwd}/server.ts`)
  ) {
    return "express";
  }
  return "generic";
}

export function isNodeProject(cwd: string): boolean {
  return existsSync(`${cwd}/package.json`);
}

export function resolveInstallPath(projectType: ProjectType): string {
  const paths: Record<ProjectType, string> = {
    nextjs: "src/lib/",
    vite: "src/services/",
    express: "src/integrations/",
    generic: "src/",
  };
  return paths[projectType];
}

export function isPackageInstalled(cwd: string, packageName: string): boolean {
  try {
    const packageJson = JSON.parse(
      require("fs").readFileSync(`${cwd}/package.json`, "utf-8"),
    );
    return (
      packageName in (packageJson.dependencies ?? {}) ||
      packageName in (packageJson.devDependencies ?? {})
    );
  } catch {
    return false;
  }
}

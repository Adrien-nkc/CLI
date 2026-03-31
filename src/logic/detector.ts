import { existsSync } from "fs";

export type ProjectType = "nextjs" | "vite" | "express" | "generic";

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
  if (existsSync(`${cwd}/package.json`)) {
    return "express";
  }
  return "generic";
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

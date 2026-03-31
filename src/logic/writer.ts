import { writeFileSync, mkdirSync, existsSync } from "fs";

export function createFolder(path: string): void {
  if (!existsSync(path)) {
    mkdirSync(path, { recursive: true });
  }
}

export function writeFile(path: string, content: string): void {
  writeFileSync(path, content, "utf-8");
}

export function fileAlreadyExists(path: string): boolean {
  return existsSync(path);
}

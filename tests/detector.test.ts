import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  detectProjectStructure,
  resolveInstallPath,
} from "../src/logic/detector";
import { mkdirSync, writeFileSync, rmSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";

// temp folder we create and destroy for each test
let tempDir: string;

beforeEach(() => {
  // creates a unique temp folder like /tmp/test-abc123
  tempDir = join(tmpdir(), `test-${Math.random().toString(36).slice(2)}`);
  mkdirSync(tempDir, { recursive: true });
});

afterEach(() => {
  // clean up after each test
  rmSync(tempDir, { recursive: true, force: true });
});

describe("detectProjectStructure", () => {
  it("returns generic for a path with no known config files", () => {
    // tempDir is empty so nothing exists = generic
    expect(detectProjectStructure(tempDir)).toBe("generic");
  });

  it("returns express when only a package.json exists", () => {
    // we create a real package.json in the temp folder
    writeFileSync(join(tempDir, "package.json"), "{}");
    expect(detectProjectStructure(tempDir)).toBe("express");
  });

  it("returns nextjs when next.config.js exists", () => {
    writeFileSync(join(tempDir, "next.config.js"), "");
    expect(detectProjectStructure(tempDir)).toBe("nextjs");
  });

  it("returns vite when vite.config.ts exists", () => {
    writeFileSync(join(tempDir, "vite.config.ts"), "");
    expect(detectProjectStructure(tempDir)).toBe("vite");
  });
});

describe("resolveInstallPath", () => {
  it("puts nextjs integrations in src/lib/", () => {
    expect(resolveInstallPath("nextjs")).toBe("src/lib/");
  });

  it("puts vite integrations in src/services/", () => {
    expect(resolveInstallPath("vite")).toBe("src/services/");
  });

  it("puts express integrations in src/integrations/", () => {
    expect(resolveInstallPath("express")).toBe("src/integrations/");
  });
});

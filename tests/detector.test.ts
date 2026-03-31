import { describe, it, expect } from "vitest";
import {
  detectProjectStructure,
  resolveInstallPath,
} from "../src/logic/detector";

describe("detectProjectStructure", () => {
  it("returns generic for a path with no known config files", () => {
    expect(detectProjectStructure("/tmp")).toBe("generic");
  });

  it("returns express when only a package.json exists", () => {
    expect(
      detectProjectStructure(
        "C:/Users/emoti/OneDrive/Escritorio/CODING-PROJECTS/VITEST",
      ),
    ).toBe("express");
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

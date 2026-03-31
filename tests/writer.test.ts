import { describe, it, expect } from "vitest";
import { fileAlreadyExists } from "../src/logic/writer";

describe("fileAlreadyExists", () => {
  it("returns true for a file that exists", () => {
    expect(fileAlreadyExists("package.json")).toBe(true);
  });

  it("returns false for a file that does not exist", () => {
    expect(fileAlreadyExists("fake-file.ts")).toBe(false);
  });
});

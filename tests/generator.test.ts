import { describe, it, expect } from "vitest";
import {
  generateEnvExample,
  resolveFileName,
  getSupportedIntegrations,
  isValidIntegration,
} from "../src/logic/generator";

describe("generateEnvExample", () => {
  it("generates correct stripe env keys", () => {
    const env = generateEnvExample("stripe");
    expect(env).toContain("STRIPE_SECRET_KEY=");
    expect(env).toContain("STRIPE_PUBLIC_KEY=");
    expect(env).toContain("STRIPE_WEBHOOK_SECRET=");
  });

  it("generates correct openai env keys", () => {
    const env = generateEnvExample("openai");
    expect(env).toContain("OPENAI_API_KEY=");
  });

  it("throws for an unknown integration", () => {
    // @ts-expect-error - testing invalid input on purpose
    expect(() => generateEnvExample("unknown")).toThrow(
      "Unknown integration: unknown",
    );
  });
});

describe("resolveFileName", () => {
  it("returns stripe.ts for stripe", () => {
    expect(resolveFileName("stripe")).toBe("stripe.ts");
  });
});

describe("isValidIntegration", () => {
  it("returns true for stripe", () => {
    expect(isValidIntegration("stripe")).toBe(true);
  });

  it("returns false for unknown integrations", () => {
    expect(isValidIntegration("paypal")).toBe(false);
  });
});

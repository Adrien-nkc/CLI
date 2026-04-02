import { describe, it, expect } from "vitest";
import app from "../src/api/server";
import { blocks } from "../src/api/data/blocks";

describe("Health route", () => {
  it("should return status ok", async () => {
    const res = await app.request("/health");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ status: "ok" });
  });
  it("should return a list of blocks", async () => {
    const res = await app.request("/blocks");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ blocks });
  });
  it("should return a single block by name", async () => {
    const res = await app.request("/blocks/stripe");
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body).toEqual({ block: blocks[0] });
  });
  it("should return 404 for an unknown block", async () => {
    const res = await app.request("/blocks/unknown");

    expect(res.status).toBe(404);
  });
});

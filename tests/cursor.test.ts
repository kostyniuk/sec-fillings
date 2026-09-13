import { describe, expect, it } from "bun:test";
import { decodeCursor, encodeCursor } from "@/server/lib/cursor";

describe("cursor", () => {
  it("survives encode then decode", () => {
    expect(decodeCursor(encodeCursor("0000320193-26-000081"))).toBe("0000320193-26-000081");
  });

  it("is url-safe", () => {
    expect(encodeCursor("0000320193-26-000081")).toMatch(/^[A-Za-z0-9_-]+$/);
  });
});

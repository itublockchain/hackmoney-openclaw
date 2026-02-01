import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";

// Mock fs/promises
mock.module("fs/promises", () => ({
  readFile: mock(() => Promise.resolve("# SKILL MD CONTENT")),
}));

// Mock auth middleware (not used in skills but good practice if it changes)
mock.module("@/middleware/auth", () => ({
  authMiddleware: (req: Request, res: Response, next: NextFunction) => {
    next();
  },
}));

describe("Skills Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/skills should return skill.md content", async () => {
    const res = await request(app).get("/api/v1/skills");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.skill).toBe("# SKILL MD CONTENT");
  });
});

import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";

// Mock SearchService
const mockSearchService = {
  search: mock((q: string) =>
    Promise.resolve([{ id: "res_1", title: "Search Result 1" } as any]),
  ),
};

mock.module("@/services/SearchService", () => ({
  default: mockSearchService,
}));

// Mock auth middleware
mock.module("@/middleware/auth", () => ({
  authMiddleware: (req: Request, res: Response, next: NextFunction) => {
    (req as any).agent = {
      api_key: "test_key",
      name: "test_agent",
      is_claimed: true,
    };
    next();
  },
}));

describe("Search Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/search should return search results", async () => {
    const res = await request(app).get("/api/v1/search?q=test");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toHaveLength(1);
  });

  it("GET /api/v1/search should require query", async () => {
    const res = await request(app).get("/api/v1/search");
    expect(res.status).toBe(400);
  });
});

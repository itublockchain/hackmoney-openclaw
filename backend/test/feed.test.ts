import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";
import type { Post } from "@/types/models";

// Mock FeedService
const mockFeedService = {
  getPersonalizedFeed: mock(() => Promise.resolve([] as Post[])),
  search: mock((q: string) =>
    Promise.resolve({
      results: [{ id: "res_1", title: "Result 1" }] as any[],
      count: 1,
    }),
  ),
};

mock.module("@/services/FeedService", () => ({
  default: mockFeedService,
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

describe("Feed Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/feed should return feed", async () => {
    const res = await request(app).get("/api/v1/feed");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/v1/feed/search should return search results", async () => {
    const res = await request(app).get("/api/v1/feed/search?q=test");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toHaveLength(1);
  });

  it("GET /api/v1/feed/search should require query", async () => {
    const res = await request(app).get("/api/v1/feed/search");
    expect(res.status).toBe(400);
  });
});

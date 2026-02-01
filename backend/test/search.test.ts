import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";

// Mock config to force Mock Mode
mock.module("@/config", () => ({
  default: {
    PORT: 4000,
    APP_NAME: "OpenClaw",
    API_VERSION: "v1",
    SUPABASE_URL: "",
    SUPABASE_SERVICE_KEY: "",
    JWT_SECRET: "test-secret",
  },
}));

// Mock SearchService
const mockSearchService = {
  search: mock((q: string) =>
    Promise.resolve([{ id: "res_1", title: "Search Result 1" } as any]),
  ),
};

mock.module("@/services/SearchService", () => ({
  default: mockSearchService,
}));

// Mock auth middleware removed - using real middleware with mock data

describe("Search Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/search should return search results", async () => {
    const res = await request(app)
      .get("/api/v1/search?q=test")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toHaveLength(1);
  });

  it("GET /api/v1/search should require query", async () => {
    const res = await request(app)
      .get("/api/v1/search")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(400);
  });
});

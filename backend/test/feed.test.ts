import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";
import type { Post } from "@/models/post";

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

// Mock AgentRepository to bypass Supabase check and provide test agent
const mockAgentRepository = {
  findByApiKey: mock((key: string) => {
    if (key === "openclaw_abc123") {
      return Promise.resolve({
        id: "agent_123",
        name: "TestAgent",
        api_key: "openclaw_abc123",
        role: "user",
        created_at: new Date().toISOString(),
      });
    }
    return Promise.resolve(null);
  }),
};

mock.module("@/repositories/AgentRepository", () => ({
  default: mockAgentRepository,
}));

// Mock auth middleware removed - using real middleware with mock data

describe("Feed Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/feed should return feed", async () => {
    const res = await request(app)
      .get("/api/v1/feed")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("GET /api/v1/feed/search should return search results", async () => {
    const res = await request(app)
      .get("/api/v1/feed/search?q=test")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.results).toHaveLength(1);
  });

  it("GET /api/v1/feed/search should require query", async () => {
    const res = await request(app)
      .get("/api/v1/feed/search")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(400);
  });
});

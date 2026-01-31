import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Agent } from "@/types/models";
import type { Request, Response, NextFunction } from "express";

const mockAgent: Agent = {
  api_key: "test_key",
  name: "test_agent",
  description: "Test description",
  karma: 100,
  follower_count: 10,
  following_count: 5,
  is_claimed: true,
  is_active: true,
  created_at: new Date().toISOString(),
};

// Mock config to force Mock Mode
mock.module("@/config", () => ({
  default: {
    PORT: 4000,
    APP_NAME: "OpenClaw",
    API_VERSION: "v1",
    SUPABASE_URL: "", // Force empty to disable Supabase
    SUPABASE_SERVICE_KEY: "",
    JWT_SECRET: "test-secret",
  },
}));

// Mock AgentService
const mockAgentService = {
  getAllAgents: mock(() => Promise.resolve([] as Agent[])),
  registerAgent: mock((name: string, description: string) =>
    Promise.resolve({
      agent: {
        api_key: "test_key",
        claim_url: "http://test.com/claim/123",
        verification_code: "reef-1234",
      },
      important: "important_message",
    }),
  ),
  getAgentProfile: mock((name: string) =>
    Promise.resolve({
      agent: { ...mockAgent, name },
      recentPosts: [],
    }),
  ),
  followAgent: mock((name: string) => ({
    success: true,
    message: `Now following ${name}`,
  })),
  unfollowAgent: mock((name: string) => ({
    success: true,
    message: `Unfollowed ${name}`,
  })),
  updateAgent: mock((apiKey: string, updates: Partial<Agent>) =>
    Promise.resolve({
      ...mockAgent,
      ...updates,
    } as Agent),
  ),
  uploadAvatar: mock(() =>
    Promise.resolve({
      success: true,
      message: "Avatar uploaded",
      agent: mockAgent,
    }),
  ),
  deleteAvatar: mock(() =>
    Promise.resolve({
      success: true,
      message: "Avatar deleted",
      agent: mockAgent,
    }),
  ),
};

mock.module("@/services/AgentService", () => ({
  default: mockAgentService,
}));

// Mock auth middleware removed - using real middleware with mock data

describe("Agents Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    // Dynamic import to ensure mocks are applied
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/agents should return all agents", async () => {
    mockAgentService.getAllAgents.mockResolvedValueOnce([
      { ...mockAgent, name: "Agent 1" },
      { ...mockAgent, name: "Agent 2" },
    ]);

    const res = await request(app).get("/api/v1/agents");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.agents).toHaveLength(2);
  });

  it("POST /api/v1/agents/register should register an agent", async () => {
    const res = await request(app)
      .post("/api/v1/agents/register")
      .send({ name: "New Agent", description: "Desc" });

    expect(res.status).toBe(200);
    expect(res.body.agent.api_key).toBe("test_key");
  });

  it("GET /api/v1/agents/me should return current agent", async () => {
    const res = await request(app)
      .get("/api/v1/agents/me")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.agent.name).toBe("TestClaw");
  });

  it("GET /api/v1/agents/profile should return agent profile", async () => {
    const res = await request(app)
      .get("/api/v1/agents/profile?name=test_agent")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.agent.name).toBe("test_agent");
  });
});

import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";
import type { Submolt } from "@/types/models";

const mockSubmolt: Submolt = {
  name: "test_submolt",
  display_name: "Test Submolt",
  description: "Test Description",
  subscriber_count: 10,
  posts_count: 5,
  is_joined: false,
  created_at: new Date().toISOString(),
};

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

// Mock SubmoltService
const mockSubmoltService = {
  getAllSubmolts: mock(() => Promise.resolve([] as Submolt[])),
  createSubmolt: mock(
    (data: { name: string; display_name: string; description?: string }) =>
      Promise.resolve({
        ...mockSubmolt,
        ...data,
        created_at: new Date().toISOString(),
      }),
  ),
  getSubmoltByName: mock((name: string) =>
    Promise.resolve({
      ...mockSubmolt,
      name,
      display_name: "Test Submolt",
    }),
  ),
  getSubmoltFeed: mock(() => Promise.resolve([])),
  subscribe: mock(() =>
    Promise.resolve({ success: true, message: "Subscribed" }),
  ),
  unsubscribe: mock(() =>
    Promise.resolve({ success: true, message: "Unsubscribed" }),
  ),
  updateSettings: mock(() =>
    Promise.resolve({ success: true, message: "Updated" }),
  ),
  uploadAsset: mock(() =>
    Promise.resolve({ success: true, message: "Uploaded" }),
  ),
};

mock.module("@/services/SubmoltService", () => ({
  default: mockSubmoltService,
}));

// Mock auth middleware removed - using real middleware with mock data

// Mock upload middleware
mock.module("@/middleware/upload", () => ({
  avatarUpload: {
    single: () => (req: Request, res: Response, next: NextFunction) => next(),
  },
  bannerUpload: {
    single: () => (req: Request, res: Response, next: NextFunction) => next(),
  },
}));

describe("Submolts Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/submolts should return all submolts", async () => {
    const res = await request(app)
      .get("/api/v1/submolts")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("POST /api/v1/submolts should create submolt", async () => {
    const res = await request(app)
      .post("/api/v1/submolts")
      .set("Authorization", "Bearer openclaw_abc123")
      .send({ name: "tech", display_name: "Technology" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.submolt.name).toBe("tech");
  });

  it("GET /api/v1/submolts/:name should return submolt info", async () => {
    const res = await request(app)
      .get("/api/v1/submolts/tech")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(200);
    expect(res.body.submolt.name).toBe("tech");
  });

  it("POST /api/v1/submolts/:name/subscribe should subscribe", async () => {
    const res = await request(app)
      .post("/api/v1/submolts/tech/subscribe")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

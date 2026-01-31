import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Request, Response, NextFunction } from "express";

// Mock Supabase client
const mockQuery: any = Promise.resolve({ count: 10, data: [] });
mockQuery.eq = mock(() =>
  Promise.resolve({
    data: [{ api_key: "openclaw_abc123", name: "TestClaw" }],
    error: null,
  } as any),
);

const mockClient = {
  from: mock(() => ({
    select: mock(() => mockQuery),
  })),
};

// Mock SupabaseService
const mockSupabaseService = {
  getInstance: mock(() => ({
    isConnected: mock(() => Promise.resolve(true)),
    getClient: mock(() => mockClient),
  })),
};

mock.module("@/lib/supabase", () => ({
  default: mockSupabaseService,
}));

// Mock auth middleware removed - using real middleware with mock data

// Mock fs
// We need to be careful not to break other imports that use fs
mock.module("fs", () => {
  return {
    default: {
      readFileSync: mock(() => "SCHEMA SQL CONTENT"),
    },
    readFileSync: mock(() => "SCHEMA SQL CONTENT"),
  };
});

describe("Database Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/database/health should return health status", async () => {
    const res = await request(app).get("/api/v1/database/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("ok");
    expect(res.body.connected).toBe(true);
  });

  it("GET /api/v1/database/stats should return stats", async () => {
    const res = await request(app)
      .get("/api/v1/database/stats")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.stats.agents).toBe(10);
  });

  it("POST /api/v1/database/init should return instructions", async () => {
    const res = await request(app).post("/api/v1/database/init");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.instructions).toHaveLength(5);
  });
});

import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Job } from "@/types/models";

// Mock JobService
const mockJobService = {
  getAllJobs: mock(() => Promise.resolve([] as Job[])),
};

mock.module("@/services/JobService", () => ({
  default: mockJobService,
}));

describe("Jobs Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/jobs should return all jobs", async () => {
    const res = await request(app).get("/api/v1/jobs");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });
});

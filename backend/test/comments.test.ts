import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Comment } from "@/models/comment";
import type { Request, Response, NextFunction } from "express";

const mockComment: Comment = {
  id: "comment_123",
  post_id: "post_123",
  text: "Test comment",
  upvotes: 0,
  downvotes: 0,
  author_id: "openclaw_abc123_id",
  author: { name: "test_agent" },
  cont_type: "comment",
  is_pinned: false,
  created_at: new Date().toISOString(),
  parent_id: null,
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

// Mock CommentService
const mockCommentService = {
  getCommentsByPostId: mock(() => Promise.resolve([] as Comment[])),
  createComment: mock(
    (data: {
      postId: string;
      text: string;
      authorName: string;
      parentId?: string;
    }) =>
      Promise.resolve({
        ...mockComment,
        id: "comment_123",
        post_id: data.postId,
        text: data.text,
        author: { name: data.authorName },
        parent_id: data.parentId || null,
      }),
  ),
  upvoteComment: mock(() =>
    Promise.resolve({ success: true, message: "Upvoted" }),
  ),
  downvoteComment: mock(() =>
    Promise.resolve({ success: true, message: "Downvoted" }),
  ),
  replyToComment: mock((id: string, text: string, agentName: string) =>
    Promise.resolve({
      ...mockComment,
      id: "reply_123",
      parent_id: id,
      text,
      author: { name: agentName },
    }),
  ),
};

mock.module("@/services/CommentService", () => ({
  default: mockCommentService,
}));

// Mock AgentRepository for auth
const mockTestAgent = {
  id: "openclaw_abc123_id",
  api_key: "openclaw_abc123",
  name: "TestClaw",
  description: "Test agent for auth",
  is_claimed: true,
  is_active: true,
  skills: [],
  created_at: new Date().toISOString(),
};

mock.module("@/repositories/AgentRepository", () => ({
  default: {
    findByApiKey: mock((apiKey: string) => {
      if (apiKey === "openclaw_abc123") {
        return Promise.resolve(mockTestAgent);
      }
      return Promise.resolve(null);
    }),
    findByName: mock(() => Promise.resolve(null)),
    findAll: mock(() => Promise.resolve([])),
    create: mock(() => Promise.resolve(mockTestAgent)),
    update: mock(() => Promise.resolve(mockTestAgent)),
    delete: mock(() => Promise.resolve(true)),
  },
}));

// Mock auth middleware removed - using real middleware with mock data

describe("Comments Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/posts/:postId/comments should return comments", async () => {
    const res = await request(app)
      .get("/api/v1/posts/post_123/comments")
      .set("Authorization", "Bearer openclaw_abc123");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("POST /api/v1/posts/:postId/comments should create comment", async () => {
    const res = await request(app)
      .post("/api/v1/posts/post_123/comments")
      .set("Authorization", "Bearer openclaw_abc123")
      .send({ text: "Nice post!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.comment.text).toBe("Nice post!");
  });

  it("POST /api/v1/comments/:id/reply should reply", async () => {
    const res = await request(app)
      .post("/api/v1/comments/comment_123/reply")
      .set("Authorization", "Bearer openclaw_abc123")
      .send({ text: "Reply" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.comment.parent_id).toBe("comment_123");
  });
});

import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Comment } from "@/types/models";
import type { Request, Response, NextFunction } from "express";

const mockComment: Comment = {
  id: "comment_123",
  post_id: "post_123",
  content: "Test comment",
  upvotes: 0,
  downvotes: 0,
  author: { name: "test_agent" },
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
      content: string;
      authorName: string;
      parentId?: string;
    }) =>
      Promise.resolve({
        ...mockComment,
        id: "comment_123",
        post_id: data.postId,
        content: data.content,
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
  replyToComment: mock((id: string, content: string, agentName: string) =>
    Promise.resolve({
      ...mockComment,
      id: "reply_123",
      parent_id: id,
      content,
      author: { name: agentName },
    }),
  ),
};

mock.module("@/services/CommentService", () => ({
  default: mockCommentService,
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
      .send({ content: "Nice post!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.comment.content).toBe("Nice post!");
  });

  it("POST /api/v1/comments/:id/reply should reply", async () => {
    const res = await request(app)
      .post("/api/v1/comments/comment_123/reply")
      .set("Authorization", "Bearer openclaw_abc123")
      .send({ content: "Reply" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.comment.parent_id).toBe("comment_123");
  });
});

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

describe("Comments Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/posts/:postId/comments should return comments", async () => {
    const res = await request(app).get("/api/v1/posts/post_123/comments");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("POST /api/v1/posts/:postId/comments should create comment", async () => {
    const res = await request(app)
      .post("/api/v1/posts/post_123/comments")
      .send({ content: "Nice post!" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.comment.content).toBe("Nice post!");
  });

  it("POST /api/v1/comments/:id/reply should reply", async () => {
    const res = await request(app)
      .post("/api/v1/comments/comment_123/reply")
      .send({ content: "Reply" });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.comment.parent_id).toBe("comment_123");
  });
});

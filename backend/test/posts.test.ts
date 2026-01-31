import { describe, it, expect, mock, beforeAll } from "bun:test";
import request from "supertest";
import type { Post } from "@/types/models";
import type { Request, Response, NextFunction } from "express";

const mockPost: Post = {
  id: "post_123",
  title: "Test Post",
  content: "Content",
  submolt: "general",
  upvotes: 0,
  downvotes: 0,
  author: { name: "test_agent" },
  created_at: new Date().toISOString(),
  is_pinned: false,
};

// Mock PostService
const mockPostService = {
  getPosts: mock(() => Promise.resolve([] as Post[])),
  createPost: mock(
    (data: {
      submolt: string;
      title: string;
      content?: string;
      url?: string;
      authorName: string;
    }) =>
      Promise.resolve({
        ...mockPost,
        ...data,
        author: { name: data.authorName },
      }),
  ),
  getPostById: mock((id: string) =>
    Promise.resolve({
      ...mockPost,
      id,
    }),
  ),
  deletePost: mock((id: string) => Promise.resolve(true)),
  upvotePost: mock((id: string) =>
    Promise.resolve({ success: true, message: "Upvoted" }),
  ),
  downvotePost: mock((id: string) =>
    Promise.resolve({ success: true, message: "Downvoted" }),
  ),
  pinPost: mock((id: string) =>
    Promise.resolve({ success: true, message: "Pinned" }),
  ),
  unpinPost: mock((id: string) =>
    Promise.resolve({ success: true, message: "Unpinned" }),
  ),
};

mock.module("@/services/PostService", () => ({
  default: mockPostService,
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

describe("Posts Routes", () => {
  let app: import("express").Application;

  beforeAll(async () => {
    const mod = await import("../src/app");
    app = mod.default as unknown as import("express").Application;
  });

  it("GET /api/v1/posts should return posts", async () => {
    const res = await request(app).get("/api/v1/posts");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it("POST /api/v1/posts should create post", async () => {
    const res = await request(app).post("/api/v1/posts").send({
      submolt: "general",
      title: "New Post",
      content: "Hello world",
    });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.post.title).toBe("New Post");
  });

  it("GET /api/v1/posts/:id should return post", async () => {
    const res = await request(app).get("/api/v1/posts/123");
    expect(res.status).toBe(200);
    expect(res.body.post.id).toBe("123");
  });

  it("DELETE /api/v1/posts/:id should delete post", async () => {
    const res = await request(app).delete("/api/v1/posts/123");
    expect(res.status).toBe(200);
  });
});

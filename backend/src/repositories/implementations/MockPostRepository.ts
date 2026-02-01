import type {
  IPostRepository,
  PostFilters,
} from "@/repositories/interfaces/IPostRepository";
import type { Post } from "@/types/models";
import { mockPosts } from "@/data/mock";

export class MockPostRepository implements IPostRepository {
  async findById(id: string): Promise<Post | null> {
    return mockPosts.find((p) => p.id === id) || null;
  }

  async findBySubmolt(submoltName: string): Promise<Post[]> {
    return this.findAll({ submolt: submoltName });
  }

  async findByAuthor(authorName: string): Promise<Post[]> {
    return this.findAll({ author: authorName });
  }

  async findAll(filters: PostFilters = {}): Promise<Post[]> {
    let posts = [...mockPosts];

    if (filters.submolt) {
      posts = posts.filter((p) => p.submolt === filters.submolt);
    }

    if (filters.author) {
      posts = posts.filter((p) => p.author.name === filters.author);
    }

    if (filters.sort === "new") {
      posts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else if (filters.sort === "top") {
      posts.sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes));
    } else if (filters.sort === "rising") {
      posts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else {
      // Default sort
      posts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    }

    if (filters.limit) {
      posts = posts.slice(0, filters.limit);
    }

    return posts;
  }

  async create(
    data: Omit<
      Post,
      "id" | "upvotes" | "downvotes" | "created_at" | "is_pinned"
    >,
  ): Promise<Post> {
    const newPost: Post = {
      id: `post_${Date.now()}`,
      ...data,
      upvotes: 0,
      downvotes: 0,
      created_at: new Date().toISOString(),
      is_pinned: false,
    };
    mockPosts.unshift(newPost);
    return newPost;
  }

  async delete(id: string): Promise<boolean> {
    const index = mockPosts.findIndex((p) => p.id === id);
    if (index === -1) return false;
    mockPosts.splice(index, 1);
    return true;
  }

  async incrementUpvotes(id: string): Promise<Post | null> {
    const post = mockPosts.find((p) => p.id === id);
    if (!post) return null;
    post.upvotes++;
    return post;
  }

  async incrementDownvotes(id: string): Promise<Post | null> {
    const post = mockPosts.find((p) => p.id === id);
    if (!post) return null;
    post.downvotes++;
    return post;
  }

  async togglePin(id: string, pinned: boolean): Promise<Post | null> {
    const post = mockPosts.find((p) => p.id === id);
    if (!post) return null;
    post.is_pinned = pinned;
    return post;
  }
}

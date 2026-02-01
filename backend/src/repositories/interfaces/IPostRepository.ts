import type { Post } from "@/models/post";

export interface PostFilters {
  sort?: "hot" | "new" | "top" | "rising";
  limit?: number;
  submolt?: string; // This will query against submolt_id in the view
  author?: string; // This will query against author_id in the view
}

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findBySubmolt(submoltId: string): Promise<Post[]>;
  findByAuthor(authorId: string): Promise<Post[]>;
  findAll(filters?: PostFilters): Promise<Post[]>;
  create(
    data: Omit<
      Post,
      "id" | "upvotes" | "downvotes" | "created_at" | "is_pinned" | "author" | "type"
    >,
  ): Promise<Post>;
  delete(id: string): Promise<boolean>;
  incrementUpvotes(id: string): Promise<Post | null>;
  incrementDownvotes(id: string): Promise<Post | null>;
  togglePin(id: string, pinned: boolean): Promise<Post | null>;
}

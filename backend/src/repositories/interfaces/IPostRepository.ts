import type { Post } from "@/types/models";

export interface PostFilters {
  sort?: "hot" | "new" | "top" | "rising";
  limit?: number;
  submolt?: string;
  author?: string;
}

export interface IPostRepository {
  findById(id: string): Promise<Post | null>;
  findBySubmolt(submoltName: string): Promise<Post[]>;
  findByAuthor(authorName: string): Promise<Post[]>;
  findAll(filters?: PostFilters): Promise<Post[]>;
  create(
    data: Omit<
      Post,
      "id" | "upvotes" | "downvotes" | "created_at" | "is_pinned"
    >,
  ): Promise<Post>;
  delete(id: string): Promise<boolean>;
  incrementUpvotes(id: string): Promise<Post | null>;
  incrementDownvotes(id: string): Promise<Post | null>;
  togglePin(id: string, pinned: boolean): Promise<Post | null>;
}

import type { Comment } from "@/models/comment";

export interface ICommentRepository {
    findById(id: string): Promise<Comment | null>;
    findByPostId(postId: string): Promise<Comment[]>;
    findByAuthor(authorId: string): Promise<Comment[]>;
    create(
        data: Omit<
            Comment,
            "id" | "upvotes" | "downvotes" | "created_at" | "author" | "type" | "is_pinned"
        >,
    ): Promise<Comment>;
    delete(id: string): Promise<boolean>;
    incrementUpvotes(id: string): Promise<Comment | null>;
    incrementDownvotes(id: string): Promise<Comment | null>;
    togglePin(id: string, pinned: boolean): Promise<Comment | null>;
}

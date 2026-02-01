import type { ICommentRepository } from "@/repositories/interfaces/ICommentRepository";
import type { Comment } from "@/models/comment";
import { mockComments } from "@/data/mock";

export class MockCommentRepository implements ICommentRepository {
    async findById(id: string): Promise<Comment | null> {
        return mockComments.find((c) => c.id === id) || null;
    }

    async findByPostId(postId: string): Promise<Comment[]> {
        return mockComments.filter((c) => c.post_id === postId);
    }

    async findByAuthor(authorId: string): Promise<Comment[]> {
        return mockComments.filter((c) => c.author_id === authorId);
    }

    async create(
        data: Omit<
            Comment,
            "id" | "upvotes" | "downvotes" | "created_at" | "author" | "type" | "is_pinned"
        >,
    ): Promise<Comment> {
        const newComment: Comment = {
            ...data,
            id: `comment_${Date.now()}`,
            upvotes: 0,
            downvotes: 0,
            created_at: new Date().toISOString(),
            cont_type: "comment",
            is_pinned: false,
            author_id: "openclaw_abc123_id", // Default mock author
            author: { name: "Mock User" },
        };
        mockComments.push(newComment);
        return newComment;
    }

    async delete(id: string): Promise<boolean> {
        const index = mockComments.findIndex((c) => c.id === id);
        if (index === -1) return false;
        mockComments.splice(index, 1);
        return true;
    }

    async incrementUpvotes(id: string): Promise<Comment | null> {
        const comment = mockComments.find((c) => c.id === id);
        if (!comment) return null;
        comment.upvotes++;
        return comment;
    }

    async incrementDownvotes(id: string): Promise<Comment | null> {
        const comment = mockComments.find((c) => c.id === id);
        if (!comment) return null;
        comment.downvotes++;
        return comment;
    }

    async togglePin(id: string, pinned: boolean): Promise<Comment | null> {
        const comment = mockComments.find((c) => c.id === id);
        if (!comment) return null;
        comment.is_pinned = pinned;
        return comment;
    }
}

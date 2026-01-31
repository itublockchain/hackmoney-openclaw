import type { Comment } from "../src/types/models";
import { mockComments } from "../data/mock";

export class CommentRepository {
    findById(id: string): Comment | null {
        return mockComments.find((c) => c.id === id) || null;
    }

    findByPostId(postId: string): Comment[] {
        return mockComments.filter((c) => c.post_id === postId);
    }

    create(data: Omit<Comment, "id" | "upvotes" | "downvotes" | "created_at">): Comment {
        const newComment: Comment = {
            id: `comment_${Date.now()}`,
            ...data,
            upvotes: 0,
            downvotes: 0,
            created_at: new Date().toISOString(),
        };
        mockComments.push(newComment);
        return newComment;
    }

    incrementUpvotes(id: string): Comment | null {
        const comment = this.findById(id);
        if (!comment) return null;
        comment.upvotes++;
        return comment;
    }

    incrementDownvotes(id: string): Comment | null {
        const comment = this.findById(id);
        if (!comment) return null;
        comment.downvotes++;
        return comment;
    }

    getAll(): Comment[] {
        return mockComments;
    }
}

export default new CommentRepository();

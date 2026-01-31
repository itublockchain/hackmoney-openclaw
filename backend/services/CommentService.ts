import CommentRepository from "../repositories/CommentRepository";
import type { Comment } from "../src/types/models";

export class CommentService {
    getCommentsByPostId(postId: string, sort?: "top" | "new" | "controversial"): Comment[] {
        let comments = CommentRepository.findByPostId(postId);

        // Sort comments if specified
        if (sort === "top") {
            comments.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        } else if (sort === "new") {
            comments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sort === "controversial") {
            // Controversial: high engagement but balanced votes
            comments.sort((a, b) => {
                const aControversy = Math.min(a.upvotes, a.downvotes);
                const bControversy = Math.min(b.upvotes, b.downvotes);
                return bControversy - aControversy;
            });
        }

        return comments;
    }

    createComment(data: {
        postId: string;
        content: string;
        authorName: string;
        parentId?: string;
    }): Comment {
        return CommentRepository.create({
            post_id: data.postId,
            content: data.content,
            author: { name: data.authorName },
            parent_id: data.parentId || null,
        });
    }

    upvoteComment(id: string): { success: boolean; message: string } | null {
        const comment = CommentRepository.incrementUpvotes(id);
        if (!comment) return null;

        return { success: true, message: "Upvoted comment" };
    }

    downvoteComment(id: string): { success: boolean; message: string } | null {
        const comment = CommentRepository.incrementDownvotes(id);
        if (!comment) return null;

        return { success: true, message: "Downvoted comment" };
    }

    replyToComment(commentId: string, content: string, authorName: string): Comment | null {
        const parentComment = CommentRepository.findById(commentId);
        if (!parentComment) return null;

        return CommentRepository.create({
            post_id: parentComment.post_id,
            content,
            author: { name: authorName },
            parent_id: commentId,
        });
    }
}

export default new CommentService();

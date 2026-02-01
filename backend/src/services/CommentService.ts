import CommentRepository from "@/repositories/CommentRepository";
import type { Comment } from "@/types/models";

export class CommentService {
  async getCommentsByPostId(
    postId: string,
    sort?: "top" | "new" | "controversial",
  ): Promise<Comment[]> {
    let comments = await CommentRepository.findByPostId(postId);

    // Sort comments if specified
    if (sort === "top") {
      comments.sort(
        (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes),
      );
    } else if (sort === "new") {
      comments.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
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

  async createComment(data: {
    postId: string;
    content: string;
    authorName: string;
    parentId?: string;
  }): Promise<Comment> {
    return CommentRepository.create({
      post_id: data.postId,
      content: data.content,
      author: { name: data.authorName },
      parent_id: data.parentId || null,
    });
  }

  async upvoteComment(
    id: string,
  ): Promise<{ success: boolean; message: string } | null> {
    const comment = await CommentRepository.incrementUpvotes(id);
    if (!comment) return null;

    return { success: true, message: "Upvoted comment" };
  }

  async downvoteComment(
    id: string,
  ): Promise<{ success: boolean; message: string } | null> {
    const comment = await CommentRepository.incrementDownvotes(id);
    if (!comment) return null;

    return { success: true, message: "Downvoted comment" };
  }

  async replyToComment(
    commentId: string,
    content: string,
    authorName: string,
  ): Promise<Comment | null> {
    const parentComment = await CommentRepository.findById(commentId);
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

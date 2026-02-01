import PostRepository from "@/repositories/PostRepository";
import type { PostFilters } from "@/repositories/interfaces/IPostRepository";
import config from "@/config";
import type { Post } from "@/models/post";

export type { PostFilters };

export class PostService {
  async getPosts(filters: PostFilters = {}): Promise<Post[]> {
    return PostRepository.findAll(filters);
  }

  async getPostById(id: string): Promise<Post | null> {
    return PostRepository.findById(id);
  }

  async createPost(data: {
    submolt: string;
    title: string;
    text: string;
    authorId?: string;
  }): Promise<Post> {
    return PostRepository.create({
      title: data.title,
      text: data.text,
      submolt_id: data.submolt,
      author_id: data.authorId || "", // Should be required but preserving partial compat
      cont_type: "post",
    });
  }

  async deletePost(id: string): Promise<boolean> {
    return PostRepository.delete(id);
  }

  async upvotePost(
    id: string,
    authorName?: string,
  ): Promise<{
    success: boolean;
    message: string;
    author?: { name: string };
    already_following?: boolean;
    suggestion?: string;
  } | null> {
    const post = await PostRepository.incrementUpvotes(id);
    if (!post) return null;

    return {
      success: true,
      message: `Upvoted! ${config.APP_EMOJI}`,
      author: post.author,
      already_following: false,
      suggestion: `If you enjoy ${post.author?.name || "Unknown"}'s posts, consider following them!`,
    };
  }

  async downvotePost(
    id: string,
  ): Promise<{ success: boolean; message: string } | null> {
    const post = await PostRepository.incrementDownvotes(id);
    if (!post) return null;

    return { success: true, message: "Downvoted" };
  }

  async pinPost(
    id: string,
  ): Promise<{ success: boolean; message: string } | null> {
    const post = await PostRepository.togglePin(id, true);
    if (!post) return null;

    return { success: true, message: "Post pinned" };
  }

  async unpinPost(
    id: string,
  ): Promise<{ success: boolean; message: string } | null> {
    const post = await PostRepository.togglePin(id, false);
    if (!post) return null;

    return { success: true, message: "Post unpinned" };
  }
}

export default new PostService();

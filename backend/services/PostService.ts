import PostRepository from "../repositories/PostRepository";
import config from "../config";
import type { Post } from "../src/types/models";

export interface PostFilters {
    sort?: "hot" | "new" | "top" | "rising";
    limit?: number;
    submolt?: string;
}

export class PostService {
    getPosts(filters: PostFilters = {}): Post[] {
        let posts = PostRepository.getAll();

        // Filter by submolt if specified
        if (filters.submolt) {
            posts = posts.filter((p) => p.submolt === filters.submolt);
        }

        // Sort posts
        if (filters.sort === "new") {
            posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (filters.sort === "top") {
            posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        } else if (filters.sort === "rising") {
            posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        }

        // Apply limit
        if (filters.limit) {
            posts = posts.slice(0, filters.limit);
        }

        return posts;
    }

    getPostById(id: string): Post | null {
        return PostRepository.findById(id);
    }

    createPost(data: {
        submolt: string;
        title: string;
        content?: string;
        url?: string;
        authorName: string;
    }): Post {
        return PostRepository.create({
            title: data.title,
            content: data.content || null,
            url: data.url || null,
            submolt: data.submolt,
            author: { name: data.authorName },
        });
    }

    deletePost(id: string): boolean {
        return PostRepository.delete(id);
    }

    upvotePost(id: string, authorName?: string): {
        success: boolean;
        message: string;
        author?: { name: string };
        already_following?: boolean;
        suggestion?: string;
    } | null {
        const post = PostRepository.incrementUpvotes(id);
        if (!post) return null;

        return {
            success: true,
            message: `Upvoted! ${config.APP_EMOJI}`,
            author: post.author,
            already_following: false,
            suggestion: `If you enjoy ${post.author.name}'s posts, consider following them!`,
        };
    }

    downvotePost(id: string): { success: boolean; message: string } | null {
        const post = PostRepository.incrementDownvotes(id);
        if (!post) return null;

        return { success: true, message: "Downvoted" };
    }

    pinPost(id: string): { success: boolean; message: string } | null {
        const post = PostRepository.togglePin(id, true);
        if (!post) return null;

        return { success: true, message: "Post pinned" };
    }

    unpinPost(id: string): { success: boolean; message: string } | null {
        const post = PostRepository.togglePin(id, false);
        if (!post) return null;

        return { success: true, message: "Post unpinned" };
    }
}

export default new PostService();

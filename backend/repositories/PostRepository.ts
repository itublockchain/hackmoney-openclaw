import type { Post } from "../src/types/models";
import { mockPosts } from "../data/mock";

export class PostRepository {
    findById(id: string): Post | null {
        return mockPosts.find((p) => p.id === id) || null;
    }

    findBySubmolt(submolt: string): Post[] {
        return mockPosts.filter((p) => p.submolt === submolt);
    }

    findByAuthor(authorName: string): Post[] {
        return mockPosts.filter((p) => p.author.name === authorName);
    }

    getAll(): Post[] {
        return [...mockPosts];
    }

    create(data: Omit<Post, "id" | "upvotes" | "downvotes" | "created_at" | "is_pinned">): Post {
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

    delete(id: string): boolean {
        const index = mockPosts.findIndex((p) => p.id === id);
        if (index === -1) return false;
        mockPosts.splice(index, 1);
        return true;
    }

    incrementUpvotes(id: string): Post | null {
        const post = this.findById(id);
        if (!post) return null;
        post.upvotes++;
        return post;
    }

    incrementDownvotes(id: string): Post | null {
        const post = this.findById(id);
        if (!post) return null;
        post.downvotes++;
        return post;
    }

    togglePin(id: string, pinned: boolean): Post | null {
        const post = this.findById(id);
        if (!post) return null;
        post.is_pinned = pinned;
        return post;
    }
}

export default new PostRepository();

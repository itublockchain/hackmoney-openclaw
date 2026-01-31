import PostRepository from "../repositories/PostRepository";
import CommentRepository from "../repositories/CommentRepository";
import type { Post, Comment } from "../src/types/models";

export class FeedService {
    getPersonalizedFeed(
        agentName: string,
        sort?: "hot" | "new" | "top",
        limit?: number
    ): Post[] {
        let posts = PostRepository.getAll();

        // Sort posts
        if (sort === "new") {
            posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sort === "top") {
            posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        }
        // Default "hot" could use a more complex algorithm

        // Apply limit
        if (limit) {
            posts = posts.slice(0, limit);
        }

        return posts;
    }

    search(
        query: string,
        type?: "posts" | "comments" | "all",
        limit?: number
    ): {
        results: Array<(Post | Comment) & { type: string; similarity: number }>;
        count: number;
    } {
        const searchQuery = query.toLowerCase();
        let results: any[] = [];

        // Search posts
        if (type !== "comments") {
            const matchingPosts = PostRepository.getAll()
                .filter(
                    (p) =>
                        p.title.toLowerCase().includes(searchQuery) ||
                        p.content?.toLowerCase().includes(searchQuery)
                )
                .map((p) => ({
                    ...p,
                    type: "post",
                    similarity: 0.8,
                    post_id: p.id,
                }));
            results.push(...matchingPosts);
        }

        // Search comments
        if (type !== "posts") {
            const allPosts = PostRepository.getAll();
            const allComments: Comment[] = [];

            // Collect all comments from all posts
            allPosts.forEach(post => {
                const comments = CommentRepository.findByPostId(post.id);
                allComments.push(...comments);
            });

            const matchingComments = allComments
                .filter((c) => c.content.toLowerCase().includes(searchQuery))
                .map((c) => ({
                    ...c,
                    type: "comment",
                    similarity: 0.75,
                    post: { id: c.post_id },
                }));
            results.push(...matchingComments);
        }

        // Apply limit
        if (limit) {
            results = results.slice(0, limit);
        }

        return {
            results,
            count: results.length,
        };
    }
}

export default new FeedService();

import PostRepository from "@/repositories/PostRepository";
import CommentRepository from "@/repositories/CommentRepository";
import type { Post, Comment } from "@/types/models";

export class FeedService {
  async getPersonalizedFeed(
    agentName: string,
    sort?: "hot" | "new" | "top",
    limit?: number,
  ): Promise<Post[]> {
    // Use findAll instead of getAll and pass sort parameters
    let posts = await PostRepository.findAll({
      sort: sort === "hot" ? undefined : sort, // map hot to undefined/default for now or handle in repo
      limit,
    });

    // The repo handles sorting, but let's double check if we need to do anything here
    // If "hot" logic is complex and not in repo, we might need to do it here.
    // For now, let's assume repo handles basic sorts.

    return posts;
  }

  async search(
    query: string,
    type?: "posts" | "comments" | "all",
    limit?: number,
  ): Promise<{
    results: Array<(Post | Comment) & { type: string; similarity: number }>;
    count: number;
  }> {
    const searchQuery = query.toLowerCase();
    let results: any[] = [];

    // Search posts
    if (type !== "comments") {
      const allPosts = await PostRepository.findAll();
      const matchingPosts = allPosts
        .filter(
          (p) =>
            p.title.toLowerCase().includes(searchQuery) ||
            p.content?.toLowerCase().includes(searchQuery),
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
      const allPosts = await PostRepository.findAll();
      const allComments: Comment[] = [];

      // This is inefficient (N+1), but keeping structure for now.
      // Better: CommentRepository.findAll() if it exists or search comments directly.
      // CommentRepository has getAll().

      const comments = await CommentRepository.getAll();

      const matchingComments = comments
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

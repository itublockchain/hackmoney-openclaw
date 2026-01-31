import PostRepository from "../repositories/PostRepository";
import CommentRepository from "../repositories/CommentRepository";

export class SearchService {
    /**
     * Search across posts and comments using simple text matching
     * For a hackathon, this is a basic implementation
     * In production, you'd use vector embeddings and semantic search
     */
    search(query: string, options: {
        type?: 'all' | 'posts' | 'comments';
        limit?: number;
    } = {}) {
        const { type = 'all', limit = 20 } = options;
        const results: any[] = [];
        const lowerQuery = query.toLowerCase();

        // Search posts
        if (type === 'all' || type === 'posts') {
            const posts = PostRepository.getAll();
            const matchingPosts = posts.filter(post => {
                const titleMatch = post.title.toLowerCase().includes(lowerQuery);
                const contentMatch = post.content?.toLowerCase().includes(lowerQuery);
                return titleMatch || contentMatch;
            }).map(post => ({
                ...post,
                type: 'post',
                post_id: post.id,
                similarity: this.calculateSimilarity(query, post.title + ' ' + (post.content || '')),
            }));
            results.push(...matchingPosts);
        }

        // Search comments
        if (type === 'all' || type === 'comments') {
            const comments = CommentRepository.getAll();
            const matchingComments = comments.filter(comment =>
                comment.content.toLowerCase().includes(lowerQuery)
            ).map(comment => ({
                ...comment,
                type: 'comment',
                title: null,
                post_id: comment.post_id,
                similarity: this.calculateSimilarity(query, comment.content),
            }));
            results.push(...matchingComments);
        }

        // Sort by similarity score (higher is better)
        results.sort((a, b) => b.similarity - a.similarity);

        // Limit results
        return results.slice(0, limit);
    }

    /**
     * Simple similarity calculation based on keyword matching
     * Returns a score between 0 and 1
     */
    private calculateSimilarity(query: string, text: string): number {
        const queryWords = query.toLowerCase().split(/\s+/);
        const textLower = text.toLowerCase();

        let matches = 0;
        queryWords.forEach(word => {
            if (textLower.includes(word)) {
                matches++;
            }
        });

        return matches / queryWords.length;
    }
}

export default new SearchService();

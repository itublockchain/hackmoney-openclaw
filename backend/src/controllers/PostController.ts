import type { Request, Response } from "express";
import PostService from "@/services/PostService";
import CommentService from "@/services/CommentService";

export default class PostController {
    static async getPosts(req: Request, res: Response) {
        try {
            const { sort, limit, submolt } = req.query;

            const posts = await PostService.getPosts({
                sort: sort as any,
                limit: limit ? Number(limit) : undefined,
                submolt: submolt as string,
            });

            res.json({ success: true, posts });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch posts" });
        }
    }

    static async createPost(req: Request, res: Response) {
        try {
            const { submolt, title, text, url } = req.body;

            if (!submolt || !title) {
                res
                    .status(400)
                    .json({ success: false, error: "submolt and title are required" });
                return;
            }

            const agentId = req.agent?.id;

            const newPost = await PostService.createPost({
                submolt,
                title,
                text, // Was content
                authorId: agentId,
            });

            res.json({ success: true, post: newPost });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to create post" });
        }
    }

    static async getPostById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== "string") {
                res.status(400).json({ success: false, error: "Invalid post ID" });
                return;
            }

            const post = await PostService.getPostById(id);
            if (!post) {
                res.status(404).json({ success: false, error: "Post not found" });
                return;
            }
            res.json({ success: true, post });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to fetch post" });
        }
    }

    static async deletePost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== "string") {
                res.status(400).json({ success: false, error: "Invalid post ID" });
                return;
            }

            const deleted = await PostService.deletePost(id);
            if (!deleted) {
                res.status(404).json({ success: false, error: "Post not found" });
                return;
            }
            res.json({ success: true, message: "Post deleted" });
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to delete post" });
        }
    }

    static async upvotePost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== "string") {
                res.status(400).json({ success: false, error: "Invalid post ID" });
                return;
            }

            const result = await PostService.upvotePost(id, req.agent?.name);
            if (!result) {
                res.status(404).json({ success: false, error: "Post not found" });
                return;
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to upvote post" });
        }
    }

    static async downvotePost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== "string") {
                res.status(400).json({ success: false, error: "Invalid post ID" });
                return;
            }

            const result = await PostService.downvotePost(id);
            if (!result) {
                res.status(404).json({ success: false, error: "Post not found" });
                return;
            }
            res.json(result);
        } catch (error) {
            res
                .status(500)
                .json({ success: false, error: "Failed to downvote post" });
        }
    }

    static async pinPost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== "string") {
                res.status(400).json({ success: false, error: "Invalid post ID" });
                return;
            }

            const result = await PostService.pinPost(id);
            if (!result) {
                res.status(404).json({ success: false, error: "Post not found" });
                return;
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to pin post" });
        }
    }

    static async unpinPost(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id || typeof id !== "string") {
                res.status(400).json({ success: false, error: "Invalid post ID" });
                return;
            }

            const result = await PostService.unpinPost(id);
            if (!result) {
                res.status(404).json({ success: false, error: "Post not found" });
                return;
            }
            res.json(result);
        } catch (error) {
            res.status(500).json({ success: false, error: "Failed to unpin post" });
        }
    }

    static async getPostComments(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const { sort } = req.query;

            if (!postId || typeof postId !== "string") {
                res.status(400).json({ success: false, error: "Invalid post ID" });
                return;
            }

            const comments = await CommentService.getCommentsByPostId(
                postId,
                sort as any,
            );
            res.json({ success: true, comments });
        } catch (error) {
            res
                .status(500)
                .json({ success: false, error: "Failed to fetch comments" });
        }
    }

    static async addPostComment(req: Request, res: Response) {
        try {
            const { postId } = req.params;
            const { text, parent_id } = req.body;

            if (!postId || typeof postId !== "string") {
                res.status(400).json({ success: false, error: "Invalid post ID" });
                return;
            }

            if (!text) {
                res.status(400).json({ success: false, error: "text is required" });
                return;
            }

            const agentName = req.agent?.name || "Unknown";
            const newComment = await CommentService.createComment({
                postId,
                text,
                authorName: agentName,
                parentId: parent_id,
            });

            res.json({ success: true, comment: newComment });
        } catch (error) {
            res
                .status(500)
                .json({ success: false, error: "Failed to create comment" });
        }
    }
}

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import PostService from "../services/PostService";
import CommentService from "../services/CommentService";

const router = Router();

/**
 * @swagger
 * /api/v1/posts:
 *   get:
 *     summary: Get posts
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [hot, new, top, rising]
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: submolt
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of posts
 */
router.get("/", authMiddleware, (req, res) => {
    const { sort, limit, submolt } = req.query;

    const posts = PostService.getPosts({
        sort: sort as any,
        limit: limit ? Number(limit) : undefined,
        submolt: submolt as string,
    });

    res.json({ success: true, posts });
});

/**
 * @swagger
 * /api/v1/posts:
 *   post:
 *     summary: Create a new post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - submolt
 *               - title
 *             properties:
 *               submolt:
 *                 type: string
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Post created
 *       400:
 *         description: Missing required fields
 */
router.post("/", authMiddleware, (req, res) => {
    const { submolt, title, content, url } = req.body;

    if (!submolt || !title) {
        res.status(400).json({ success: false, error: "submolt and title are required" });
        return;
    }

    const agentName = req.agent?.name || "Unknown";
    const newPost = PostService.createPost({
        submolt,
        title,
        content,
        url,
        authorName: agentName,
    });

    res.json({ success: true, post: newPost });
});

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   get:
 *     summary: Get a single post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post details
 *       404:
 *         description: Post not found
 */
router.get("/:id", authMiddleware, (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: "Invalid post ID" });
        return;
    }

    const post = PostService.getPostById(id);
    if (!post) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
    }
    res.json({ success: true, post });
});

/**
 * @swagger
 * /api/v1/posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post deleted
 *       404:
 *         description: Post not found
 */
router.delete("/:id", authMiddleware, (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: "Invalid post ID" });
        return;
    }

    const deleted = PostService.deletePost(id);
    if (!deleted) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
    }
    res.json({ success: true, message: "Post deleted" });
});

/**
 * @swagger
 * /api/v1/posts/{id}/upvote:
 *   post:
 *     summary: Upvote a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post upvoted
 *       404:
 *         description: Post not found
 */
router.post("/:id/upvote", authMiddleware, (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: "Invalid post ID" });
        return;
    }

    const result = PostService.upvotePost(id, req.agent?.name);
    if (!result) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
    }
    res.json(result);
});

/**
 * @swagger
 * /api/v1/posts/{id}/downvote:
 *   post:
 *     summary: Downvote a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post downvoted
 *       404:
 *         description: Post not found
 */
router.post("/:id/downvote", authMiddleware, (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: "Invalid post ID" });
        return;
    }

    const result = PostService.downvotePost(id);
    if (!result) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
    }
    res.json(result);
});

/**
 * @swagger
 * /api/v1/posts/{id}/pin:
 *   post:
 *     summary: Pin a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post pinned
 */
router.post("/:id/pin", authMiddleware, (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: "Invalid post ID" });
        return;
    }

    const result = PostService.pinPost(id);
    if (!result) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
    }
    res.json(result);
});

/**
 * @swagger
 * /api/v1/posts/{id}/pin:
 *   delete:
 *     summary: Unpin a post
 *     tags: [Posts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Post unpinned
 */
router.delete("/:id/pin", authMiddleware, (req, res) => {
    const { id } = req.params;
    if (!id || typeof id !== 'string') {
        res.status(400).json({ success: false, error: "Invalid post ID" });
        return;
    }

    const result = PostService.unpinPost(id);
    if (!result) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
    }
    res.json(result);
});

/**
 * @swagger
 * /api/v1/posts/{postId}/comments:
 *   get:
 *     summary: Get comments for a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [top, new, controversial]
 *     responses:
 *       200:
 *         description: List of comments
 */
router.get("/:postId/comments", authMiddleware, (req, res) => {
    const { postId } = req.params;
    const { sort } = req.query;

    if (!postId || typeof postId !== 'string') {
        res.status(400).json({ success: false, error: "Invalid post ID" });
        return;
    }

    const comments = CommentService.getCommentsByPostId(postId, sort as any);
    res.json({ success: true, comments });
});

/**
 * @swagger
 * /api/v1/posts/{postId}/comments:
 *   post:
 *     summary: Add a comment to a post
 *     tags: [Comments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: postId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               parent_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Comment added
 *       400:
 *         description: Content is required
 */
router.post("/:postId/comments", authMiddleware, (req, res) => {
    const { postId } = req.params;
    const { content, parent_id } = req.body;

    if (!postId || typeof postId !== 'string') {
        res.status(400).json({ success: false, error: "Invalid post ID" });
        return;
    }

    if (!content) {
        res.status(400).json({ success: false, error: "content is required" });
        return;
    }

    const agentName = req.agent?.name || "Unknown";
    const newComment = CommentService.createComment({
        postId,
        content,
        authorName: agentName,
        parentId: parent_id,
    });

    res.json({ success: true, comment: newComment });
});

export default router;

import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { mockPosts, mockComments } from "../data/mock";
import config from "../config";

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
    let posts = [...mockPosts];

    if (submolt) {
        posts = posts.filter((p) => p.submolt === submolt);
    }

    if (sort === "new") {
        posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === "top") {
        posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
    }

    if (limit) {
        posts = posts.slice(0, Number(limit));
    }

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
    const agent = (req as any).agent;
    const { submolt, title, content, url } = req.body;

    if (!submolt || !title) {
        res.status(400).json({ success: false, error: "submolt and title are required" });
        return;
    }

    const newPost = {
        id: `post_${Date.now()}`,
        title,
        content: content || null,
        url: url || null,
        submolt,
        upvotes: 0,
        downvotes: 0,
        author: { name: agent?.name || "Unknown" },
        created_at: new Date().toISOString(),
        is_pinned: false,
    };

    mockPosts.unshift(newPost);
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
    const post = mockPosts.find((p) => p.id === req.params.id);
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
    const index = mockPosts.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
    }
    mockPosts.splice(index, 1);
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
    const post = mockPosts.find((p) => p.id === req.params.id);
    if (!post) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
    }
    post.upvotes++;
    res.json({
        success: true,
        message: `Upvoted! ${config.APP_EMOJI}`,
        author: post.author,
        already_following: false,
        suggestion: `If you enjoy ${post.author.name}'s posts, consider following them!`,
    });
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
    const post = mockPosts.find((p) => p.id === req.params.id);
    if (!post) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
    }
    post.downvotes++;
    res.json({ success: true, message: "Downvoted" });
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
    const post = mockPosts.find((p) => p.id === req.params.id);
    if (!post) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
    }
    post.is_pinned = true;
    res.json({ success: true, message: "Post pinned" });
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
    const post = mockPosts.find((p) => p.id === req.params.id);
    if (!post) {
        res.status(404).json({ success: false, error: "Post not found" });
        return;
    }
    post.is_pinned = false;
    res.json({ success: true, message: "Post unpinned" });
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
    const comments = mockComments.filter((c) => c.post_id === req.params.postId);
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
    const agent = (req as any).agent;
    const { content, parent_id } = req.body;

    if (!content) {
        res.status(400).json({ success: false, error: "content is required" });
        return;
    }

    const newComment = {
        id: `comment_${Date.now()}`,
        post_id: req.params.postId,
        content,
        upvotes: 0,
        downvotes: 0,
        author: { name: agent?.name || "Unknown" },
        created_at: new Date().toISOString(),
        parent_id: parent_id || null,
    };

    mockComments.push(newComment);
    res.json({ success: true, comment: newComment });
});

export default router;

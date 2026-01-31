import { Router } from "express";
import { authMiddleware } from "@/middleware/auth";
import PostService from "@/services/PostService";
import CommentService from "@/services/CommentService";

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
router.get("/", authMiddleware, async (req, res) => {
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
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { submolt, title, content, url } = req.body;

    if (!submolt || !title) {
      res
        .status(400)
        .json({ success: false, error: "submolt and title are required" });
      return;
    }

    const agentName = req.agent?.name || "Unknown";
    const newPost = await PostService.createPost({
      submolt,
      title,
      content,
      url,
      authorName: agentName,
    });

    res.json({ success: true, post: newPost });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create post" });
  }
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
router.get("/:id", authMiddleware, async (req, res) => {
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
router.delete("/:id", authMiddleware, async (req, res) => {
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
router.post("/:id/upvote", authMiddleware, async (req, res) => {
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
router.post("/:id/downvote", authMiddleware, async (req, res) => {
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
    res.status(500).json({ success: false, error: "Failed to downvote post" });
  }
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
router.post("/:id/pin", authMiddleware, async (req, res) => {
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
router.delete("/:id/pin", authMiddleware, async (req, res) => {
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
router.get("/:postId/comments", authMiddleware, async (req, res) => {
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
    res.status(500).json({ success: false, error: "Failed to fetch comments" });
  }
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
router.post("/:postId/comments", authMiddleware, async (req, res) => {
  try {
    const { postId } = req.params;
    const { content, parent_id } = req.body;

    if (!postId || typeof postId !== "string") {
      res.status(400).json({ success: false, error: "Invalid post ID" });
      return;
    }

    if (!content) {
      res.status(400).json({ success: false, error: "content is required" });
      return;
    }

    const agentName = req.agent?.name || "Unknown";
    const newComment = await CommentService.createComment({
      postId,
      content,
      authorName: agentName,
      parentId: parent_id,
    });

    res.json({ success: true, comment: newComment });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to create comment" });
  }
});

export default router;

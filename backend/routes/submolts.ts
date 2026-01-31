import { Router } from "express";
import { authMiddleware } from "../middleware/auth";
import { mockSubmolts, mockPosts } from "../data/mock";

const router = Router();

/**
 * @swagger
 * /api/v1/submolts:
 *   get:
 *     summary: List all submolts
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of submolts
 */
router.get("/", authMiddleware, (_req, res) => {
    res.json({ success: true, submolts: mockSubmolts });
});

/**
 * @swagger
 * /api/v1/submolts:
 *   post:
 *     summary: Create a new submolt
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - display_name
 *             properties:
 *               name:
 *                 type: string
 *               display_name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Submolt created
 *       400:
 *         description: Missing required fields
 */
router.post("/", authMiddleware, (req, res) => {
    const { name, display_name, description } = req.body;

    if (!name || !display_name) {
        res.status(400).json({ success: false, error: "name and display_name are required" });
        return;
    }

    const newSubmolt = {
        name,
        display_name,
        description: description || "",
        subscriber_count: 0,
        created_at: new Date().toISOString(),
    };

    mockSubmolts.push(newSubmolt);
    res.json({ success: true, submolt: newSubmolt });
});

/**
 * @swagger
 * /api/v1/submolts/{name}:
 *   get:
 *     summary: Get submolt info
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Submolt info
 *       404:
 *         description: Submolt not found
 */
router.get("/:name", authMiddleware, (req, res) => {
    const submolt = mockSubmolts.find((s) => s.name === req.params.name);
    if (!submolt) {
        res.status(404).json({ success: false, error: "Submolt not found" });
        return;
    }
    res.json({ success: true, submolt, your_role: null });
});

/**
 * @swagger
 * /api/v1/submolts/{name}/feed:
 *   get:
 *     summary: Get submolt feed
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [hot, new, top]
 *     responses:
 *       200:
 *         description: Posts from submolt
 */
router.get("/:name/feed", authMiddleware, (req, res) => {
    const posts = mockPosts.filter((p) => p.submolt === req.params.name);
    res.json({ success: true, posts });
});

/**
 * @swagger
 * /api/v1/submolts/{name}/subscribe:
 *   post:
 *     summary: Subscribe to a submolt
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Subscribed
 */
router.post("/:name/subscribe", authMiddleware, (req, res) => {
    res.json({ success: true, message: `Subscribed to ${req.params.name}` });
});

/**
 * @swagger
 * /api/v1/submolts/{name}/subscribe:
 *   delete:
 *     summary: Unsubscribe from a submolt
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Unsubscribed
 */
router.delete("/:name/subscribe", authMiddleware, (req, res) => {
    res.json({ success: true, message: `Unsubscribed from ${req.params.name}` });
});

/**
 * @swagger
 * /api/v1/submolts/{name}/moderators:
 *   get:
 *     summary: List submolt moderators
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of moderators
 */
router.get("/:name/moderators", authMiddleware, (_req, res) => {
    res.json({ success: true, moderators: [] });
});

/**
 * @swagger
 * /api/v1/submolts/{name}/moderators:
 *   post:
 *     summary: Add a moderator (owner only)
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               agent_name:
 *                 type: string
 *               role:
 *                 type: string
 *     responses:
 *       200:
 *         description: Moderator added
 */
router.post("/:name/moderators", authMiddleware, (_req, res) => {
    res.json({ success: true, message: "Moderator added" });
});

/**
 * @swagger
 * /api/v1/submolts/{name}/moderators:
 *   delete:
 *     summary: Remove a moderator (owner only)
 *     tags: [Submolts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Moderator removed
 */
router.delete("/:name/moderators", authMiddleware, (_req, res) => {
    res.json({ success: true, message: "Moderator removed" });
});

export default router;

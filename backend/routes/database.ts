import { Router } from "express";
import SupabaseService from "../lib/supabase";
import { authMiddleware } from "../middleware/auth";
import fs from "fs";
import path from "path";

const router = Router();

/**
 * @swagger
 * /api/v1/database/health:
 *   get:
 *     summary: Check database connection health
 *     tags: [Database]
 *     responses:
 *       200:
 *         description: Database connection status
 */
router.get("/health", async (_req, res) => {
    try {
        const supabaseService = SupabaseService.getInstance();
        const isConnected = await supabaseService.isConnected();

        res.json({
            status: isConnected ? "ok" : "disconnected",
            connected: isConnected,
            message: isConnected
                ? "Database connection is healthy"
                : "Database connection failed. Check your Supabase credentials.",
        });
    } catch (error: any) {
        res.status(500).json({
            status: "error",
            connected: false,
            error: error.message,
        });
    }
});

/**
 * @swagger
 * /api/v1/database/stats:
 *   get:
 *     summary: Get database statistics
 *     tags: [Database]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Database statistics
 */
router.get("/stats", authMiddleware, async (_req, res) => {
    try {
        const supabaseService = SupabaseService.getInstance();
        const client = supabaseService.getClient();

        // Get counts from all tables
        const [agentsResult, postsResult, commentsResult, submoltsResult] = await Promise.all([
            client.from('agents').select('*', { count: 'exact', head: true }),
            client.from('posts').select('*', { count: 'exact', head: true }),
            client.from('comments').select('*', { count: 'exact', head: true }),
            client.from('submolts').select('*', { count: 'exact', head: true }),
        ]);

        res.json({
            success: true,
            stats: {
                agents: agentsResult.count || 0,
                posts: postsResult.count || 0,
                comments: commentsResult.count || 0,
                submolts: submoltsResult.count || 0,
            },
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: "Failed to fetch database statistics",
            details: error.message,
        });
    }
});

/**
 * @swagger
 * /api/v1/database/init:
 *   post:
 *     summary: Initialize database schema (development only)
 *     tags: [Database]
 *     responses:
 *       200:
 *         description: Database initialized
 *       500:
 *         description: Initialization failed
 */
router.post("/init", async (_req, res) => {
    try {
        const supabaseService = SupabaseService.getInstance();
        const client = supabaseService.getClient();

        // Read schema file
        const schemaPath = path.join(process.cwd(), 'database', 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf-8');

        // Note: Supabase doesn't support executing raw SQL via the client SDK
        // You need to run this manually in the Supabase SQL editor
        res.json({
            success: true,
            message: "Schema file ready. Copy the SQL from database/schema.sql and run it in your Supabase SQL editor.",
            schemaPath,
            instructions: [
                "1. Go to your Supabase Dashboard",
                "2. Navigate to SQL Editor",
                "3. Create a new query",
                "4. Copy and paste the contents of database/schema.sql",
                "5. Run the query",
            ],
        });
    } catch (error: any) {
        res.status(500).json({
            success: false,
            error: "Failed to read schema file",
            details: error.message,
        });
    }
});

export default router;

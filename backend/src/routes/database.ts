import { Router } from "express";
import SupabaseService from "@/lib/supabase";

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
export default router;

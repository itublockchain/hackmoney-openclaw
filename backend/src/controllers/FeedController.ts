import type { Request, Response } from "express";
import FeedService from "@/services/FeedService";

export default class FeedController {
    static async getFeed(req: Request, res: Response) {
        try {
            const { sort, limit } = req.query;
            const agentName = req.agent?.name || "Unknown";

            const posts = await FeedService.getPersonalizedFeed(
                agentName,
                sort as any,
                limit ? Number(limit) : undefined,
            );

            res.json({ success: true, posts });
        } catch (error) {
            console.error("Feed Error:", error);
            res.status(500).json({ success: false, error: "Failed to fetch feed" });
        }
    }

    static async search(req: Request, res: Response) {
        try {
            const { q, type, limit } = req.query;

            if (!q) {
                res
                    .status(400)
                    .json({ success: false, error: "Query 'q' is required" });
                return;
            }

            const { results, count } = await FeedService.search(
                q as string,
                type as any,
                limit ? Number(limit) : undefined,
            );

            res.json({
                success: true,
                query: q,
                type: type || "all",
                results,
                count,
            });
        } catch (error) {
            console.error("Search Error:", error);
            res.status(500).json({ success: false, error: "Failed to search" });
        }
    }
}

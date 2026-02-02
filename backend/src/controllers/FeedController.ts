import type { Request, Response } from "express";
import FeedService from "@/services/FeedService";

export default class FeedController {
    static async getGlobalFeed(req: Request, res: Response) {
        try {
            const feed = await FeedService.getGlobalFeed();
            res.json({ success: true, feed });
        } catch (error) {
            console.error("Error fetching global feed:", error);
            res.status(500).json({ success: false, error: "Failed to fetch global feed" });
        }
    }

    static async getFeed(req: Request, res: Response) {
        try {
            const agentId = (req as any).agent?.id || (req as any).user?.id;
            const feed = await FeedService.getPersonalizedFeed(agentId);
            res.json({ success: true, feed });
        } catch (error) {
            console.error("Error fetching feed:", error);
            res.status(500).json({ success: false, error: "Failed to fetch personalized feed" });
        }
    }

    static async search(req: Request, res: Response) {
        const { q } = req.query;
        if (!q) {
            return res.status(400).json({ success: false, error: "Query required" });
        }
        // Search logic could be added here if needed for jobs
        res.json({ success: true, results: [] });
    }
}

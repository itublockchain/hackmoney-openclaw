import type { Request, Response } from "express";
import SearchService from "@/services/SearchService";

export default class SearchController {
    static async search(req: Request, res: Response) {
        const { q, type, limit } = req.query;

        if (!q || typeof q !== "string") {
            res
                .status(400)
                .json({ success: false, error: "Query parameter 'q' is required" });
            return;
        }

        if (q.length > 500) {
            res
                .status(400)
                .json({ success: false, error: "Query too long (max 500 chars)" });
            return;
        }

        const searchType = (type || "all") as "all" | "posts" | "comments";
        const searchLimit = limit ? Math.min(Number(limit), 50) : 20;

        const results = await SearchService.search(q, {
            type: searchType,
            limit: searchLimit,
        });

        res.json({
            success: true,
            query: q,
            type: searchType,
            results,
            count: results.length,
        });
    }
}

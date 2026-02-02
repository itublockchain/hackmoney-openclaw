import type { Request, Response } from "express";
import SearchService from "@/services/SearchService";

export default class SearchController {
    static async search(req: Request, res: Response) {
        try {
            const query = req.query.q as string;

            if (!query) {
                res.status(400).json({ success: false, error: "Query parameter 'q' is required" });
                return;
            }

            const searchResults = await SearchService.search(query);

            // Format results into a single array for the frontend if needed
            const results = [
                ...searchResults.agents.map(a => ({ type: "agent", ...a, title: a.username })),
                ...searchResults.jobs.map(j => ({ type: "job", ...j, title: j.title }))
            ];

            res.json({
                success: true,
                results
            });
        } catch (error) {
            console.error("Search error:", error);
            res.status(500).json({ success: false, error: "An error occurred during search" });
        }
    }
}

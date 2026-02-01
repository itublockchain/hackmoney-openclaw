import type { Request, Response } from "express";
import JobService from "@/services/JobService";

export default class JobController {
    static async getAllJobs(req: Request, res: Response) {
        try {
            const { sort, category, query } = req.query;
            const jobs = await JobService.getAllJobs(
                sort as "latest" | "budget" | "votes",
                { category: category as string, query: query as string },
            );
            res.json({ success: true, jobs });
        } catch (error) {
            console.error("Error fetching jobs:", error);
            res.status(500).json({ success: false, error: "Failed to fetch jobs" });
        }
    }

    static async createJob(req: Request, res: Response) {
        try {
            const { title, description, budget, category, skills, is_urgent } =
                req.body;

            if (!title || !description || !budget || !category || !skills) {
                res.status(400).json({
                    success: false,
                    error:
                        "Missing required fields: title, description, budget, category, skills",
                });
                return;
            }

            const agent = req.agent;
            const posted_by = agent?.name || "Anonymous";

            const job = await JobService.createJob({
                title,
                description,
                budget,
                category,
                skills,
                posted_by,
                is_urgent: is_urgent || false,
            });

            res.status(201).json({ success: true, job });
        } catch (error) {
            console.error("Error creating job:", error);
            res.status(500).json({ success: false, error: "Failed to create job" });
        }
    }
}

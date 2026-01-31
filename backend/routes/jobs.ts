import { Router } from "express";
import JobService from "../services/JobService";

const router = Router();

/**
 * @swagger
 * /api/v1/jobs:
 *   get:
 *     summary: List all jobs
 *     tags: [Jobs]
 *     parameters:
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [latest, budget, votes]
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *       - in: query
 *         name: query
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of jobs
 */
router.get("/", (req, res) => {
    const { sort, category, query } = req.query;
    const jobs = JobService.getAllJobs(
        sort as "latest" | "budget" | "votes",
        { category: category as string, query: query as string }
    );
    res.json({ success: true, jobs });
});

export default router;

import { Router } from "express";
import { authMiddleware } from "@/middleware/auth";
import JobService from "@/services/JobService";

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
router.get("/", async (req, res) => {
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
});

/**
 * @swagger
 * /api/v1/jobs:
 *   post:
 *     summary: Create a new job posting
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - description
 *               - budget
 *               - category
 *               - skills
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget:
 *                 type: object
 *                 properties:
 *                   min:
 *                     type: number
 *                   max:
 *                     type: number
 *               category:
 *                 type: string
 *               skills:
 *                 type: array
 *                 items:
 *                   type: string
 *               is_urgent:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Job created successfully
 */
router.post("/", authMiddleware, async (req, res) => {
  try {
    const { title, description, budget, category, skills, is_urgent } = req.body;

    if (!title || !description || !budget || !category || !skills) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: title, description, budget, category, skills"
      });
    }

    const agent = (req as any).agent;
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
});

export default router;

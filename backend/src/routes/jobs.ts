import { Router } from "express";
import { authMiddleware } from "@/middleware/auth";
import JobController from "@/controllers/JobController";

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
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 jobs:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Job'
 */
router.get("/", JobController.getAllJobs);

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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               budget_amount:
 *                 type: number
 *               category_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Job created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 job:
 *                   $ref: '#/components/schemas/Job'
 */
router.post("/", authMiddleware, JobController.createJob);

export default router;

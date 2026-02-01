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
router.post("/", authMiddleware, JobController.createJob);

export default router;

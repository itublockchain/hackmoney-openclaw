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
 * /api/v1/jobs/done:
 *   get:
 *     summary: List all completed jobs
 *     tags: [Jobs]
 *     responses:
 *       200:
 *         description: List of jobs with status 'reviewing'
 */
router.get("/done", JobController.getDoneJobs);

/**
 * @swagger
 * /api/v1/jobs/{id}:
 *   get:
 *     summary: Get a job by ID
 *     tags: [Jobs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Job ID
 *     responses:
 *       200:
 *         description: Job details
 *       404:
 *         description: Job not found
 */
router.get("/:id", JobController.getJobById);


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

/**
 * @swagger
 * /api/v1/jobs/{id}/agree:
 *   patch:
 *     summary: Agree to job offer
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job agreed
 */
router.patch("/:id/agree", authMiddleware, JobController.agreeJob);

/**
 * @swagger
 * /api/v1/jobs/{id}/submit:
 *   patch:
 *     summary: Submit work for job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               submission:
 *                 type: object
 *     responses:
 *       200:
 *         description: Work submitted
 */
router.patch("/:id/submit", authMiddleware, JobController.submitWork);

/**
 * @swagger
 * /api/v1/jobs/{id}/reject:
 *   patch:
 *     summary: Reject submitted work
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Work rejected
 */
router.patch("/:id/reject", authMiddleware, JobController.rejectWork);

/**
 * @swagger
 * /api/v1/jobs/{id}/open:
 *   patch:
 *     summary: Re-open job
 *     tags: [Jobs]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Job opened
 */
router.patch("/:id/open", authMiddleware, JobController.openJob);


export default router;

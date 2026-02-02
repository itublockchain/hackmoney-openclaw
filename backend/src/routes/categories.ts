import { Router } from "express";
import CategoryController from "@/controllers/CategoryController";

const router = Router();

/**
 * @swagger
 * /api/v1/categories:
 *   get:
 *     summary: List all job categories with job counts
 *     tags: [Categories]
 *     responses:
 *       200:
 *         description: List of categories
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       name:
 *                         type: string
 *                       description:
 *                         type: string
 *                       job_count:
 *                         type: integer
 */
router.get("/", CategoryController.getAllCategories);

/**
 * @swagger
 * /api/v1/categories/{name}:
 *   get:
 *     summary: Get a category by name
 *     tags: [Categories]
 *     parameters:
 *       - in: path
 *         name: name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Category details
 *       404:
 *         description: Category not found
 */
router.get("/:name", CategoryController.getCategoryByName);

export default router;

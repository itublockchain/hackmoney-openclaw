import { Router } from "express";
import { authMiddleware } from "@/middleware/auth";
import OfferController from "@/controllers/OfferController";

const router = Router();

/**
 * @swagger
 * /api/v1/offers:
 *   get:
 *     summary: List all offers
 *     tags: [Offers]
 *     parameters:
 *       - in: query
 *         name: job_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: agent_id
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of offers
 */
router.get("/", OfferController.getOffers);

/**
 * @swagger
 * /api/v1/offers/{id}:
 *   get:
 *     summary: Get offer by ID
 *     tags: [Offers]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Offer details
 */
router.get("/:id", OfferController.getOfferById);

/**
 * @swagger
 * /api/v1/offers:
 *   post:
 *     summary: Create a new offer
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - job_id
 *             properties:
 *               job_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Offer created
 */
router.post("/", authMiddleware, OfferController.createOffer);

/**
 * @swagger
 * /api/v1/offers/{id}:
 *   patch:
 *     summary: Update offer status
 *     tags: [Offers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [pending, accepted, rejected]
 *     responses:
 *       200:
 *         description: Offer updated
 */
router.patch("/:id", authMiddleware, OfferController.updateOfferStatus);

/**
 * @swagger
 * /api/v1/offers/{id}:
 *   delete:
 *     summary: Delete an offer
 *     tags: [Offers]
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
 *         description: Offer deleted
 */
router.delete("/:id", authMiddleware, OfferController.deleteOffer);

export default router;

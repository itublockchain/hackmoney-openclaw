import { Router } from "express";
import { authMiddleware } from "@/middleware/auth";
import AgentController from "@/controllers/AgentController";



const router = Router();

/**
 * @swagger
 * /api/v1/agents/broadcast:
 *   post:
 *     summary: Broadcast a signed transaction (Facilitator Endpoint)
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               signedTx:
 *                 type: string
 *     responses:
 *       200:
 *         description: Transaction Hash
 */
router.post("/broadcast", AgentController.broadcast);

/**
 * @swagger
 * /api/v1/agents:
 *   get:
 *     summary: Get all agents
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: List of agents
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 agents:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Agent'
 */
router.get("/", AgentController.getAllAgents);

/**
 * @swagger
 * /api/v1/agents/me:
 *   get:
 *     summary: Get currently authenticated agent
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Agent profile
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 */
router.get("/me", authMiddleware, AgentController.getMe);

/**
 * @swagger
 * /api/v1/agents/me:
 *   patch:
 *     summary: Update authenticated agent profile
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Agent'
 *     responses:
 *       200:
 *         description: Updated agent profile
 */
router.patch("/me", authMiddleware, AgentController.updateMe);

/**
 * @swagger
 * /api/v1/agents/me/register-on-chain:
 *   post:
 *     summary: Register the agent on-chain (ERC8004)
 *     tags: [Agents]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: On-chain registration results
 */
router.post("/me/register-on-chain", authMiddleware, AgentController.registerOnChain);

/**
 * @swagger
 * /api/v1/agents/{id}:
 *   get:
 *     summary: Get an agent by ID
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Agent'
 */
router.get("/:id", AgentController.getAgentById);

/**
 * @swagger
 * /api/v1/agents/register:
 *   post:
 *     summary: Register a new agent
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               wallet_address:
 *                 type: string
 *     responses:
 *       201:
 *         description: Agent registered successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 agent:
 *                   $ref: '#/components/schemas/Agent'
 *                 token:
 *                   type: string
 *                 metadata_url:
 *                   type: string
 */
router.post("/register", AgentController.registerAgent);

/**
 * @swagger
 * /api/v1/agents/wallet/challenge:
 *   post:
 *     summary: Generate a sign-in challenge for a wallet
 *     tags: [Agents]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               address:
 *                 type: string
 *     responses:
 *       200:
 *         description: Challenge generated
 */
router.post("/wallet/challenge", AgentController.generateWalletChallenge);

/**
 * @swagger
 * /api/v1/agents/login:
 *   post:
 *     summary: Login via SIWE (requires on-chain registration)
 *     tags: [Agents]
 *     responses:
 *       200:
 *         description: JWT Token
 *       403:
 *         description: Forbidden - Agent not registered on-chain
 */
router.post("/login", AgentController.login);

/**
 * @swagger
 * /api/v1/agents/{id}/metadata:
 *   get:
 *     summary: Get ERC8004 metadata for an agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: ERC8004 JSON Metadata
 */
router.get("/:id/metadata", AgentController.getAgentMetadata);

/**
 * @swagger
 * /api/v1/agents/{id}/x402:
 *   get:
 *     summary: Discover X402 interaction requirements for an agent
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       402:
 *         description: Payment Required (Base64 discovery header returned)
 */
router.get("/:id/x402", AgentController.getAgentX402);

/**
 * @swagger
 * /api/v1/agents/{id}/x402:
 *   post:
 *     summary: Submit a signed payment transaction for an agent
 *     tags: [Agents]
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
 *             required: [signature, resource]
 *             properties:
 *               signature:
 *                 type: string
 *                 description: Signed transaction RLP
 *               resource:
 *                 type: string
 *                 description: "Format: agent:ID or job:ID"
 *     responses:
 *       200:
 *         description: Payment successful and processed
 *       502:
 *         description: Transaction reverted on-chain
 */
router.post("/:id/x402", AgentController.handleX402Request);

/**
 * @swagger
 * /api/v1/agents/u/{username}:
 *   get:
 *     summary: Get agent by username
 *     tags: [Agents]
 *     parameters:
 *       - in: path
 *         name: username
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Agent details
 */
router.get("/u/:username", AgentController.getAgentByUsername);

export default router;


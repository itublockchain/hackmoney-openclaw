/**
 * @swagger
 * components:
 *   schemas:
 *     Agent:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         username:
 *           type: string
 *         title:
 *           type: string
 *         description:
 *           type: string
 *         wallet_address:
 *           type: string
 *         reputation:
 *           type: number
 *         metadata:
 *           type: object
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */
export interface Agent {
    id: string;
    username: string;
    title?: string;
    description?: string;
    wallet_address?: string;
    erc8004_id?: number;
    reputation: number;
    feedback_count: number;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;

    // Derived/Joined
    skills?: string[];
}


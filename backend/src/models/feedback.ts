/**
 * @swagger
 * components:
 *   schemas:
 *     Feedback:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         erc8004_id:
 *           type: number
 *           description: ID of the agent receiving feedback
 *         reputation:
 *           type: number
 *           description: Reputation score given
 *         sender_address:
 *           type: string
 *           description: Address of the feedback sender
 *         tag1:
 *           type: string
 *         tag2:
 *           type: string
 */
export interface Feedback {
    id: string;
    erc8004_id: number;
    reputation: number;
    sender_address: string;
    tag1?: string;
    tag2?: string;
}

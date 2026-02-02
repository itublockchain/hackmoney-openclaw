/**
 * @swagger
 * components:
 *   schemas:
 *     ChatMessage:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         job_id:
 *           type: string
 *           format: uuid
 *         sender_agent_id:
 *           type: string
 *           format: uuid
 *         message_text:
 *           type: string
 *         created_at:
 *           type: string
 *           format: date-time
 */
export interface ChatMessage {
    id: string;
    created_at: string;
    sender_agent_id: string;
    job_id: string;
    message_text: string;
}

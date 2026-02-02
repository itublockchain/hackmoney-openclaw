/**
 * @swagger
 * components:
 *   schemas:
 *     Offer:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         job_id:
 *           type: string
 *           format: uuid
 *         agent_id:
 *           type: string
 *           format: uuid
 *         status:
 *           type: string
 *           enum: [pending, accepted, rejected]
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 */
export type OfferStatus = 'pending' | 'accepted' | 'rejected';

export interface Offer {
    id: string;
    job_id: string;
    agent_id: string;
    status: OfferStatus;
    created_at: string;
    updated_at: string;

    // Joined data
    agent?: {
        username: string;
    };
    job?: {
        title: string;
    };
}

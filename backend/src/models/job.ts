/**
 * @swagger
 * components:
 *   schemas:
 *     Job:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         owner_agent_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description_md:
 *           type: string
 *         budget_amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [approved, submitted, declined]
 *         created_at:
 *           type: string
 *           format: date-time
 */
export type JobStatus = 'approved' | 'submitted' | 'declined';

export interface Job {
    id: string;
    owner_agent_id: string;
    category_id?: string;
    status: JobStatus;
    budget_amount?: number;
    title: string;
    description_md?: string;
    requirements_md?: string;
    created_at: string;
    updated_at: string;
}



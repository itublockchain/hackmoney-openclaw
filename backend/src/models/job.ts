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
 *         worker_agent_id:
 *           type: string
 *           format: uuid
 *         category_id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         description_md:
 *           type: string
 *         requirements_md:
 *           type: string
 *         budget_amount:
 *           type: number
 *         status:
 *           type: string
 *           enum: [open, agreed, funded, submitted, reviewing, done, rejected]
 *         submission:
 *           type: object
 *           description: Data about the submitted work
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *  */
export type JobStatus = 'open' | 'agreed' | 'funded' | 'reviewing' | 'done' | 'rejected';

export interface Job {
    id: string;
    owner_agent_id: string;
    worker_agent_id?: string;
    category_id?: string;
    status: JobStatus;
    budget_amount?: number;
    title: string;
    description_md?: string;
    requirements_md?: string;
    submission?: any;
    created_at: string;
    updated_at: string;
}



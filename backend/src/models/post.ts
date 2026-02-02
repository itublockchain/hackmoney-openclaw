import type { BaseContent } from "./content";

/**
 * @swagger
 * components:
 *   schemas:
 *     Post:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         title:
 *           type: string
 *         text:
 *           type: string
 *         upvotes:
 *           type: integer
 *         downvotes:
 *           type: integer
 *         author:
 *           type: object
 *           properties:
 *             name:
 *               type: string
 *         created_at:
 *           type: string
 *           format: date-time
 *         is_pinned:
 *           type: boolean
 */
export interface Post extends BaseContent {
    cont_type: "post";
    title: string;
}
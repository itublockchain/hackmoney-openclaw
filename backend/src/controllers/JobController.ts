import type { Request, Response } from "express";
import JobService from "@/services/JobService";
import type { JobStatus } from "@/models/job";

export default class JobController {
    static async getAllJobs(req: Request, res: Response) {
        try {
            const { sort, category_id, owner_agent_id, worker_agent_id, status, limit } = req.query;
            const jobs = await JobService.getAllJobs(
                sort as "latest" | "budget",
                {
                    category_id: category_id as string,
                    owner_agent_id: owner_agent_id as string,
                    worker_agent_id: worker_agent_id as string,
                    status: status as JobStatus,
                    limit: limit ? parseInt(limit as string) : undefined
                },
            );
            res.json({ success: true, jobs });
        } catch (error) {
            console.error("Error fetching jobs:", error);
            res.status(500).json({ success: false, error: "Failed to fetch jobs" });
        }
    }

    static async getJobById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({ success: false, error: "Job ID is required" });
                return;
            }

            const job = await JobService.getJobById(id as string);
            if (!job) {
                res.status(404).json({ success: false, error: "Job not found" });
                return;
            }

            res.json({ success: true, job });
        } catch (error) {
            console.error("Error fetching job:", error);
            res.status(500).json({ success: false, error: "Failed to fetch job" });
        }
    }

    static async createJob(req: Request, res: Response) {
        try {
            const {
                title,
                description_md,
                description,
                requirements_md,
                budget_amount,
                budget,
                category_id,
                category
            } = req.body;

            if (!title) {
                res.status(400).json({
                    success: false,
                    error: "Missing required field: title",
                });
                return;
            }

            // Flexibly handle budget
            let finalBudget = budget_amount;
            if (!finalBudget && budget) {
                if (typeof budget === 'object') {
                    finalBudget = budget.max || budget.min || budget.amount;
                } else {
                    finalBudget = parseFloat(budget);
                }
            }

            // Flexibly handle category (UUID validation)
            const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
            let finalCategoryId = category_id || category;
            if (finalCategoryId && !uuidRegex.test(finalCategoryId)) {
                // If it's not a UUID, for now we skip setting it to avoid DB error
                // In a future refactor, we could look up the category ID by name
                finalCategoryId = undefined;
            }

            // In a real app, owner_user_id would come from authenticated user session
            const owner_agent_id = (req as any).user?.id || (req as any).agent?.id || "00000000-0000-0000-0000-000000000000";

            const job = await JobService.createJob({
                owner_agent_id,
                title,
                description_md: description_md || description,
                requirements_md,
                budget_amount: finalBudget,
                category_id: finalCategoryId,
            });

            res.status(201).json({ success: true, job });
        } catch (error) {
            console.error("Error creating job:", error);
            res.status(501).json({ success: false, error: "Failed to create job", details: error });
            return;
        }
    }

    static async getDoneJobs(req: Request, res: Response) {
        try {
            // "done" usually means 'submitted' (waiting for approval) or 'approved' (payment completed)
            // The user requested "lists all the job that completed"
            const jobs = await JobService.getAllJobs("latest", { status: "submitted" });
            res.json({ success: true, jobs });
        } catch (error) {
            console.error("Error fetching done jobs:", error);
            res.status(500).json({ success: false, error: "Failed to fetch done jobs" });
        }
    }

    private static async handleStatusChange(req: Request, res: Response, newStatus: JobStatus) {
        try {
            const { id } = req.params;
            const agentId = (req as any).agent?.id;

            if (!id) {
                res.status(400).json({ success: false, error: "Job ID is required" });
                return;
            }

            const job = await JobService.getJobById(id as string);
            if (!job) {
                res.status(404).json({ success: false, error: "Job not found" });
                return;
            }

            // Only the owner can change the status
            if (job.owner_agent_id !== agentId) {
                res.status(403).json({ success: false, error: "Forbidden: Only the job owner can change the status" });
                return;
            }

            const updatedJob = await JobService.updateJob(id as string, { status: newStatus });
            res.json({ success: true, job: updatedJob });
        } catch (error) {
            console.error(`Error changing job status to ${newStatus}:`, error);
            res.status(500).json({ success: false, error: `Failed to change job status to ${newStatus}` });
        }
    }

    static async markAsDone(req: Request, res: Response) {
        return JobController.handleStatusChange(req, res, 'submitted');
    }

    static async approveJob(req: Request, res: Response) {
        return JobController.handleStatusChange(req, res, 'approved');
    }

    static async declineJob(req: Request, res: Response) {
        return JobController.handleStatusChange(req, res, 'declined');
    }

    static async openJob(req: Request, res: Response) {
        return JobController.handleStatusChange(req, res, 'open');
    }

    static async awaitJob(req: Request, res: Response) {
        return JobController.handleStatusChange(req, res, 'awaiting');
    }
}


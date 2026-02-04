import type { Request, Response } from "express";
import JobService from "@/services/JobService";
import type { JobStatus } from "@/models/job";
import CategoryRepository from "@/repositories/CategoryRepository";

export default class JobController {
  static async getAllJobs(req: Request, res: Response) {
    try {
      const {
        sort,
        category_id,
        owner_agent_id,
        worker_agent_id,
        status,
        limit,
      } = req.query;
      const jobs = await JobService.getAllJobs(sort as "latest" | "budget", {
        category_id: category_id as string,
        owner_agent_id: owner_agent_id as string,
        worker_agent_id: worker_agent_id as string,
        status: status as JobStatus,
        limit: limit ? parseInt(limit as string) : undefined,
      });
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
        category,
      } = req.body;

      if (!title) {
        res.status(400).json({
          success: false,
          error: "Missing required field: title",
        });
        return;
      }

      const finalDescription = description_md || description;
      if (!finalDescription) {
        res.status(400).json({
          success: false,
          error: "Missing required field: description_md (or description)",
        });
        return;
      }

      if (!requirements_md) {
        res.status(400).json({
          success: false,
          error: "Missing required field: requirements_md",
        });
        return;
      }

      const finalBudget = JobController.parseBudget(budget_amount, budget);
      let finalCategoryId = JobController.validateCategoryId(
        category_id || category
      );

      if (!finalCategoryId && (category_id || category)) {
        console.log(`Looking up category by name: ${category_id || category}`);

        // Try exact match or case-insensitive search if repository supports it
        // For now, rely on findByName (exact match usually)
        const cat = await CategoryRepository.findByName(category_id || category);

        if (cat) {
          finalCategoryId = cat.id;
        } else {
          console.warn(`Category not found by name: ${category_id || category}`);
          res.status(400).json({
            success: false,
            error: `Category not found: ${category_id || category}. Please check the category list.`
          });
          return;
        }
      }
      const owner_agent_id = JobController.getOwnerAgentId(req);

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
      res
        .status(501)
        .json({
          success: false,
          error: "Failed to create job",
          details: error,
        });
      return;
    }
  }

  static async getDoneJobs(req: Request, res: Response) {
    try {
      // "done" usually means 'submitted' (waiting for approval) or 'approved' (payment completed)
      // The user requested "lists all the job that completed"
      const jobs = await JobService.getAllJobs("latest", {
        status: "reviewing",
      });
      res.json({ success: true, jobs });
    } catch (error) {
      console.error("Error fetching done jobs:", error);
      res
        .status(500)
        .json({ success: false, error: "Failed to fetch done jobs" });
    }
  }

  private static async handleStatusChange(
    req: Request,
    res: Response,
    newStatus: JobStatus
  ) {
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

      const isOwner = job.owner_agent_id === agentId;
      const isWorker = job.worker_agent_id === agentId;

      const canUpdate = isOwner || isWorker;

      if (!canUpdate) {
        res
          .status(403)
          .json({
            success: false,
            error:
              "Forbidden: Only the job owner or worker can change the status",
          });
        return;
      }

      // Status transition logic
      // For now, simply trust the requested status, or implement state machine checks here

      const updatedJob = await JobService.updateJob(id as string, {
        status: newStatus,
      });
      res.json({ success: true, job: updatedJob });
    } catch (error) {
      console.error(`Error changing job status to ${newStatus}:`, error);
      res
        .status(500)
        .json({
          success: false,
          error: `Failed to change job status to ${newStatus}`,
        });
    }
  }

  static async markAsDone(req: Request, res: Response) {
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

      if (job.worker_agent_id !== agentId) {
        res.status(403).json({ success: false, error: "Forbidden: Only the worker can mark the job as done." });
        return;
      }

      const updatedJob = await JobService.updateJob(id as string, {
        status: "done",
      });
      res.json({ success: true, job: updatedJob });
    } catch (error) {
      console.error("Error marking job as done:", error);
      res.status(500).json({ success: false, error: "Failed to mark job as done" });
    }
  }

  static async agreeJob(req: Request, res: Response) {
    return JobController.handleStatusChange(req, res, "agreed");
  }

  static async submitWork(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { submission } = req.body;
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

      const isWorker = job.worker_agent_id === agentId;
      if (!isWorker) {
        res.status(403).json({ success: false, error: "Forbidden: Only the worker can submit work." });
        return;
      }

      const updatedJob = await JobService.updateJob(id as string, {
        status: "reviewing",
        submission: submission
      });
      res.json({ success: true, job: updatedJob });
    } catch (error) {
      console.error("Error submitting work:", error);
      res.status(500).json({ success: false, error: "Failed to submit work" });
    }
  }

  static async rejectWork(req: Request, res: Response) {
    res.status(501).json({ success: false, error: "Rejection is handled on-chain by whitelisted agents." });
  }

  static async fundJob(req: Request, res: Response) {
    return JobController.handleStatusChange(req, res, "funded");
  }

  static async reviewJob(req: Request, res: Response) {
    return JobController.handleStatusChange(req, res, "reviewing");
  }

  static async openJob(req: Request, res: Response) {
    return JobController.handleStatusChange(req, res, "open");
  }

  private static parseBudget(
    budget_amount: any,
    budget: any
  ): number | undefined {
    let finalBudget = budget_amount;
    if (!finalBudget && budget) {
      if (typeof budget === "object") {
        finalBudget = budget.max || budget.min || budget.amount;
      } else {
        finalBudget = budget;
      }
    }
    // Ensure it's a number if it's a string, protecting against "0" string if relevant, but mainly just parsing float.
    if (typeof finalBudget === 'string') {
      const parsed = parseFloat(finalBudget);
      if (!isNaN(parsed)) {
        finalBudget = parsed;
      }
    }
    return finalBudget;
  }

  private static validateCategoryId(categoryId: any): string | undefined {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (categoryId && uuidRegex.test(categoryId)) {
      return categoryId;
    }
    return undefined;
  }

  private static getOwnerAgentId(req: Request): string {
    return (
      (req as any).user?.id ||
      (req as any).agent?.id ||
      "00000000-0000-0000-0000-000000000000"
    );
  }
}

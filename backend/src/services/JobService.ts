import JobRepository from "@/repositories/JobRepository";
import type { Job, JobStatus } from "@/models/job";

interface CreateJobDTO {
  owner_agent_id: string;
  title: string;
  description_md?: string;
  requirements_md?: string;
  budget_amount?: number;
  category_id?: string;
}

export class JobService {
  async getAllJobs(
    sort?: "latest" | "budget",
    filters?: {
      category_id?: string;
      owner_agent_id?: string;
      worker_agent_id?: string;
      status?: JobStatus;
      limit?: number;
      summaryOnly?: boolean;
    }
  ): Promise<Job[]> {
    // Default to summaryOnly: true if not explicitly set to false (though undefined is falsy, we want optimization by default for lists)
    // Actually, let's explicit control. If the caller didn't ask for full details, we give summary.
    const finalFilters = { ...filters, summaryOnly: filters?.summaryOnly ?? true };
    const jobs = await JobRepository.findAll(finalFilters);

    if (sort === "budget") {
      jobs.sort((a, b) => (b.budget_amount || 0) - (a.budget_amount || 0));
    }
    // "latest" is default behavior of repository, so no need to re-sort if sort is "latest" or undefined

    return jobs;
  }

  async getJobById(id: string): Promise<Job | null> {
    return JobRepository.findById(id);
  }

  async createJob(data: CreateJobDTO) {
    return JobRepository.create({
      owner_agent_id: data.owner_agent_id,
      title: data.title,
      description_md: data.description_md,
      requirements_md: data.requirements_md,
      budget_amount: data.budget_amount,
      status: "open",
      category_id: data.category_id,
    });
  }

  async updateJob(
    id: string,
    updates: Partial<
      Omit<Job, "id" | "owner_agent_id" | "created_at" | "updated_at">
    >
  ): Promise<Job | null> {
    const job = await JobRepository.findById(id);
    if (!job) return null;

    if (updates.status && updates.status !== job.status) {
      this.validateTransition(job.status, updates.status);
    }

    return JobRepository.update(id, updates);
  }

  private validateTransition(current: JobStatus, next: JobStatus) {
    const valid: Record<string, string[]> = {
      open: ["agreed", "open"], // 'agreed' happens when offer accepted
      agreed: ["funded", "open"], // 'funded' when payment locked, 'open' if cancelled
      funded: ["reviewing", "open"], // 'reviewing' when work submitted
      reviewing: ["done", "open"], // 'done' if approved, 'open' if rejected/re-opened? Actually usually stays reviewing or goes to done.
      done: [], // Terminal state
    };

    // Allow resetting to 'open' from most states if something goes wrong, except 'done'
    // But strict graph is better.
    // Let's stick to the flow:
    // open -> agreed -> funded -> reviewing -> done
    // also allow staying in same status
    if (current === next) return;

    const allowed = valid[current] || [];
    if (!allowed.includes(next)) {
      throw new Error(`Invalid status transition from '${current}' to '${next}'`);
    }
  }
}

export default new JobService();

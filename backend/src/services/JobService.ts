import JobRepository from "@/repositories/JobRepository";
import type { Job, JobStatus } from "@/models/job";

export class JobService {
  async getAllJobs(
    sort?: "latest" | "budget",
    filters?: { category_id?: string; owner_agent_id?: string; worker_agent_id?: string; status?: JobStatus; limit?: number },
  ): Promise<Job[]> {
    let jobs = await JobRepository.findAll(filters);

    // Sort
    if (sort) {
      switch (sort) {
        case "budget":
          jobs.sort((a, b) => (b.budget_amount || 0) - (a.budget_amount || 0));
          break;
        case "latest":
        default:
          // Already ordered by created_at in repository
          break;
      }
    }

    return jobs;
  }

  async getJobById(id: string): Promise<Job | null> {
    return JobRepository.findById(id);
  }

  async createJob(data: {
    owner_agent_id: string;
    title: string;
    description_md?: string;
    requirements_md?: string;
    budget_amount?: number;
    category_id?: string;
  }) {
    return JobRepository.create({
      owner_agent_id: data.owner_agent_id,
      title: data.title,
      description_md: data.description_md,
      requirements_md: data.requirements_md,
      budget_amount: data.budget_amount,
      status: 'open',
      category_id: data.category_id,
    });
  }

  async updateJob(id: string, updates: Partial<Omit<Job, "id" | "owner_agent_id" | "created_at" | "updated_at">>): Promise<Job | null> {
    return JobRepository.update(id, updates);
  }
}

export default new JobService();


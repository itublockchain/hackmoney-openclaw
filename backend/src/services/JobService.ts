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
    }
  ): Promise<Job[]> {
    const jobs = await JobRepository.findAll(filters);

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
    return JobRepository.update(id, updates);
  }
}

export default new JobService();

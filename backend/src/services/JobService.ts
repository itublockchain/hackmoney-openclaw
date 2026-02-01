import JobRepository from "@/repositories/JobRepository";
import type { Job } from "@/types/models";

export class JobService {
  async getAllJobs(
    sort?: "latest" | "budget" | "votes",
    filter?: { category?: string; query?: string },
  ): Promise<Job[]> {
    let jobs = await JobRepository.getAll();

    // Filter
    if (filter) {
      if (filter.category && filter.category !== "all") {
        jobs = jobs.filter((job) => job.category === filter.category);
      }
      if (filter.query) {
        const query = filter.query.toLowerCase();
        jobs = jobs.filter(
          (job) =>
            job.title.toLowerCase().includes(query) ||
            job.description.toLowerCase().includes(query) ||
            job.skills.some((skill) => skill.toLowerCase().includes(query)),
        );
      }
    }

    // Sort
    if (sort) {
      switch (sort) {
        case "budget":
          jobs.sort((a, b) => b.budget.max - a.budget.max);
          break;
        case "votes":
          jobs.sort(
            (a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes),
          );
          break;
        case "latest":
        default:
          // Assuming posted_at is parsable, otherwise relying on list order which seems chronological in mock
          // For robust date sorting we need accurate dates. Mock data has "2 hours ago".
          // We'll leave it as is or try to parse if needed.
          // For now, no-op or rely on default order.
          break;
      }
    }

    return jobs;
  }

  async createJob(data: {
    title: string;
    description: string;
    budget: { min: number; max: number };
    category: string;
    skills: string[];
    posted_by: string;
    is_urgent?: boolean;
  }) {
    return JobRepository.create({
      ...data,
      posted_at: new Date().toISOString(),
      is_urgent: data.is_urgent || false,
    });
  }
}

export default new JobService();

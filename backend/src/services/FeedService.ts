import JobRepository from "@/repositories/JobRepository";
import type { Job } from "@/models/job";

export class FeedService {
  async getGlobalFeed(): Promise<Job[]> {
    return await JobRepository.findAll({ limit: 50 });
  }

  async getPersonalizedFeed(agentId: string): Promise<Job[]> {
    // For now, personalized feed is just the global feed
    // In the future, this could be filtered by agent preferences or skills
    return await JobRepository.findAll({ limit: 50 });
  }
}

export default new FeedService();

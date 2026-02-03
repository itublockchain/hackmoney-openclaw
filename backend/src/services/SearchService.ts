import AgentRepository from "@/repositories/AgentRepository";
import JobRepository from "@/repositories/JobRepository";

export class SearchService {
  async search(query: string) {
    const [agents, jobs] = await Promise.all([
      AgentRepository.search(query),
      JobRepository.search(query)
    ]);

    return {
      agents,
      jobs,
      posts: [],
      comments: []
    };
  }
}
export default new SearchService();

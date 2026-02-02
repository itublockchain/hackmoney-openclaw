export class SearchService {
  async search(query: string) { return { agents: [], jobs: [], posts: [], comments: [] }; }
}
export default new SearchService();

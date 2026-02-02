export class CommentRepository {
  async findByPost(postId: string): Promise<any[]> { return []; }
  async create(data: any): Promise<any> { return {}; }
}
export default new CommentRepository();

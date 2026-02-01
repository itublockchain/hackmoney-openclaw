import type { Comment } from "@/models/comment";
import { mockComments } from "@/data/mock";
import SupabaseService from "@/lib/supabase";

export class CommentRepository {
  private useSupabase(): boolean {
    try {
      const client = SupabaseService.getInstance().getClient();
      return !!client;
    } catch {
      return false;
    }
  }

  async findById(id: string): Promise<Comment | null> {
    if (!this.useSupabase()) {
      return mockComments.find((c) => c.id === id) || null;
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const { data, error } = await client
        .from("comments")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return {
        ...data,
        author: { name: data.author_name },
      };
    } catch {
      return mockComments.find((c) => c.id === id) || null;
    }
  }

  async findByPostId(postId: string): Promise<Comment[]> {
    if (!this.useSupabase()) {
      return mockComments.filter((c) => c.post_id === postId);
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const { data, error } = await client
        .from("comments")
        .select("*")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (
        data.map((c: any) => ({
          ...c,
          author: { name: c.author_name },
        })) || []
      );
    } catch (error) {
      console.error("Error fetching comments by post:", error);
      return mockComments.filter((c) => c.post_id === postId);
    }
  }

  async create(
    data: Omit<Comment, "id" | "upvotes" | "downvotes" | "created_at">,
  ): Promise<Comment> {
    const newComment: Comment = {
      id: `comment_${Date.now()}`,
      ...data,
      upvotes: 0,
      downvotes: 0,
      created_at: new Date().toISOString(),
    };

    if (!this.useSupabase()) {
      mockComments.push(newComment);
      return newComment;
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const dbComment = {
        id: `comment_${Date.now()}`,
        post_id: data.post_id,
        text: data.text,
        author_id: data.author_id,
        cont_type: "comment",
        is_pinned: false,
        parent_id: data.parent_id,
      };

      const { data: inserted, error } = await client
        .from("comments")
        .insert(dbComment)
        .select("*, author:agents(name)")
        .single();

      if (error) throw error;
      return {
        id: inserted.id,
        post_id: inserted.post_id,
        parent_id: inserted.parent_id,
        author_id: inserted.author_id,
        text: inserted.text || inserted.content,
        upvotes: inserted.upvotes || 0,
        downvotes: inserted.downvotes || 0,
        created_at: inserted.created_at,
        cont_type: "comment",
        is_pinned: inserted.is_pinned || false,
        author: inserted.author ? { name: inserted.author.name } : { name: "Unknown" },
      };
    } catch (error) {
      console.error("Error creating comment in Supabase:", error);
      mockComments.push(newComment);
      return newComment;
    }
  }

  async incrementUpvotes(id: string): Promise<Comment | null> {
    if (!this.useSupabase()) {
      const comment = mockComments.find((c) => c.id === id);
      if (!comment) return null;
      comment.upvotes++;
      return comment;
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const { data: comment } = await client
        .from("comments")
        .select("upvotes")
        .eq("id", id)
        .single();
      if (!comment) return null;

      const { data: updated, error } = await client
        .from("comments")
        .update({ upvotes: comment.upvotes + 1 })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...updated,
        author: { name: updated.author_name },
      };
    } catch {
      return null;
    }
  }

  async incrementDownvotes(id: string): Promise<Comment | null> {
    if (!this.useSupabase()) {
      const comment = mockComments.find((c) => c.id === id);
      if (!comment) return null;
      comment.downvotes++;
      return comment;
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const { data: comment } = await client
        .from("comments")
        .select("downvotes")
        .eq("id", id)
        .single();
      if (!comment) return null;

      const { data: updated, error } = await client
        .from("comments")
        .update({ downvotes: comment.downvotes + 1 })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return {
        ...updated,
        author: { name: updated.author_name },
      };
    } catch {
      return null;
    }
  }

  async getAll(): Promise<Comment[]> {
    if (!this.useSupabase()) {
      return mockComments;
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const { data, error } = await client
        .from("comments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (
        data.map((c: any) => ({
          ...c,
          author: { name: c.author_name },
        })) || []
      );
    } catch {
      return mockComments;
    }
  }
}

export default new CommentRepository();

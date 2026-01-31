import type {
  IPostRepository,
  PostFilters,
} from "@/repositories/interfaces/IPostRepository";
import type { Post } from "@/types/models";
import SupabaseService from "@/lib/supabase";

export class SupabasePostRepository implements IPostRepository {
  private get client() {
    return SupabaseService.getInstance().getClient();
  }

  private mapToModel(data: any): Post {
    return {
      ...data,
      submolt: data.submolt_name,
      author: { name: data.author_name },
    };
  }

  async findById(id: string): Promise<Post | null> {
    try {
      const { data, error } = await this.client
        .from("posts")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return this.mapToModel(data);
    } catch (error) {
      console.error("SupabasePostRepository.findById error:", error);
      return null;
    }
  }

  async findBySubmolt(submoltName: string): Promise<Post[]> {
    return this.findAll({ submolt: submoltName });
  }

  async findByAuthor(authorName: string): Promise<Post[]> {
    return this.findAll({ author: authorName });
  }

  async findAll(filters: PostFilters = {}): Promise<Post[]> {
    try {
      let query = this.client.from("posts").select("*");

      if (filters.submolt) {
        query = query.eq("submolt_name", filters.submolt);
      }

      if (filters.author) {
        query = query.eq("author_name", filters.author);
      }

      if (filters.sort === "new") {
        query = query.order("created_at", { ascending: false });
      } else if (filters.sort === "top") {
        query = query.order("upvotes", { ascending: false });
      } else if (filters.sort === "rising") {
        query = query.order("created_at", { ascending: false });
      } else {
        query = query.order("created_at", { ascending: false });
      }

      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(this.mapToModel);
    } catch (error) {
      console.error("SupabasePostRepository.findAll error:", error);
      return [];
    }
  }

  async create(
    data: Omit<
      Post,
      "id" | "upvotes" | "downvotes" | "created_at" | "is_pinned"
    >,
  ): Promise<Post> {
    const dbPost = {
      title: data.title,
      content: data.content,
      url: data.url,
      submolt_name: data.submolt,
      author_name: data.author.name,
      is_pinned: false,
    };

    try {
      const { data: inserted, error } = await this.client
        .from("posts")
        .insert(dbPost)
        .select()
        .single();

      if (error) throw error;
      return this.mapToModel(inserted);
    } catch (error) {
      console.error("SupabasePostRepository.create error:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.client.from("posts").delete().eq("id", id);
      return !error;
    } catch (error) {
      console.error("SupabasePostRepository.delete error:", error);
      return false;
    }
  }

  async incrementUpvotes(id: string): Promise<Post | null> {
    try {
      const { data: post, error: fetchError } = await this.client
        .from("posts")
        .select("upvotes")
        .eq("id", id)
        .single();

      if (fetchError || !post) return null;

      const { data: updated, error } = await this.client
        .from("posts")
        .update({ upvotes: post.upvotes + 1 })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToModel(updated);
    } catch (error) {
      console.error("SupabasePostRepository.incrementUpvotes error:", error);
      return null;
    }
  }

  async incrementDownvotes(id: string): Promise<Post | null> {
    try {
      const { data: post, error: fetchError } = await this.client
        .from("posts")
        .select("downvotes")
        .eq("id", id)
        .single();

      if (fetchError || !post) return null;

      const { data: updated, error } = await this.client
        .from("posts")
        .update({ downvotes: post.downvotes + 1 })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToModel(updated);
    } catch (error) {
      console.error("SupabasePostRepository.incrementDownvotes error:", error);
      return null;
    }
  }

  async togglePin(id: string, pinned: boolean): Promise<Post | null> {
    try {
      const { data: updated, error } = await this.client
        .from("posts")
        .update({ is_pinned: pinned })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return this.mapToModel(updated);
    } catch (error) {
      console.error("SupabasePostRepository.togglePin error:", error);
      return null;
    }
  }
}

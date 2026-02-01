import type { ICommentRepository } from "@/repositories/interfaces/ICommentRepository";
import type { Comment } from "@/models/comment";
import SupabaseService from "@/lib/supabase";

export class SupabaseCommentRepository implements ICommentRepository {
    private get client() {
        return SupabaseService.getInstance().getClient();
    }

    async findById(id: string): Promise<Comment | null> {
        const { data, error } = await this.client
            .from("comments_view")
            .select("*")
            .eq("id", id)
            .single();

        if (error || !data) return null;
        return this.mapToComment(data);
    }

    async findByPostId(postId: string): Promise<Comment[]> {
        const { data, error } = await this.client
            .from("comments_view")
            .select("*")
            .eq("post_id", postId)
            .order("created_at", { ascending: true });

        if (error || !data) return [];
        return data.map(this.mapToComment);
    }

    async findByAuthor(authorId: string): Promise<Comment[]> {
        const { data, error } = await this.client
            .from("comments_view")
            .select("*")
            .eq("author_id", authorId)
            .order("created_at", { ascending: false });

        if (error || !data) return [];
        return data.map(this.mapToComment);
    }

    async create(
        data: Omit<
            Comment,
            "id" | "upvotes" | "downvotes" | "created_at" | "author" | "type" | "is_pinned"
        >,
    ): Promise<Comment> {
        const { data: newComment, error } = await this.client
            .from("comments")
            .insert({
                post_id: data.post_id,
                parent_id: data.parent_id,
                author_id: data.author_id,
                text: data.text,
                cont_type: 'comment'
            })
            .select("*, author:agents(name)")
            .single();

        if (error) throw new Error(error.message);
        if (!newComment) throw new Error("Failed to create comment");

        return this.mapToComment(newComment);
    }

    async delete(id: string): Promise<boolean> {
        const { error } = await this.client.from("comments").delete().eq("id", id);
        return !error;
    }

    async incrementUpvotes(id: string): Promise<Comment | null> {
        const { data, error } = await this.client.rpc("increment_upvotes", { row_id: id });
        if (error || !data) return null;
        return this.findById(id);
    }

    async incrementDownvotes(id: string): Promise<Comment | null> {
        const { data, error } = await this.client.rpc("increment_downvotes", { row_id: id });
        if (error || !data) return null;
        return this.findById(id);
    }

    async togglePin(id: string, pinned: boolean): Promise<Comment | null> {
        const { data, error } = await this.client
            .from("comments")
            .update({ is_pinned: pinned })
            .eq("id", id)
            .select()
            .single();

        if (error || !data) return null;
        return this.mapToComment(data);
    }

    private mapToComment(data: any): Comment {
        return {
            id: data.id,
            post_id: data.post_id,
            parent_id: data.parent_id,
            author_id: data.author_id,
            text: data.text || data.content,
            upvotes: data.upvotes || 0,
            downvotes: data.downvotes || 0,
            created_at: data.created_at,
            cont_type: "comment",
            is_pinned: data.is_pinned || false,
            author: data.author ? { name: data.author.name } : { name: "Unknown" },
        };
    }
}

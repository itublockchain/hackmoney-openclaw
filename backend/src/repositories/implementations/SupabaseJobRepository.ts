import type {
  IJobRepository,
  JobFilters,
} from "@/repositories/interfaces/IJobRepository";
import type { Job } from "@/models/job";
import SupabaseService from "@/lib/supabase";

export class SupabaseJobRepository implements IJobRepository {
  private get client() {
    return SupabaseService.getInstance().getClient();
  }

  async findById(id: string): Promise<Job | null> {
    try {
      const { data, error } = await this.client
        .from("jobs")
        .select("*, agents(username, reputation, feedback_count), categories(name), offers(*, agents(username, reputation, feedback_count))")
        .eq("id", id)
        .single();
      if (error) throw error;

      // Derive worker_agent_id from accepted offer if not present on job
      // Note: Supabase's single() might return Filtered array for filtered relations
      // But typically we process the array.
      const jobData = data as any;
      if (jobData.offers && jobData.offers.length > 0) {
        // If there's an accepted offer, that agent is the worker
        const acceptedOffer = jobData.offers.find((o: any) => o.status === "accepted");
        if (acceptedOffer) {
          jobData.worker_agent_id = acceptedOffer.agent_id;
        }
      }
      return jobData;
    } catch (error: any) {
      // Suppress "0 rows" error as it just means "Not Found"
      if (error?.code === 'PGRST116') {
        return null;
      }
      console.error("SupabaseJobRepository.findById error:", error);
      return null;
    }
  }

  async findAll(filters: JobFilters = {}): Promise<Job[]> {
    try {
      let offersJoin = "offers!left(*)";
      // If filtering by worker, we need an INNER join on offers to filter the parent jobs
      if (filters.worker_agent_id) {
        offersJoin = "offers!inner(*)";
      }

      let selectQuery = `*, agents(username, reputation, feedback_count), categories(name), ${offersJoin}`;

      if (filters.summaryOnly) {
        // Select only lightweight columns for list views
        // Note: We still need joined tables for UI display (agent name, category)
        selectQuery = `
          id, title, status, budget_amount, created_at, category_id, owner_agent_id,
          agents(username, reputation, feedback_count), 
          categories(name), 
          ${offersJoin}
        `;
      }

      let query = this.client
        .from("jobs")
        .select(selectQuery);

      if (filters.category_id) {
        query = query.eq("category_id", filters.category_id);
      }
      if (filters.owner_agent_id) {
        query = query.eq("owner_agent_id", filters.owner_agent_id);
      }

      // Filter by Worker = Job has an accepted offer from this agent
      if (filters.worker_agent_id) {
        query = query.eq("offers.agent_id", filters.worker_agent_id);
        query = query.eq("offers.status", "accepted");
      }

      if (filters.status) {
        if (filters.status.includes(',')) {
          // split strings and filter
          const statuses = filters.status.split(',');
          query = query.in("status", statuses);
        } else {
          query = query.eq("status", filters.status);
        }
      }

      // Ensure we call order on the query builder
      const { data, error } = await query.order("created_at", { ascending: false }).limit(filters.limit || 1000);

      if (error) throw error;

      const jobs = (data as any[]).map(job => {
        if (job.offers) {
          // Find accepted offer in the joined offers
          // Note: If we don't partial filter in select, we do it here.
          // To be safe and performant, let's just look at the array.
          const acceptedOffer = Array.isArray(job.offers)
            ? job.offers.find((o: any) => o.status === "accepted")
            : (job.offers.status === "accepted" ? job.offers : null);

          if (acceptedOffer) {
            job.worker_agent_id = acceptedOffer.agent_id;
          }
        }
        return job;
      });

      return jobs;
    } catch (error) {
      console.error("SupabaseJobRepository.findAll error:", error);
      return [];
    }
  }

  async create(
    data: Omit<Job, "id" | "created_at" | "updated_at">
  ): Promise<Job> {
    try {
      const { data: inserted, error } = await this.client
        .from("jobs")
        .insert(data)
        .select()
        .single();
      if (error) throw error;
      return inserted;
    } catch (error) {
      console.error("SupabaseJobRepository.create error:", error);
      throw error;
    }
  }

  async update(
    id: string,
    updates: Partial<
      Omit<Job, "id" | "owner_agent_id" | "created_at" | "updated_at">
    >
  ): Promise<Job | null> {
    try {
      // Ensure we don't try to update read-only computed fields
      // and explicit exclude worker_agent_id which isn't a column
      const { worker_agent_id, ...safeUpdates } = updates as any;

      const { data, error } = await this.client
        .from("jobs")
        .update(safeUpdates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    } catch (error) {
      console.error("SupabaseJobRepository.update error:", error);
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const { error } = await this.client.from("jobs").delete().eq("id", id);
      return !error;
    } catch (error) {
      console.error("SupabaseJobRepository.delete error:", error);
      return false;
    }
  }

  async search(query: string): Promise<Job[]> {
    try {
      // Clean the query and handle spaces for PostgREST
      const searchPattern = `%${query.trim()}%`;

      const { data, error } = await this.client
        .from("jobs")
        .select("*, agents(username, reputation, feedback_count), categories(name)")
        .or(`title.ilike.${searchPattern},description_md.ilike.${searchPattern}`)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as any) || [];
    } catch (error) {
      console.error("SupabaseJobRepository.search error:", error);
      return [];
    }
  }
}

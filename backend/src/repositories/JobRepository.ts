import type { Job } from "@/models/job";
import { mockJobs } from "@/data/mock";
import SupabaseService from "@/lib/supabase";

export class JobRepository {
  private useSupabase(): boolean {
    try {
      const client = SupabaseService.getInstance().getClient();
      return !!client;
    } catch {
      return false;
    }
  }

  async getAll(): Promise<Job[]> {
    if (!this.useSupabase()) {
      return [...mockJobs];
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const { data, error } = await client
        .from("jobs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map Supabase snake_case to CamelCase/interface if needed
      // Currently DB columns match interface mostly, but budget needs mapping
      return (
        data.map((job: any) => ({
          ...job,
          budget: { min: job.budget_min, max: job.budget_max },
          skills: job.skills || [],
        })) || []
      );
    } catch (error) {
      console.error("Error fetching jobs from Supabase:", error);
      return [...mockJobs];
    }
  }

  async getById(id: string): Promise<Job | null> {
    if (!this.useSupabase()) {
      return mockJobs.find((j) => j.id === id) || null;
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const { data, error } = await client
        .from("jobs")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      return {
        ...data,
        budget: { min: data.budget_min, max: data.budget_max },
        skills: data.skills || [],
      };
    } catch (error) {
      console.error("Error fetching job from Supabase:", error);
      return mockJobs.find((j) => j.id === id) || null;
    }
  }

  async create(
    data: Omit<
      Job,
      "id" | "proposals" | "upvotes" | "downvotes" | "created_at"
    >,
  ): Promise<Job> {
    const newJob = {
      id: `job_${Date.now()}`,
      ...data,
      proposals: 0,
      upvotes: 0,
      downvotes: 0,
      created_at: new Date().toISOString(),
      is_urgent: data.is_urgent || false,
    };

    if (!this.useSupabase()) {
      mockJobs.unshift(newJob);
      return newJob;
    }

    try {
      const client = SupabaseService.getInstance().getClient();
      const dbJob = {
        id: `job_${Date.now()}`,
        title: data.title,
        description: data.description,
        budget_min: data.budget.min,
        budget_max: data.budget.max,
        category: data.category,
        skills: data.skills,
        posted_by: data.posted_by,
        posted_at: new Date().toISOString(),
        is_urgent: data.is_urgent,
      };

      const { data: inserted, error } = await client
        .from("jobs")
        .insert(dbJob)
        .select()
        .single();

      if (error) throw error;

      return {
        ...inserted,
        budget: { min: inserted.budget_min, max: inserted.budget_max },
        skills: inserted.skills || [],
      };
    } catch (error) {
      console.error("Error creating job in Supabase:", error);
      mockJobs.unshift(newJob);
      return newJob;
    }
  }
}

export default new JobRepository();

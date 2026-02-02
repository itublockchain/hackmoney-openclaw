import type { ICategoryRepository, CategoryWithJobCount } from "@/repositories/interfaces/ICategoryRepository";
import type { Category } from "@/models/marketplace";
import SupabaseService from "@/lib/supabase";

export class SupabaseCategoryRepository implements ICategoryRepository {
    private get client() {
        return SupabaseService.getInstance().getClient();
    }

    async findAll(): Promise<Category[]> {
        try {
            const { data, error } = await this.client
                .from("categories")
                .select("*")
                .order("name", { ascending: true });

            if (error) {
                console.warn("SupabaseCategoryRepository.findAll error (falling back to mock):", error.message);
                const { MockCategoryRepository } = await import("./MockCategoryRepository");
                return new MockCategoryRepository().findAll();
            }

            if (!data || data.length === 0) {
                console.log("Supabase categories empty, falling back to mock data");
                const { MockCategoryRepository } = await import("./MockCategoryRepository");
                return new MockCategoryRepository().findAll();
            }

            return data;
        } catch (error) {
            console.error("SupabaseCategoryRepository.findAll error:", error);
            const { MockCategoryRepository } = await import("./MockCategoryRepository");
            return new MockCategoryRepository().findAll();
        }
    }

    async findById(id: string): Promise<Category | null> {
        try {
            const { data, error } = await this.client
                .from("categories")
                .select("*")
                .eq("id", id)
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("SupabaseCategoryRepository.findById error:", error);
            return null;
        }
    }

    async findByName(name: string): Promise<Category | null> {
        try {
            const { data, error } = await this.client
                .from("categories")
                .select("*")
                .eq("name", name)
                .single();
            if (error) throw error;
            return data;
        } catch (error) {
            console.error("SupabaseCategoryRepository.findByName error:", error);
            return null;
        }
    }

    async findAllWithJobCount(): Promise<CategoryWithJobCount[]> {
        try {
            // Get all categories
            const { data: categories, error: catError } = await this.client
                .from("categories")
                .select("*")
                .order("name", { ascending: true });

            // Fallback if error or empty
            if (catError || !categories || categories.length === 0) {
                console.log("Supabase categories empty/error, falling back to mock data");
                const { MockCategoryRepository } = await import("./MockCategoryRepository");
                return new MockCategoryRepository().findAllWithJobCount();
            }

            // Get job counts per category
            const { data: jobCounts, error: jobError } = await this.client
                .from("jobs")
                .select("category_id")
                .not("category_id", "is", null);

            if (jobError) throw jobError;

            // Count jobs per category
            const countMap: Record<string, number> = {};
            (jobCounts || []).forEach((job: { category_id: string }) => {
                countMap[job.category_id] = (countMap[job.category_id] || 0) + 1;
            });

            return categories.map(cat => ({
                ...cat,
                job_count: countMap[cat.id] || 0
            }));
        } catch (error) {
            console.error("SupabaseCategoryRepository.findAllWithJobCount error:", error);
            const { MockCategoryRepository } = await import("./MockCategoryRepository");
            return new MockCategoryRepository().findAllWithJobCount();
        }
    }

    async create(data: Omit<Category, "id" | "created_at" | "updated_at">): Promise<Category> {
        try {
            const { data: inserted, error } = await this.client
                .from("categories")
                .insert(data)
                .select()
                .single();
            if (error) throw error;
            return inserted;
        } catch (error) {
            console.error("SupabaseCategoryRepository.create error:", error);
            throw error;
        }
    }
}

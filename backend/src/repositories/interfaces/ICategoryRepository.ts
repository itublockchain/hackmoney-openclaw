import type { Category } from "@/models/marketplace";

export interface CategoryWithJobCount extends Category {
    job_count: number;
}

export interface ICategoryRepository {
    findAll(): Promise<Category[]>;
    findById(id: string): Promise<Category | null>;
    findByName(name: string): Promise<Category | null>;
    findAllWithJobCount(): Promise<CategoryWithJobCount[]>;
    create(data: Omit<Category, "id" | "created_at" | "updated_at">): Promise<Category>;
}

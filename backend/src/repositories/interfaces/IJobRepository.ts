import type { Job, JobStatus } from "@/models/job";

export interface JobFilters {
    category_id?: string;
    owner_agent_id?: string;
    status?: JobStatus;
    limit?: number;
}

export interface IJobRepository {
    findById(id: string): Promise<Job | null>;
    findAll(filters?: JobFilters): Promise<Job[]>;
    create(data: Omit<Job, "id" | "created_at" | "updated_at">): Promise<Job>;
    update(id: string, updates: Partial<Omit<Job, "id" | "owner_agent_id" | "created_at" | "updated_at">>): Promise<Job | null>;
    delete(id: string): Promise<boolean>;
}

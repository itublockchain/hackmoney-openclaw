import type { IJobRepository, JobFilters } from "@/repositories/interfaces/IJobRepository";
import type { Job } from "@/models/job";
import { mockJobs } from "@/data/mock";

export class MockJobRepository implements IJobRepository {
    private jobs: Job[] = [...mockJobs];

    async findById(id: string): Promise<Job | null> {
        return this.jobs.find(j => j.id === id) || null;
    }

    async findAll(filters: JobFilters = {}): Promise<Job[]> {
        let result = [...this.jobs];
        if (filters.category_id) result = result.filter(j => j.category_id === filters.category_id);
        if (filters.status) result = result.filter(j => j.status === filters.status);
        if (filters.owner_agent_id) result = result.filter(j => j.owner_agent_id === filters.owner_agent_id);
        return result.slice(0, filters.limit || 100);
    }

    async create(data: Omit<Job, "id" | "created_at" | "updated_at">): Promise<Job> {
        const job: Job = {
            ...data,
            id: `job_${Date.now()}`,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        this.jobs.push(job);
        return job;
    }

    async update(id: string, updates: Partial<Omit<Job, "id" | "owner_user_id" | "created_at" | "updated_at">>): Promise<Job | null> {
        const index = this.jobs.findIndex(j => j.id === id);
        if (index === -1) return null;
        this.jobs[index] = { ...this.jobs[index]!, ...updates, updated_at: new Date().toISOString() };
        return this.jobs[index]!;
    }

    async delete(id: string): Promise<boolean> {
        const index = this.jobs.findIndex(j => j.id === id);
        if (index === -1) return false;
        this.jobs.splice(index, 1);
        return true;
    }
}

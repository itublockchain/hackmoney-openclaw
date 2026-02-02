import type { Offer } from "@/models/offer";

export interface OfferFilters {
    job_id?: string;
    agent_id?: string;
    status?: string;
    limit?: number;
}

export interface IOfferRepository {
    findById(id: string): Promise<Offer | null>;
    findAll(filters?: OfferFilters): Promise<Offer[]>;
    create(data: Omit<Offer, "id" | "created_at" | "updated_at">): Promise<Offer>;
    update(id: string, updates: Partial<Omit<Offer, "id" | "job_id" | "agent_id" | "created_at" | "updated_at">>): Promise<Offer | null>;
    delete(id: string): Promise<boolean>;
}

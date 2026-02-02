import type { IOfferRepository, OfferFilters } from "@/repositories/interfaces/IOfferRepository";
import type { Offer } from "@/models/offer";

export class MockOfferRepository implements IOfferRepository {
    private offers: Offer[] = [];

    async findById(id: string): Promise<Offer | null> {
        return this.offers.find(o => o.id === id) || null;
    }

    async findAll(filters: OfferFilters = {}): Promise<Offer[]> {
        let results = [...this.offers];

        if (filters.job_id) results = results.filter(o => o.job_id === filters.job_id);
        if (filters.agent_id) results = results.filter(o => o.agent_id === filters.agent_id);
        if (filters.status) results = results.filter(o => o.status === filters.status);

        results.sort((a, b) => b.created_at.localeCompare(a.created_at));

        if (filters.limit) results = results.slice(0, filters.limit);

        return results;
    }

    async create(data: Omit<Offer, "id" | "created_at" | "updated_at">): Promise<Offer> {
        const newOffer: Offer = {
            ...data,
            id: Math.random().toString(36).substring(7),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            agent: { username: "mock_agent" },
            job: { title: "Mock Job" }
        };
        this.offers.push(newOffer);
        return newOffer;
    }

    async update(id: string, updates: Partial<Omit<Offer, "id" | "job_id" | "agent_id" | "created_at" | "updated_at">>): Promise<Offer | null> {
        const index = this.offers.findIndex(o => o.id === id);
        if (index === -1) return null;

        const updatedOffer: Offer = {
            ...this.offers[index],
            ...updates,
            updated_at: new Date().toISOString()
        } as Offer;

        this.offers[index] = updatedOffer;
        return updatedOffer;
    }

    async delete(id: string): Promise<boolean> {
        const initialLength = this.offers.length;
        this.offers = this.offers.filter(o => o.id !== id);
        return this.offers.length < initialLength;
    }
}

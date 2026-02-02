import { offerRepository } from "@/repositories/OfferRepository";
import type { Offer, OfferStatus } from "@/models/offer";
import type { OfferFilters } from "@/repositories/interfaces/IOfferRepository";

export class OfferService {
    static async createOffer(data: {
        job_id: string;
        agent_id: string;
    }): Promise<Offer> {
        return offerRepository.create({
            ...data,
            status: 'pending'
        });
    }

    static async getOfferById(id: string): Promise<Offer | null> {
        return offerRepository.findById(id);
    }

    static async getOffers(filters?: OfferFilters): Promise<Offer[]> {
        return offerRepository.findAll(filters);
    }

    static async updateOfferStatus(id: string, status: OfferStatus): Promise<Offer | null> {
        return offerRepository.update(id, { status });
    }

    static async deleteOffer(id: string): Promise<boolean> {
        return offerRepository.delete(id);
    }
}

import { offerRepository } from "@/repositories/OfferRepository";
import type { Offer, OfferStatus } from "@/models/offer";
import type { OfferFilters } from "@/repositories/interfaces/IOfferRepository";


export class OfferService {
  async createOffer(data: {
    job_id: string;
    agent_id: string;
  }): Promise<Offer> {
    const existing = await this.getOffers({
      job_id: data.job_id,
      agent_id: data.agent_id,
    });

    if (existing.length > 0) {
      throw new Error("Agent has already submitted an offer for this job");
    }

    return offerRepository.create({
      ...data,
      status: "pending",
    });
  }

  async getOfferById(id: string): Promise<Offer | null> {
    return offerRepository.findById(id);
  }

  async getOffers(filters?: OfferFilters): Promise<Offer[]> {
    return offerRepository.findAll(filters);
  }

  async updateOfferStatus(
    id: string,
    status: OfferStatus
  ): Promise<Offer | null> {
    const updatedOffer = await offerRepository.update(id, { status });

    return updatedOffer;
  }

  async deleteOffer(id: string): Promise<boolean> {
    return offerRepository.delete(id);
  }
}

export default new OfferService();

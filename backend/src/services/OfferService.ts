import { offerRepository } from "@/repositories/OfferRepository";
import type { Offer, OfferStatus } from "@/models/offer";
import type { OfferFilters } from "@/repositories/interfaces/IOfferRepository";
import JobService from "@/services/JobService";

export class OfferService {
  async createOffer(data: {
    job_id: string;
    agent_id: string;
  }): Promise<Offer> {
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

    if (updatedOffer && status === "accepted") {
      // Side effect: Update Job status and assign worker
      await JobService.updateJob(updatedOffer.job_id, {
        worker_agent_id: updatedOffer.agent_id,
        status: "agreed",
      });
    }

    return updatedOffer;
  }

  async deleteOffer(id: string): Promise<boolean> {
    return offerRepository.delete(id);
  }
}

export default new OfferService();

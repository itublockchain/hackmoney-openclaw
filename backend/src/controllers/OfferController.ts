import type { Request, Response } from "express";
import OfferService from "@/services/OfferService";
import type { OfferStatus } from "@/models/offer";

export default class OfferController {
  static async createOffer(req: Request, res: Response) {
    try {
      const { job_id } = req.body;
      const agentId = (req as any).agent?.id;

      if (!agentId) {
        res.status(401).json({ success: false, error: "Unauthorized" });
        return;
      }

      if (!job_id) {
        res.status(400).json({ success: false, error: "Missing job_id" });
        return;
      }

      const offer = await OfferService.createOffer({
        job_id,
        agent_id: agentId,
      });

      res.status(201).json({ success: true, offer });
    } catch (error) {
      console.error("OfferController.createOffer error:", error);
      res.status(500).json({ success: false, error: "Failed to create offer" });
    }
  }

  static async getOffers(req: Request, res: Response) {
    try {
      const { job_id, agent_id, status, limit } = req.query;

      const offers = await OfferService.getOffers({
        job_id: typeof job_id === "string" ? job_id : undefined,
        agent_id: typeof agent_id === "string" ? agent_id : undefined,
        status: typeof status === "string" ? status : undefined,
        limit: limit ? parseInt(limit as string) : undefined,
      });

      res.json({ success: true, offers });
    } catch (error) {
      console.error("OfferController.getOffers error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch offers" });
    }
  }

  static async getOfferById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const offer = await OfferService.getOfferById(id as string);

      if (!offer) {
        res.status(404).json({ success: false, error: "Offer not found" });
        return;
      }

      res.json({ success: true, offer });
    } catch (error) {
      console.error("OfferController.getOfferById error:", error);
      res.status(500).json({ success: false, error: "Failed to fetch offer" });
    }
  }

  static async updateOfferStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!status) {
        res.status(400).json({ success: false, error: "Status is required" });
        return;
      }

      const offer = await OfferService.updateOfferStatus(
        id as string,
        status as OfferStatus
      );

      if (!offer) {
        res.status(404).json({ success: false, error: "Offer not found" });
        return;
      }

      res.json({ success: true, offer });
    } catch (error) {
      console.error("OfferController.updateOfferStatus error:", error);
      res.status(500).json({ success: false, error: "Failed to update offer" });
    }
  }

  static async deleteOffer(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const success = await OfferService.deleteOffer(id as string);

      if (!success) {
        res.status(404).json({ success: false, error: "Offer not found" });
        return;
      }

      res.json({ success: true });
    } catch (error) {
      console.error("OfferController.deleteOffer error:", error);
      res.status(500).json({ success: false, error: "Failed to delete offer" });
    }
  }
}

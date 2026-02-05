import type { Feedback } from "@/models/feedback";

export interface IFeedbackRepository {
    create(feedback: Omit<Feedback, "id">): Promise<Feedback>;
    findByAgentId(erc8004_id: number): Promise<Feedback[]>;
}

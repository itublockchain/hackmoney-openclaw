import type { IFeedbackRepository } from "@/repositories/interfaces/IFeedbackRepository";
import type { Feedback } from "@/models/feedback";
import { mockFeedbacks } from "@/data/mock";

export class MockFeedbackRepository implements IFeedbackRepository {
    async create(feedback: Omit<Feedback, "id">): Promise<Feedback> {
        const newFeedback: Feedback = {
            ...feedback,
            id: `feedback_${Date.now()}`,
        };
        mockFeedbacks.push(newFeedback);
        return newFeedback;
    }

    async findByAgentId(erc8004_id: number): Promise<Feedback[]> {
        return mockFeedbacks.filter((f) => f.erc8004_id === erc8004_id);
    }
}

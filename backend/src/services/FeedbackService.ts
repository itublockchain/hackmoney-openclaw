import FeedbackRepository from "@/repositories/FeedbackRepository";
import AgentRepository from "@/repositories/AgentRepository";
import type { Feedback } from "@/models/feedback";

class FeedbackService {
    async addFeedback(data: Omit<Feedback, "id">): Promise<Feedback> {
        // 1. Create feedback
        const feedback = await FeedbackRepository.create(data);

        // 2. Find Agent by erc8004_id
        // We assumeerc8004_id is present and valid as per foreign key constraint in DB,
        // but we need to update the agent's aggregate stats.
        const agent = await AgentRepository.findByErc8004Id(data.erc8004_id);

        if (agent) {
            // 3. Update Agent
            // Accumulate reputation and increment count
            const newReputation = Number(agent.reputation) + Number(data.reputation);
            const newCount = Number(agent.feedback_count) + 1;

            await AgentRepository.update(agent.id, {
                reputation: newReputation,
                feedback_count: newCount
            });
        } else {
            console.warn(`Feedback created for non-existent agent erc8004_id: ${data.erc8004_id}`);
        }

        return feedback;
    }

    async getFeedbackForAgent(erc8004_id: number): Promise<Feedback[]> {
        return await FeedbackRepository.findByAgentId(erc8004_id);
    }
}

export default new FeedbackService();

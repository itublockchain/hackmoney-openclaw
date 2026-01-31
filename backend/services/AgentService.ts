import AgentRepository from "../repositories/AgentRepository";
import PostRepository from "../repositories/PostRepository";
import config from "../config";
import type { Agent } from "../src/types/models";

export class AgentService {
    async getAllAgents(): Promise<Agent[]> {
        return await AgentRepository.getAll();
    }

    async registerAgent(name: string, description?: string): Promise<{
        agent: {
            api_key: string;
            claim_url: string;
            verification_code: string;
        };
        important: string;
    }> {
        const apiKey = `${config.APP_NAME.toLowerCase()}_${Date.now()}`;
        const claimCode = `${config.APP_NAME.toLowerCase()}_claim_${Date.now()}`;
        const verificationCode = `reef-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

        await AgentRepository.create({
            api_key: apiKey,
            name,
            description: description || "",
            karma: 0,
            follower_count: 0,
            following_count: 0,
            is_claimed: false,
            is_active: true,
            created_at: new Date().toISOString(),
        });

        return {
            agent: {
                api_key: apiKey,
                claim_url: `${config.APP_URL}/claim/${claimCode}`,
                verification_code: verificationCode,
            },
            important: "⚠️ SAVE YOUR API KEY!",
        };
    }

    async getAgentByApiKey(apiKey: string): Promise<Agent | null> {
        return await AgentRepository.findByApiKey(apiKey);
    }

    async getAgentByName(name: string): Promise<Agent | null> {
        return await AgentRepository.findByName(name);
    }

    async getAgentProfile(name: string) {
        const agent = await AgentRepository.findByName(name);
        if (!agent) return null;

        const recentPosts = PostRepository.findByAuthor(agent.name);
        return {
            agent,
            recentPosts,
        };
    }

    async updateAgent(apiKey: string, updates: { description?: string; metadata?: any }): Promise<Agent | null> {
        return await AgentRepository.update(apiKey, updates);
    }

    followAgent(targetName: string): { success: boolean; message: string } {
        // In a real implementation, this would track followers
        return { success: true, message: `Now following ${targetName}` };
    }

    unfollowAgent(targetName: string): { success: boolean; message: string } {
        // In a real implementation, this would untrack followers
        return { success: true, message: `Unfollowed ${targetName}` };
    }

    async uploadAvatar(apiKey: string, filePath: string) {
        const agent = await AgentRepository.findByApiKey(apiKey);
        if (!agent) {
            return { success: false, error: "Agent not found" };
        }

        // Update agent with avatar path
        const updatedAgent = await AgentRepository.update(apiKey, { avatar: filePath });
        return { success: true, message: "Avatar uploaded successfully", agent: updatedAgent };
    }

    async deleteAvatar(apiKey: string) {
        const agent = await AgentRepository.findByApiKey(apiKey);
        if (!agent) {
            return { success: false, error: "Agent not found" };
        }

        // Remove avatar path
        const updatedAgent = await AgentRepository.update(apiKey, { avatar: null });
        return { success: true, message: "Avatar deleted successfully", agent: updatedAgent };
    }
}

export default new AgentService();

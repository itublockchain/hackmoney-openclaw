import type { Agent } from "../src/types/models";
import { mockAgents } from "../data/mock";
import SupabaseService from "../lib/supabase";

export class AgentRepository {
    private useSupabase(): boolean {
        try {
            const client = SupabaseService.getInstance().getClient();
            return !!client;
        } catch {
            return false;
        }
    }

    async findByApiKey(apiKey: string): Promise<Agent | null> {
        if (!this.useSupabase()) {
            return mockAgents[apiKey] || null;
        }

        try {
            const client = SupabaseService.getInstance().getClient();
            const { data, error } = await client
                .from('agents')
                .select('*')
                .eq('api_key', apiKey)
                .single();

            if (error) throw error;
            return data;
        } catch {
            return null;
        }
    }

    async findByName(name: string): Promise<Agent | null> {
        if (!this.useSupabase()) {
            return Object.values(mockAgents).find((a) => a.name === name) || null;
        }

        try {
            const client = SupabaseService.getInstance().getClient();
            const { data, error } = await client
                .from('agents')
                .select('*')
                .eq('name', name)
                .single();

            if (error) throw error;
            return data;
        } catch {
            return null;
        }
    }

    async getAll(): Promise<Agent[]> {
        if (!this.useSupabase()) {
            return Object.values(mockAgents);
        }

        try {
            const client = SupabaseService.getInstance().getClient();
            const { data, error } = await client
                .from('agents')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch {
            return [];
        }
    }

    async create(data: Omit<Agent, "api_key"> & { api_key: string }): Promise<Agent> {
        const agent: Agent = {
            ...data,
            karma: data.karma ?? 0,
            follower_count: data.follower_count ?? 0,
            following_count: data.following_count ?? 0,
            is_claimed: data.is_claimed ?? false,
            is_active: data.is_active ?? true,
            created_at: data.created_at ?? new Date().toISOString(),
        };

        if (!this.useSupabase()) {
            mockAgents[agent.api_key] = agent;
            return agent;
        }

        try {
            const client = SupabaseService.getInstance().getClient();
            const { data: insertedData, error } = await client
                .from('agents')
                .insert(agent)
                .select()
                .single();

            if (error) throw error;
            return insertedData;
        } catch (error) {
            // Fallback to mock if insert fails
            mockAgents[agent.api_key] = agent;
            return agent;
        }
    }

    async update(apiKey: string, updates: Partial<Omit<Agent, "api_key">>): Promise<Agent | null> {
        if (!this.useSupabase()) {
            const agent = mockAgents[apiKey];
            if (!agent) return null;
            Object.assign(agent, updates);
            return agent;
        }

        try {
            const client = SupabaseService.getInstance().getClient();
            const { data, error } = await client
                .from('agents')
                .update(updates)
                .eq('api_key', apiKey)
                .select()
                .single();

            if (error) throw error;
            return data;
        } catch {
            return null;
        }
    }
}

export default new AgentRepository();

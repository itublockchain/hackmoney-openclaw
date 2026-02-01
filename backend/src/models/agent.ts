export interface Agent {
    // agent_metadata
    id: string;
    api_key: string;

    // agent_data
    name: string;
    description: string;

    // agent_state
    is_claimed: boolean;
    is_active: boolean;

    // Derived/Joined
    skills?: string[];
    metadata?: Record<string, any>;
}

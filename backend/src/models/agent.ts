export interface Agent {
    id: string;
    username: string;
    title?: string;
    description?: string;
    wallet_address?: string;
    erc8004_address?: string;
    metadata: Record<string, any>;
    created_at: string;
    updated_at: string;

    // Derived/Joined
    skills?: string[];
}


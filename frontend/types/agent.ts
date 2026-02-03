export interface AgentProfile {
    handle: string;
    displayName: string;
    formattedHandle: string;
    avatar: string;
    bio: string;
    karma: number;
    accountAge: string;
    website?: string;
    github?: string;
    skills: string[];
    stats: {
        posts: number;
        comments: number;
        submolts: number;
    };
    // Job Platform specific fields
    agentScore: number; // 0-100
    reputation: number; // 0-5 stars
    completedJobs: number;
    totalEarnings: number; // USD
    activeJobs: number;
    isVerified: boolean;
    specializations: string[];
    id?: string;
    walletAddress?: string;
}

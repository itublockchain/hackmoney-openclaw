export interface Agent {
    api_key: string;
    name: string;
    description: string;
    karma: number;
    follower_count: number;
    following_count: number;
    is_claimed: boolean;
    is_active: boolean;
    created_at: string;
    last_active?: string;
    metadata?: Record<string, any>;
    avatar?: string | null;
    // New fields
    rating?: number;
    completed_jobs?: number;
    skills?: string[];
    hourly_rate?: number;
    success_rate?: number;
    response_time?: string;
    category?: string;
}

export interface Job {
    id: string;
    title: string;
    description: string;
    budget: { min: number; max: number };
    category: string;
    skills: string[];
    posted_by: string;
    posted_at: string;
    proposals: number;
    is_urgent: boolean;
    upvotes: number;
    downvotes: number;
}

export interface Post {
    id: string;
    title: string;
    content: string | null;
    url?: string | null;
    submolt: string;
    upvotes: number;
    downvotes: number;
    author: {
        name: string;
    };
    created_at: string;
    is_pinned: boolean;
}

export interface Comment {
    id: string;
    post_id: string;
    content: string;
    upvotes: number;
    downvotes: number;
    author: {
        name: string;
    };
    created_at: string;
    parent_id: string | null;
}

export interface Submolt {
    name: string;
    display_name: string;
    description: string;
    subscriber_count: number;
    posts_count: number;
    is_joined: boolean;
    rules?: string[];
    created_at: string;
    avatar?: string | null;
    banner?: string | null;
    banner_color?: string;
    theme_color?: string;
}

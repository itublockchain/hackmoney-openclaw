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
    created_at: string;
    avatar?: string | null;
    banner?: string | null;
    banner_color?: string;
    theme_color?: string;
}

export interface Submolt {
    // submolt_metadata
    id: string;
    name: string;
    created_at: string;

    // submolt_data
    display_name: string;
    description: string;
    subscriber_count: number;
    rules: string[];
    avatar?: string | null;
    banner?: string | null;
    banner_color?: string;
    theme_color?: string;
}

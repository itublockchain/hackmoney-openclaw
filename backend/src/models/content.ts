export type ContentType = "post" | "job" | "comment";

export interface BaseContent {
    // content_metadata
    id: string;
    author_id: string;
    cont_type: ContentType;

    // content_body (common)
    text: string;
    upvotes: number;
    downvotes: number;
    created_at: string;

    // content_state
    is_pinned: boolean;

    // Joined/derived
    author?: {
        name: string;
    };
}
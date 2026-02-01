import type { BaseContent } from "./content";

export interface Comment extends BaseContent {
    cont_type: "comment";
    post_id: string;
    parent_id: string | null;
}
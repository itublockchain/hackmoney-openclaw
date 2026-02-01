import type { BaseContent } from "./content";

export interface Job extends BaseContent {
    cont_type: "job";
    submolt_id: string;
    title: string;

    // content_body job fields
    budget_min: number | null;
    budget_max: number | null;
    proposals: number;

    // content_state job fields
    is_urgent: boolean;
}

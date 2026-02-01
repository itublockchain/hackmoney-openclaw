import type { BaseContent } from "./content";

export interface Post extends BaseContent {
    cont_type: "post";
    submolt_id: string;
    title: string;
}
import type { BaseContent } from "./content";

export interface Post extends BaseContent {
    cont_type: "post";
    title: string;
}
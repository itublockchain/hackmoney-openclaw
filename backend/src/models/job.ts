export type JobStatus = 'approved' | 'submitted' | 'declined';

export interface Job {
    id: string;
    owner_agent_id: string;
    category_id?: string;
    status: JobStatus;
    budget_amount?: number;
    title: string;
    description_md?: string;
    requirements_md?: string;
    created_at: string;
    updated_at: string;
}



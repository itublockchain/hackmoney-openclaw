export interface Category {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Skill {
    id: string;
    name: string;
    created_at: string;
}

export interface AgentSkill {
    agent_id: string;
    skill_id: string;
    level?: number;
}

export interface JobAssignment {
    id: string;
    job_id: string;
    agent_id: string;
    created_at: string;
}

export interface JobThread {
    id: string;
    job_id: string;
    created_at: string;
}

export interface ChatMessage {
    id: string;
    thread_id: string;
    sender_user_id: string;
    message_text: string;
    created_at: string;
}

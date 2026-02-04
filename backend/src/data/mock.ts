import type { Agent } from "@/models/agent";
import type { Job } from "@/models/job";

// ============ MOCK DATA ============

export const mockUsers: Record<string, any> = {};

export const mockAgents: Record<string, Agent> = {
  "agent_1": {
    id: "agent_1_id",
    username: "codemaster",
    title: "Code Master",
    description: "Expert developer",
    metadata: {},
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    skills: ["TypeScript", "Node.js"]
  }
};

export const mockJobs: Job[] = [
  {
    id: "job_1",
    owner_agent_id: "agent_1_id",
    budget_amount: 1000,
    title: "Build a Marketplace",
    description_md: "Need a marketplace built",
    requirements_md: "Must use TypeScript",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: "reviewing"
  }
];

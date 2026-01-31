import { mockAgents } from "../data/mock";

// Extract the Agent type
type Agent = (typeof mockAgents)[string];

declare global {
    namespace Express {
        interface Request {
            apiKey?: string;
            agent?: Agent;
        }
    }
}
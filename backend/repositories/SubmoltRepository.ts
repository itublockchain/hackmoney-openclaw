import type { Submolt } from "../src/types/models";
import { mockSubmolts } from "../data/mock";

export class SubmoltRepository {
    findByName(name: string): Submolt | null {
        return mockSubmolts.find((s) => s.name.toLowerCase() === name.toLowerCase()) || null;
    }

    getAll(): Submolt[] {
        if (process.env.NODE_ENV === "production") {
            return [];
        }
        return [...mockSubmolts];
    }

    create(data: Omit<Submolt, "subscriber_count" | "created_at" | "posts_count" | "is_joined">): Submolt {
        const newSubmolt: Submolt = {
            ...data,
            subscriber_count: 0,
            posts_count: 0,
            is_joined: false,
            created_at: new Date().toISOString(),
        };
        mockSubmolts.push(newSubmolt);
        return newSubmolt;
    }
}

export default new SubmoltRepository();

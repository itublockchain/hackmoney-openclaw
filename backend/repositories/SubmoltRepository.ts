import type { Submolt } from "../src/types/models";
import { mockSubmolts } from "../data/mock";

export class SubmoltRepository {
    findByName(name: string): Submolt | null {
        return mockSubmolts.find((s) => s.name === name) || null;
    }

    getAll(): Submolt[] {
        return [...mockSubmolts];
    }

    create(data: Omit<Submolt, "subscriber_count" | "created_at">): Submolt {
        const newSubmolt: Submolt = {
            ...data,
            subscriber_count: 0,
            created_at: new Date().toISOString(),
        };
        mockSubmolts.push(newSubmolt);
        return newSubmolt;
    }
}

export default new SubmoltRepository();

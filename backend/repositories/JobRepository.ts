import type { Job } from "../src/types/models";
import { mockJobs } from "../data/mock";

export class JobRepository {
    getAll(): Job[] {
        return [...mockJobs];
    }
}

export default new JobRepository();

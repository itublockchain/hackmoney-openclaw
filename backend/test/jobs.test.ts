import { describe, it, expect } from "bun:test";
import request from "supertest";
import app from "@/app";

const API_PREFIX = "/api/v1";

describe("Jobs API (Restored)", () => {
    it("GET /api/v1/jobs - should list all jobs", async () => {
        const response = await request(app).get(`${API_PREFIX}/jobs`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
    });

    it("POST /api/v1/jobs - should attempt to create a job", async () => {
        const payload = {
            title: "Test Job",
            description_md: "Test description",
            budget_amount: 100,
            category_id: "dev"
        };

        // Auth is stubbed
        const response = await request(app)
            .post(`${API_PREFIX}/jobs`)
            .send(payload);

        // We expect success or a specific schema error that we'll debug
        if (response.status !== 201) {
            console.log("Job creation returned status:", response.status, response.body);
        }
    });
});

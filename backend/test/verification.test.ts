import { describe, it, expect } from "bun:test";
import request from "supertest";
import app from "@/app";

const API_PREFIX = "/api/v1";

describe("Marketplace API Verification", () => {
    describe("Health Check", () => {
        it("should return ok", async () => {
            const response = await request(app).get("/");
            expect(response.status).toBe(200);
            expect(response.body.status).toBe("ok");
        });
    });

    describe("Agents API", () => {
        it("should list all agents", async () => {
            const response = await request(app).get(`${API_PREFIX}/agents`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.agents)).toBe(true);
            if (response.body.agents.length > 0) {
                expect(response.body.agents[0]).toHaveProperty("username");
            }
        });

        it("should register a new agent", async () => {
            const payload = {
                username: "test_verified_agent",
                title: "Verified Agent",
                description: "Testing registration",
                metadata: { version: "1.0" }
            };
            const response = await request(app)
                .post(`${API_PREFIX}/agents/register`)
                .send(payload);

            expect([200, 201]).toContain(response.status);
            expect(response.body.success).toBe(true);
            expect(response.body.agent.username).toBe("test_verified_agent");
        });

        it("should fetch a specific agent by ID", async () => {
            // First get all agents to find an ID
            const listResp = await request(app).get(`${API_PREFIX}/agents`);
            const agentId = listResp.body.agents[0]?.id || "agent_1_id";

            const response = await request(app).get(`${API_PREFIX}/agents/${agentId}`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.agent.id).toBe(agentId);
        });

        it("should fetch agent metadata (EIP-8004 style)", async () => {
            const listResp = await request(app).get(`${API_PREFIX}/agents`);
            const agentId = listResp.body.agents[0]?.id || "agent_1_id";

            const response = await request(app).get(`${API_PREFIX}/agents/${agentId}/metadata`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty("type");
            expect(response.body.metadata).toHaveProperty("appId", agentId);
        });
    });

    describe("Jobs API", () => {
        it("should list all jobs", async () => {
            const response = await request(app).get(`${API_PREFIX}/jobs`);
            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(Array.isArray(response.body.jobs)).toBe(true);
        });

        it("should create a new job", async () => {
            const payload = {
                title: "Test Verification Job",
                description_md: "Testing job creation",
                budget_amount: 500,
                budget_currency: "USD",
                category_id: "dev"
            };

            // Note: authMiddleware is stubbed to succeed
            const response = await request(app)
                .post(`${API_PREFIX}/jobs`)
                .send(payload);

            expect([200, 201]).toContain(response.status);
            expect(response.body.success).toBe(true);
            expect(response.body.job.title).toBe("Test Verification Job");
        });
    });
});

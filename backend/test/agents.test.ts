import { describe, it, expect } from "bun:test";
import request from "supertest";
import app from "@/app";

const API_PREFIX = "/api/v1";

describe("Agents API (Restored)", () => {
    it("GET /api/v1/agents - should list all agents", async () => {
        const response = await request(app).get(`${API_PREFIX}/agents`);
        expect(response.status).toBe(200);
        expect(response.body.success).toBe(true);
        expect(Array.isArray(response.body.agents)).toBe(true);
    });

    it("POST /api/v1/agents/register - should register a new agent", async () => {
        const payload = {
            username: `test_agent_${Date.now()}`,
            title: "Test Agent",
            description: "Testing registration",
            metadata: {}
        };
        const response = await request(app)
            .post(`${API_PREFIX}/agents/register`)
            .send(payload);

        expect([200, 201]).toContain(response.status);
        expect(response.body.success).toBe(true);
    });
});

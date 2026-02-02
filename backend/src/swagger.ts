import swaggerJsdoc from "swagger-jsdoc";
import config from "./config";

const options: swaggerJsdoc.Options = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: `${config.APP_NAME} API ${config.APP_EMOJI}`,
            version: "1.0.0",
            description: config.APP_DESCRIPTION,
            contact: {
                name: config.APP_NAME,
                url: config.APP_URL,
            },
        },
        servers: [
            {
                url: `http://localhost:${config.PORT}`,
                description: "Development server",
            },
            {
                url: config.APP_URL,
                description: "Production server",
            },
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT",
                    description: `Enter your ${config.APP_NAME} JWT token or API key`,
                },
            },
            schemas: {
                Error: {
                    type: "object",
                    properties: {
                        success: { type: "boolean", example: false },
                        error: { type: "string" },
                        hint: { type: "string" },
                    },
                },
            },
        },
        tags: [
            { name: "Agents", description: "Agent registration and profile management" },
            { name: "Jobs", description: "Marketplace jobs and task management" },
            { name: "Posts", description: "Social feed, posts and communities" },
            { name: "Comments", description: "Comments on posts" },
            { name: "Feed", description: "Discovery and search services" },
        ],
    },
    apis: [
        "./src/models/*.ts",
        "./src/routes/*.ts",
        "./src/controllers/*.ts"
    ],
};

export const swaggerSpec = swaggerJsdoc(options);

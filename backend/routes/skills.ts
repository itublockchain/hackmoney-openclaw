import { Router } from "express";
import { readFile } from "fs/promises";
import { join } from "path";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const router = Router();


/**
 * @swagger
 * /api/v1/skills:
 *   get:
 *     summary: Get Moltbook SKILL.md
 *     tags: [Meta]
 *     responses:
 *       200:
 *         description: Moltbook skill file (markdown)
 */

router.get("/", async (_req, res) => {
    try {
        const skillPath = join(__dirname, "..", "data", "skill.md");
        const text = await readFile(skillPath, "utf-8");
        res.json({ success: true, skill: text });
    } catch (error) {
        console.error("Error reading SKILL.md:", error);
        res.status(500).json({ success: false, error: "Failed to read SKILL.md" });
    }
});

export default router;
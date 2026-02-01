
import fs from 'fs';
import path from 'path';
import config from '../config';

interface IAgentStorage {
    upload(fileName: string, data: Record<string, unknown>): Promise<string>;
}

export class MockAgentStorage implements IAgentStorage {
    private uploadDir: string;
    private baseUrl: string;

    constructor() {
        this.uploadDir = path.join(process.cwd(), 'uploads');
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
        this.baseUrl = config.APP_URL;
    }

    async upload(fileName: string, data: Record<string, unknown>): Promise<string> {
        const filePath = path.join(this.uploadDir, fileName);
        const fileContent = JSON.stringify(data, null, 2);

        await fs.promises.writeFile(filePath, fileContent);
        console.log(`[MockStorage] Saved metadata to ${filePath}`);

        return `${this.baseUrl}/uploads/${fileName}`;
    }
}

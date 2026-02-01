import { createClient, SupabaseClient } from '@supabase/supabase-js';
import config from '../config';

interface IAgentStorage {
    upload(fileName: string, data: Record<string, unknown>): Promise<string>;
}

export class SupabaseAgentStorage implements IAgentStorage {
    private supabase: SupabaseClient;
    private bucket: string;

    constructor() {
        // Ensure config has supabase creds
        if (!config.SUPABASE_URL || !config.SUPABASE_SERVICE_KEY) {
            throw new Error("Supabase credentials missing from config");
        }
        this.supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);
        this.bucket = config.SUPABASE_BUCKET;
    }

    private async ensureBucket() {
        const { data, error } = await this.supabase.storage.getBucket(this.bucket);
        if (error && error.message.includes("not found")) {
            console.log(`Bucket '${this.bucket}' not found. Creating it...`);
            const { data: bucketData, error: createError } = await this.supabase.storage.createBucket(this.bucket, {
                public: true
            });
            if (createError) {
                throw new Error(`Failed to create bucket '${this.bucket}': ${createError.message}`);
            }
            console.log(`Bucket '${this.bucket}' created successfully.`);
        } else if (error) {
            console.warn(`Error checking bucket '${this.bucket}':`, error.message);
        }
    }

    async upload(fileName: string, data: Record<string, unknown>): Promise<string> {
        await this.ensureBucket();
        const fileContent = JSON.stringify(data, null, 2);

        const { data: uploadData, error } = await this.supabase
            .storage
            .from(this.bucket)
            .upload(fileName, fileContent, {
                contentType: 'application/json',
                upsert: true
            });

        if (error) {
            console.error("Supabase upload error:", error);
            throw new Error(`Supabase upload failed: ${error.message}`);
        }

        const { data: publicUrlData } = this.supabase
            .storage
            .from(this.bucket)
            .getPublicUrl(fileName);

        return publicUrlData.publicUrl;
    }
}

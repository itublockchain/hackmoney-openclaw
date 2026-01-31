import SubmoltRepository from "../repositories/SubmoltRepository";
import PostRepository from "../repositories/PostRepository";
import type { Submolt, Post } from "../src/types/models";

export class SubmoltService {
    getAllSubmolts(): Submolt[] {
        return SubmoltRepository.getAll();
    }

    getSubmoltByName(name: string): Submolt | null {
        return SubmoltRepository.findByName(name);
    }

    createSubmolt(data: {
        name: string;
        display_name: string;
        description?: string;
    }): Submolt {
        return SubmoltRepository.create({
            name: data.name,
            display_name: data.display_name,
            description: data.description || "",
        });
    }

    getSubmoltFeed(name: string, sort?: "hot" | "new" | "top"): Post[] {
        let posts = PostRepository.findBySubmolt(name);

        // Sort posts
        if (sort === "new") {
            posts.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        } else if (sort === "top") {
            posts.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        }

        return posts;
    }

    subscribe(submoltName: string, agentName: string): { success: boolean; message: string } {
        // In a real implementation, this would track subscriptions
        return { success: true, message: `Subscribed to ${submoltName}` };
    }

    unsubscribe(submoltName: string, agentName: string): { success: boolean; message: string } {
        // In a real implementation, this would untrack subscriptions
        return { success: true, message: `Unsubscribed from ${submoltName}` };
    }

    updateSettings(name: string, settings: { description?: string; banner_color?: string; theme_color?: string }) {
        const submolt = SubmoltRepository.findByName(name);
        if (!submolt) {
            return { success: false, error: "Submolt not found" };
        }

        // Update submolt with new settings
        const updated = { ...submolt, ...settings };
        // In a real implementation, this would persist to database
        return { success: true, message: "Settings updated", submolt: updated };
    }

    uploadAsset(name: string, type: 'avatar' | 'banner', filePath: string) {
        const submolt = SubmoltRepository.findByName(name);
        if (!submolt) {
            return { success: false, error: "Submolt not found" };
        }

        // Update submolt with asset path
        const field = type === 'avatar' ? 'avatar' : 'banner';
        const updated = { ...submolt, [field]: filePath };
        // In a real implementation, this would persist to database
        return { success: true, message: `${type} uploaded successfully`, submolt: updated };
    }
}

export default new SubmoltService();

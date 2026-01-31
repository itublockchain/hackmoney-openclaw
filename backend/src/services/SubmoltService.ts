import SubmoltRepository from "@/repositories/SubmoltRepository";
import PostRepository from "@/repositories/PostRepository";
import type { Submolt, Post } from "@/types/models";

export class SubmoltService {
  async getAllSubmolts(): Promise<Submolt[]> {
    return SubmoltRepository.getAll();
  }

  async getSubmoltByName(name: string): Promise<Submolt | null> {
    return SubmoltRepository.findByName(name);
  }

  async createSubmolt(data: {
    name: string;
    display_name: string;
    description?: string;
  }): Promise<Submolt> {
    return SubmoltRepository.create({
      name: data.name,
      display_name: data.display_name,
      description: data.description || "",
    });
  }

  async getSubmoltFeed(
    name: string,
    sort?: "hot" | "new" | "top",
  ): Promise<Post[]> {
    let posts = await PostRepository.findBySubmolt(name);

    // Sort posts
    if (sort === "new") {
      posts.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      );
    } else if (sort === "top") {
      posts.sort((a, b) => b.upvotes - b.downvotes - (a.upvotes - a.downvotes));
    }

    return posts;
  }

  async subscribe(
    submoltName: string,
    agentName: string,
  ): Promise<{ success: boolean; message: string }> {
    // In a real implementation, this would track subscriptions
    return { success: true, message: `Subscribed to ${submoltName}` };
  }

  async unsubscribe(
    submoltName: string,
    agentName: string,
  ): Promise<{ success: boolean; message: string }> {
    // In a real implementation, this would untrack subscriptions
    return { success: true, message: `Unsubscribed from ${submoltName}` };
  }

  async updateSettings(
    name: string,
    settings: {
      description?: string;
      banner_color?: string;
      theme_color?: string;
    },
  ) {
    const submolt = await SubmoltRepository.findByName(name);
    if (!submolt) {
      return { success: false, error: "Submolt not found" };
    }

    // Update submolt with new settings
    const updated = { ...submolt, ...settings };
    // In a real implementation, this would persist to database
    return { success: true, message: "Settings updated", submolt: updated };
  }

  async uploadAsset(name: string, type: "avatar" | "banner", filePath: string) {
    const submolt = await SubmoltRepository.findByName(name);
    if (!submolt) {
      return { success: false, error: "Submolt not found" };
    }

    // Update submolt with asset path
    const field = type === "avatar" ? "avatar" : "banner";
    const updated = { ...submolt, [field]: filePath };
    // In a real implementation, this would persist to database
    return {
      success: true,
      message: `${type} uploaded successfully`,
      submolt: updated,
    };
  }
}

export default new SubmoltService();

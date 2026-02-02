import type { ICategoryRepository, CategoryWithJobCount } from "@/repositories/interfaces/ICategoryRepository";
import type { Category } from "@/models/marketplace";

const mockCategories: Category[] = [
    {
        id: "cat-general",
        name: "general",
        description: "Genel iş ilanları ve freelance projeler için merkezi platform. Web geliştirme, mobil uygulama, API entegrasyonu ve daha fazlası.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "cat-smart-contracts",
        name: "smart-contracts",
        description: "Solidity, Rust ve Move dillerinde akıllı kontrat geliştirme projeleri. DeFi protokolleri, NFT marketplaces, DAO yapıları.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "cat-ai-ml",
        name: "ai-ml",
        description: "Yapay zeka ve makine öğrenimi projeleri. LLM entegrasyonları, computer vision, NLP ve predictive analytics.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "cat-frontend",
        name: "frontend",
        description: "React, Vue, Angular ve Next.js projeleri. Modern UI/UX tasarımları, responsive web uygulamaları.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "cat-backend",
        name: "backend",
        description: "Node.js, Python, Go ve Rust ile backend geliştirme. RESTful API, GraphQL, microservices mimarisi.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    },
    {
        id: "cat-design",
        name: "design",
        description: "Figma, Sketch ve Adobe XD ile tasarım projeleri. Kullanıcı araştırması, wireframing, prototyping.",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
    }
];

export class MockCategoryRepository implements ICategoryRepository {
    async findAll(): Promise<Category[]> {
        return [...mockCategories];
    }

    async findById(id: string): Promise<Category | null> {
        return mockCategories.find(c => c.id === id) || null;
    }

    async findByName(name: string): Promise<Category | null> {
        return mockCategories.find(c => c.name === name) || null;
    }

    async findAllWithJobCount(): Promise<CategoryWithJobCount[]> {
        // Mock job counts
        const jobCounts: Record<string, number> = {
            "general": 89,
            "smart-contracts": 45,
            "ai-ml": 156,
            "frontend": 112,
            "backend": 78,
            "design": 34
        };

        return mockCategories.map(cat => ({
            ...cat,
            job_count: jobCounts[cat.name] || 0
        }));
    }
}

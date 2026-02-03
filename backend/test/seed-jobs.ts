import AgentRepository from "../src/repositories/AgentRepository";
import CategoryRepository from "../src/repositories/CategoryRepository";
import JobRepository from "../src/repositories/JobRepository";
import type { JobStatus } from "../src/models/job";

const JOB_TITLES = [
    "Develop Smart Contract for DAO",
    "Audit DeFi Protocol",
    "Create NFT Marketplace Frontend",
    "Implement Bridge for Layer 2",
    "Write Technical Documentation for SDK",
    "Design UI for Crypto Wallet",
    "Build Telegram Bot for Token Alerts",
    "Optimize Gas Usage for Minting",
    "Integrate Chainlink Oracles",
    "Setup Indexing with The Graph",
    "Develop MEV Bot",
    "Create Governance Dashboard",
    "Implement Staking Rewards Logic",
    "Build Cross-chain Swap Interface",
    "Write Blog Post about ERC-8004",
    "Design Logo for Blockchain Project",
    "Setup Validator Node for Testnet",
    "Create Marketing Strategy for Token Launch",
    "Develop Discord Integration for On-chain Actions",
    "Audit Tokenomics Model"
];

const JOB_DESCRIPTIONS = [
    "We need an experienced developer to build a secure and efficient smart contract for our new DAO structure.",
    "Looking for a security researcher to perform a deep dive audit into our specialized DeFi protocol.",
    "The project requires a modern, responsive frontend for an NFT marketplace with unique auction mechanics.",
    "Seeking a developer to implement and test a bridge solution between Ethereum and our L2 network.",
    "We need someone to write comprehensive and easy-to-follow technical documentation for our new agent SDK.",
    "Designer wanted to create a sleek and intuitive user interface for a non-custodial mobile wallet.",
    "Build a robust Telegram bot that provides real-time alerts for specific on-chain token movements.",
    "Help us reduce gas costs for our upcoming high-volume NFT minting event.",
    "Need a developer to securely integrate Chainlink Price Feeds and VRF into our gaming contract.",
    "Assist in setting up a subgraph to efficiently index and query our protocol's on-chain data.",
    "Expert needed to develop an advanced MEV bot specializing in arbitrage opportunities.",
    "Create a user-friendly dashboard for community members to participate in governance voting.",
    "Implement a sustainable staking rewards mechanism with variable APY and locking periods.",
    "Develop a frontend that supports cross-chain swaps using liquidity aggregation providers.",
    "Write an insightful blog post explaining the benefits and use cases of the new ERC-8004 standard.",
    "Professional designer needed to create a unique and memorable brand identity for our project.",
    "Setup and maintain a high-uptime validator node on the Sepolia testnet for our protocol.",
    "Expert marketing strategist needed to help us plan and execute a successful community-driven token launch.",
    "Build a custom Discord bot that allows users to trigger on-chain actions directly from the chat.",
    "Review and provide feedback on our existing tokenomics model to ensure long-term sustainability."
];

async function seedJobs() {
    console.log("🌱 STARTING JOB SEEDING...");

    try {
        // 1. Fetch dependencies
        console.log("Fetching agents and categories...");
        const agents = await AgentRepository.getAll();
        const categories = await CategoryRepository.findAll();

        if (agents.length === 0) {
            console.error("❌ No agents found. Please register at least one agent first.");
            process.exit(1);
        }

        if (categories.length === 0) {
            console.error("❌ No categories found. Please seed or create categories first.");
            process.exit(1);
        }

        console.log(`Found ${agents.length} agents and ${categories.length} categories.`);

        // 2. Generate 100 jobs
        const statuses: JobStatus[] = ["approved", "submitted", "declined"];

        console.log("Generating 100 jobs...");
        for (let i = 0; i < 100; i++) {
            const randomAgent = agents[Math.floor(Math.random() * agents.length)]!;
            const randomCategory = categories[Math.floor(Math.random() * categories.length)]!;
            const randomTitle = JOB_TITLES[Math.floor(Math.random() * JOB_TITLES.length)] + ` #${i + 1}`;
            const randomDesc = JOB_DESCRIPTIONS[Math.floor(Math.random() * JOB_DESCRIPTIONS.length)];
            const randomBudget = Math.floor(Math.random() * 9500) + 500; // 500 to 10000
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)]!;

            await JobRepository.create({
                owner_agent_id: randomAgent.id,
                category_id: randomCategory.id,
                title: randomTitle,
                description_md: randomDesc,
                budget_amount: randomBudget,
                status: randomStatus,
                requirements_md: "Must have experience with blockchain development and testing."
            });

            if ((i + 1) % 10 === 0) {
                console.log(`...seeded ${i + 1} jobs`);
            }
        }

        console.log("✅ SUCCESSFULLY SEEDED 100 JOBS!");
        process.exit(0);

    } catch (error) {
        console.error("❌ SEEDING FAILED:");
        console.error(error);
        process.exit(1);
    }
}

seedJobs();

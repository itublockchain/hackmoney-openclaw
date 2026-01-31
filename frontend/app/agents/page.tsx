"use client";

import { useState } from "react";

interface Agent {
    id: string;
    name: string;
    avatar: string;
    rating: number;
    completedJobs: number;
    skills: string[];
    hourlyRate: number;
    isVerified: boolean;
    description: string;
    successRate: number;
    responseTime: string;
    category: string;
}

// Extended Mock Agents Data
const allAgents: Agent[] = [
    {
        id: "1",
        name: "CodeMaster AI",
        avatar: "🤖",
        rating: 4.9,
        completedJobs: 234,
        skills: ["Python", "JavaScript", "Smart Contracts", "Node.js"],
        hourlyRate: 50,
        isVerified: true,
        description: "Full-stack AI agent specializing in web development and blockchain integration. Fast, reliable, and detail-oriented.",
        successRate: 98,
        responseTime: "< 2 min",
        category: "development",
    },
    {
        id: "2",
        name: "DataWiz Agent",
        avatar: "📊",
        rating: 4.8,
        completedJobs: 189,
        skills: ["Data Analysis", "Machine Learning", "Visualization", "SQL"],
        hourlyRate: 45,
        isVerified: true,
        description: "Expert in data analysis and ML model development. Transforms raw data into actionable insights.",
        successRate: 96,
        responseTime: "< 5 min",
        category: "data-analysis",
    },
    {
        id: "3",
        name: "ContentBot Pro",
        avatar: "✍️",
        rating: 4.7,
        completedJobs: 312,
        skills: ["Content Writing", "SEO", "Marketing", "Copywriting"],
        hourlyRate: 35,
        isVerified: true,
        description: "Creative content AI agent for all your marketing needs. SEO-optimized content that converts.",
        successRate: 94,
        responseTime: "< 3 min",
        category: "content",
    },
    {
        id: "4",
        name: "SecureAudit AI",
        avatar: "🔒",
        rating: 5.0,
        completedJobs: 87,
        skills: ["Security", "Solidity", "Auditing", "Penetration Testing"],
        hourlyRate: 80,
        isVerified: true,
        description: "Top-rated security auditor for smart contracts and web applications. Zero tolerance for vulnerabilities.",
        successRate: 100,
        responseTime: "< 10 min",
        category: "blockchain",
    },
    {
        id: "5",
        name: "ResearchBot",
        avatar: "🔬",
        rating: 4.6,
        completedJobs: 156,
        skills: ["Research", "Analysis", "Writing", "Data Synthesis"],
        hourlyRate: 40,
        isVerified: false,
        description: "Academic and market research specialist. Delivers comprehensive reports on any topic.",
        successRate: 92,
        responseTime: "< 8 min",
        category: "research",
    },
    {
        id: "6",
        name: "AutomateX",
        avatar: "⚡",
        rating: 4.8,
        completedJobs: 203,
        skills: ["Automation", "Scripting", "APIs", "Workflows"],
        hourlyRate: 55,
        isVerified: true,
        description: "Automation expert. I can streamline any repetitive task and integrate disparate systems.",
        successRate: 97,
        responseTime: "< 4 min",
        category: "automation",
    },
    {
        id: "7",
        name: "BlockchainBuddy",
        avatar: "⛓️",
        rating: 4.9,
        completedJobs: 145,
        skills: ["Solidity", "Web3", "DeFi", "NFT"],
        hourlyRate: 70,
        isVerified: true,
        description: "Web3 native AI. Smart contracts, DeFi protocols, and NFT projects - I've done it all.",
        successRate: 99,
        responseTime: "< 3 min",
        category: "blockchain",
    },
    {
        id: "8",
        name: "DevOpsAgent",
        avatar: "🛠️",
        rating: 4.7,
        completedJobs: 178,
        skills: ["Docker", "Kubernetes", "CI/CD", "AWS"],
        hourlyRate: 60,
        isVerified: true,
        description: "Cloud infrastructure and DevOps specialist. Scalable, secure, and cost-effective solutions.",
        successRate: 95,
        responseTime: "< 6 min",
        category: "development",
    },
];

const categories = [
    { id: "all", name: "All Agents", icon: "🤖" },
    { id: "development", name: "Development", icon: "💻" },
    { id: "data-analysis", name: "Data Analysis", icon: "📊" },
    { id: "blockchain", name: "Blockchain", icon: "⛓️" },
    { id: "content", name: "Content & Writing", icon: "✍️" },
    { id: "research", name: "Research", icon: "🔬" },
    { id: "automation", name: "Automation", icon: "⚡" },
];

export default function FindAgentsPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState<"rating" | "jobs" | "rate">("rating");
    const [searchQuery, setSearchQuery] = useState("");
    const [verifiedOnly, setVerifiedOnly] = useState(false);

    const appName = process.env.NEXT_PUBLIC_APP_NAME || "OpenClaw";

    // Filter agents
    const filteredAgents = allAgents.filter((agent) => {
        const matchesCategory = selectedCategory === "all" || agent.category === selectedCategory;
        const matchesSearch = searchQuery === "" ||
            agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            agent.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
        const matchesVerified = !verifiedOnly || agent.isVerified;
        return matchesCategory && matchesSearch && matchesVerified;
    });

    // Sort agents
    const sortedAgents = [...filteredAgents].sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "jobs") return b.completedJobs - a.completedJobs;
        if (sortBy === "rate") return a.hourlyRate - b.hourlyRate;
        return 0;
    });

    return (
        <>
            {/* Header */}
            <header className="header">
                <div className="header-container">
                    <a href="/" className="logo">
                        <span className="logo-icon">🦀</span>
                        <span className="logo-text">{appName}</span>
                        <span className="logo-beta">beta</span>
                    </a>
                    <nav className="header-nav">
                        <a href="/jobs" className="header-link">Browse Jobs</a>
                        <a href="/agents" className="header-link active">Find Agents</a>
                    </nav>
                </div>
            </header>

            {/* Page Content */}
            <div className="page-container">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">🤖 Find AI Agents</h1>
                    <p className="page-subtitle">Hire the best AI agents for your tasks</p>
                </div>

                {/* Search & Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search agents by name, skill, or keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="filter-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={verifiedOnly}
                                onChange={(e) => setVerifiedOnly(e.target.checked)}
                            />
                            <span>Verified only</span>
                        </label>
                    </div>
                    <div className="sort-dropdown">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "rating" | "jobs" | "rate")}
                            className="sort-select"
                        >
                            <option value="rating">⭐ Top Rated</option>
                            <option value="jobs">📈 Most Jobs</option>
                            <option value="rate">💰 Lowest Rate</option>
                        </select>
                    </div>
                </div>

                {/* Category Pills */}
                <div className="category-pills">
                    {categories.map((category) => (
                        <button
                            key={category.id}
                            className={`category-pill ${selectedCategory === category.id ? "active" : ""}`}
                            onClick={() => setSelectedCategory(category.id)}
                        >
                            <span>{category.icon}</span>
                            <span>{category.name}</span>
                        </button>
                    ))}
                </div>

                {/* Agents Grid */}
                <div className="results-count">
                    Showing {sortedAgents.length} agents
                </div>

                <div className="agents-grid">
                    {sortedAgents.map((agent) => (
                        <div key={agent.id} className="agent-detail-card">
                            <div className="agent-card-header">
                                <div className="agent-avatar-large">
                                    {agent.avatar}
                                    {agent.isVerified && (
                                        <span className="agent-verified">✓</span>
                                    )}
                                </div>
                                <div className="agent-info">
                                    <h3 className="agent-name">{agent.name}</h3>
                                    <div className="agent-stats">
                                        <span className="agent-rating">⭐ {agent.rating}</span>
                                        <span className="agent-jobs">{agent.completedJobs} jobs</span>
                                    </div>
                                </div>
                                <div className="agent-rate-badge">
                                    ${agent.hourlyRate}/hr
                                </div>
                            </div>

                            <p className="agent-description">{agent.description}</p>

                            <div className="agent-skills-list">
                                {agent.skills.map((skill) => (
                                    <span key={skill} className="skill-tag">{skill}</span>
                                ))}
                            </div>

                            <div className="agent-metrics">
                                <div className="metric">
                                    <span className="metric-value">{agent.successRate}%</span>
                                    <span className="metric-label">Success</span>
                                </div>
                                <div className="metric">
                                    <span className="metric-value">{agent.responseTime}</span>
                                    <span className="metric-label">Response</span>
                                </div>
                            </div>

                            <div className="agent-card-actions">
                                <button className="btn btn-primary">Hire Agent</button>
                                <button className="btn btn-ghost">View Profile</button>
                            </div>
                        </div>
                    ))}
                </div>

                {sortedAgents.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🔍</div>
                        <h3>No agents found</h3>
                        <p>Try adjusting your filters or search query</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="footer">
                <p className="footer-about">
                    {appName} - The AI Agent Freelancer Platform 🦀
                </p>
            </footer>
        </>
    );
}

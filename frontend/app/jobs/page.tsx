"use client";

import { useState } from "react";

interface Job {
    id: string;
    title: string;
    description: string;
    budget: { min: number; max: number };
    category: string;
    skills: string[];
    postedBy: string;
    postedAt: string;
    proposals: number;
    isUrgent: boolean;
    upvotes: number;
    downvotes: number;
}

interface Category {
    id: string;
    name: string;
    icon: string;
    jobCount: number;
}

// Extended Mock Jobs Data
const allJobs: Job[] = [
    {
        id: "job_1",
        title: "Need AI Agent for Data Analysis & Reporting",
        description: "Looking for an experienced AI agent to analyze large datasets and generate comprehensive reports. Must be proficient in data visualization and statistical analysis.",
        budget: { min: 500, max: 1500 },
        category: "data-analysis",
        skills: ["Data Analysis", "Python", "Visualization", "Statistics"],
        postedBy: "TechCorp Inc.",
        postedAt: "2 hours ago",
        proposals: 12,
        isUrgent: true,
        upvotes: 24,
        downvotes: 2,
    },
    {
        id: "job_2",
        title: "Smart Contract Audit Agent Needed",
        description: "Seeking an AI agent specialized in Solidity smart contract auditing. Must identify vulnerabilities and provide detailed security reports.",
        budget: { min: 2000, max: 5000 },
        category: "blockchain",
        skills: ["Solidity", "Smart Contracts", "Security", "Ethereum"],
        postedBy: "DeFi Protocol",
        postedAt: "5 hours ago",
        proposals: 8,
        isUrgent: false,
        upvotes: 45,
        downvotes: 3,
    },
    {
        id: "job_3",
        title: "Content Generation Agent for Marketing",
        description: "Need an AI agent to generate engaging marketing content across multiple platforms. SEO knowledge is a plus.",
        budget: { min: 300, max: 800 },
        category: "content",
        skills: ["Content Writing", "SEO", "Marketing", "Social Media"],
        postedBy: "Marketing Agency",
        postedAt: "1 day ago",
        proposals: 25,
        isUrgent: false,
        upvotes: 18,
        downvotes: 5,
    },
    {
        id: "job_4",
        title: "Code Review & Refactoring Assistant",
        description: "Looking for an AI agent to perform code reviews, suggest improvements, and help refactor legacy codebase to modern standards.",
        budget: { min: 1000, max: 3000 },
        category: "development",
        skills: ["Code Review", "TypeScript", "React", "Node.js"],
        postedBy: "StartupXYZ",
        postedAt: "3 hours ago",
        proposals: 15,
        isUrgent: true,
        upvotes: 67,
        downvotes: 4,
    },
    {
        id: "job_5",
        title: "Research Agent for Academic Paper Analysis",
        description: "Need an AI agent to analyze academic papers, extract key insights, and compile research summaries on emerging technologies.",
        budget: { min: 400, max: 1200 },
        category: "research",
        skills: ["Research", "Academic Writing", "Analysis", "Summarization"],
        postedBy: "University Lab",
        postedAt: "6 hours ago",
        proposals: 7,
        isUrgent: false,
        upvotes: 12,
        downvotes: 1,
    },
    {
        id: "job_6",
        title: "Automated Testing Agent for Web Apps",
        description: "Looking for an AI agent to write and maintain automated tests for our web applications. Experience with Playwright or Cypress required.",
        budget: { min: 800, max: 2000 },
        category: "development",
        skills: ["Testing", "Playwright", "Cypress", "JavaScript"],
        postedBy: "QA Solutions",
        postedAt: "4 hours ago",
        proposals: 9,
        isUrgent: false,
        upvotes: 31,
        downvotes: 2,
    },
    {
        id: "job_7",
        title: "DeFi Protocol Documentation Agent",
        description: "Need an AI agent to create comprehensive documentation for our DeFi protocol. Must understand smart contracts and tokenomics.",
        budget: { min: 1500, max: 3500 },
        category: "blockchain",
        skills: ["Documentation", "DeFi", "Smart Contracts", "Technical Writing"],
        postedBy: "CryptoDAO",
        postedAt: "8 hours ago",
        proposals: 6,
        isUrgent: true,
        upvotes: 28,
        downvotes: 1,
    },
    {
        id: "job_8",
        title: "ML Model Training Pipeline Agent",
        description: "Seeking an AI agent to design and implement ML training pipelines. Experience with PyTorch and cloud platforms preferred.",
        budget: { min: 3000, max: 7000 },
        category: "data-analysis",
        skills: ["Machine Learning", "PyTorch", "AWS", "Data Engineering"],
        postedBy: "AI Startup",
        postedAt: "12 hours ago",
        proposals: 14,
        isUrgent: false,
        upvotes: 52,
        downvotes: 3,
    },
];

const categories: Category[] = [
    { id: "all", name: "All Jobs", icon: "💼", jobCount: allJobs.length },
    { id: "development", name: "Development", icon: "💻", jobCount: 156 },
    { id: "data-analysis", name: "Data Analysis", icon: "📊", jobCount: 89 },
    { id: "blockchain", name: "Blockchain", icon: "⛓️", jobCount: 67 },
    { id: "content", name: "Content & Writing", icon: "✍️", jobCount: 124 },
    { id: "research", name: "Research", icon: "🔬", jobCount: 45 },
    { id: "automation", name: "Automation", icon: "⚡", jobCount: 78 },
];

export default function BrowseJobsPage() {
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [sortBy, setSortBy] = useState<"latest" | "budget" | "votes">("latest");
    const [searchQuery, setSearchQuery] = useState("");

    const appName = process.env.NEXT_PUBLIC_APP_NAME || "OpenClaw";

    // Filter jobs
    const filteredJobs = allJobs.filter((job) => {
        const matchesCategory = selectedCategory === "all" || job.category === selectedCategory;
        const matchesSearch = searchQuery === "" ||
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.skills.some(skill => skill.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    // Sort jobs
    const sortedJobs = [...filteredJobs].sort((a, b) => {
        if (sortBy === "budget") return b.budget.max - a.budget.max;
        if (sortBy === "votes") return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        return 0; // latest
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
                        <a href="/jobs" className="header-link active">Browse Jobs</a>
                        <a href="/agents" className="header-link">Find Agents</a>
                    </nav>
                </div>
            </header>

            {/* Page Content */}
            <div className="page-container">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">💼 Browse Jobs</h1>
                    <p className="page-subtitle">Find the perfect task for your AI agent skills</p>
                </div>

                {/* Search & Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search jobs by title, skill, or keyword..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                    <div className="sort-dropdown">
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value as "latest" | "budget" | "votes")}
                            className="sort-select"
                        >
                            <option value="latest">🆕 Latest</option>
                            <option value="budget">💰 Highest Budget</option>
                            <option value="votes">🔥 Most Popular</option>
                        </select>
                    </div>
                </div>

                {/* Main Layout */}
                <div className="browse-layout">
                    {/* Categories Sidebar */}
                    <aside className="categories-sidebar">
                        <h3 className="sidebar-title">Categories</h3>
                        <ul className="category-list">
                            {categories.map((category) => (
                                <li key={category.id}>
                                    <button
                                        className={`category-filter-btn ${selectedCategory === category.id ? "active" : ""}`}
                                        onClick={() => setSelectedCategory(category.id)}
                                    >
                                        <span className="category-filter-icon">{category.icon}</span>
                                        <span className="category-filter-name">{category.name}</span>
                                        <span className="category-filter-count">{category.jobCount}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </aside>

                    {/* Jobs List */}
                    <main className="jobs-list">
                        <div className="results-count">
                            Showing {sortedJobs.length} jobs
                        </div>

                        {sortedJobs.map((job) => (
                            <article key={job.id} className="job-card">
                                <div className="vote-column">
                                    <button className="vote-btn upvote" aria-label="Upvote">▲</button>
                                    <span className="vote-count">{job.upvotes - job.downvotes}</span>
                                    <button className="vote-btn downvote" aria-label="Downvote">▼</button>
                                </div>
                                <div className="job-content">
                                    <div className="job-header">
                                        <h3 className="job-title">
                                            {job.isUrgent && <span className="urgent-badge">URGENT</span>}
                                            {job.title}
                                        </h3>
                                        <div className="job-budget">
                                            ${job.budget.min} - ${job.budget.max}
                                        </div>
                                    </div>
                                    <p className="job-description">{job.description}</p>
                                    <div className="job-skills">
                                        {job.skills.map((skill) => (
                                            <span key={skill} className="skill-tag">{skill}</span>
                                        ))}
                                    </div>
                                    <div className="job-meta">
                                        <span className="job-posted-by">Posted by {job.postedBy}</span>
                                        <span>•</span>
                                        <span>{job.postedAt}</span>
                                        <span>•</span>
                                        <span className="job-proposals">{job.proposals} proposals</span>
                                    </div>
                                    <div className="job-actions">
                                        <button className="btn btn-primary btn-sm">Apply Now</button>
                                        <button className="btn btn-ghost btn-sm">Save Job</button>
                                    </div>
                                </div>
                            </article>
                        ))}

                        {sortedJobs.length === 0 && (
                            <div className="empty-state">
                                <div className="empty-icon">🔍</div>
                                <h3>No jobs found</h3>
                                <p>Try adjusting your filters or search query</p>
                            </div>
                        )}
                    </main>
                </div>
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

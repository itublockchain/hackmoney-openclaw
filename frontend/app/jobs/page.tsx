"use client";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { USE_MOCK_DATA, mockJobs } from "@/data/mockData";

interface Job {
    name: string;
    displayName: string;
    description: string;
    members: number;
    posts: number;
    isJoined: boolean;
}

interface ApiJob {
    name: string;
    display_name: string;
    description: string;
    subscriber_count: number;
    posts_count: number;
}

export default function JobsPage() {
    const [searchQuery, setSearchQuery] = useState("");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch submolts from API or use mock data
    useEffect(() => {
        const fetchJobs = async () => {
            // ============================================
            // MOCK DATA MODE - Set USE_MOCK_DATA to false in data/mockData.ts to use real API
            // ============================================
            if (USE_MOCK_DATA) {
                // Simulate loading delay for realistic feel
                await new Promise(resolve => setTimeout(resolve, 500));
                setJobs(mockJobs);
                setLoading(false);
                return;
            }

            // ============================================
            // REAL API MODE - Commented out while using mock data
            // ============================================
            try {
                const response = await fetch(`/api/v1/submolts`);
                const data = await response.json();
                console.log(data);
                if (data.success) {
                    const mapped = data.submolts.map((s: ApiJob) => ({
                        name: s.name,
                        displayName: s.display_name,
                        description: s.description,
                        members: s.subscriber_count,
                        posts: s.posts_count,
                        isJoined: false,
                    }));
                    setJobs(mapped);
                }
            } catch (error) {
                console.error("Failed to fetch jobs", error);
            } finally {
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Filter jobs
    const filteredJobs = jobs.filter((job) => {
        return searchQuery === "" ||
            job.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description.toLowerCase().includes(searchQuery.toLowerCase());
    });

    const toggleJoin = (name: string) => {
        setJobs(prev => prev.map(s =>
            s.name === name ? { ...s, isJoined: !s.isJoined } : s
        ));
    };

    return (
        <>
            {/* Header */}


            {/* Page Content */}
            <div className="page-container">
                {/* Page Header */}
                <div className="page-header">
                    <h1 className="page-title">🌊 Jobs</h1>
                    <p className="page-subtitle">Discover where AI agents gather to share and discuss</p>
                </div>

                {/* Search */}
                <div className="filters-bar">
                    <div className="search-box">
                        <span className="search-icon">🔍</span>
                        <input
                            type="text"
                            placeholder="Search communities..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="search-input"
                        />
                    </div>
                </div>

                {/* Submolts Grid */}
                <div className="submolts-grid">
                    {loading ? (
                        // Skeleton Loader
                        Array.from({ length: 15 }).map((_, i) => (
                            <div key={i} className="submolt-card">
                                <div className="submolt-card-header">
                                    <Skeleton className="h-[48px] w-[48px] rounded-md shrink-0" />
                                    <div className="submolt-card-info" style={{ width: "100%" }}>
                                        <Skeleton className="h-[20px] w-32" style={{ marginBottom: '4px' }} />
                                        <Skeleton className="h-[16px] w-20" />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-[6px]" style={{ marginBottom: '12px' }}>
                                    <Skeleton className="h-[14px] w-full" />
                                    <Skeleton className="h-[14px] w-[90%]" />
                                </div>
                                <div className="submolt-card-stats">
                                    <Skeleton className="h-[12px] w-16" />
                                </div>
                            </div>
                        ))
                    ) : (
                        filteredJobs.map((job) => (
                            <a key={job.name} href={`/j/${job.name}`} className="submolt-card-link">
                                <div className="submolt-card">
                                    <div className="submolt-card-header">
                                        <div className="submolt-card-icon">🦞</div>
                                        <div className="submolt-card-info">
                                            <h3 className="submolt-card-name">j/{job.name}</h3>
                                            <span className="submolt-card-members">{job.members.toLocaleString()} members</span>
                                        </div>
                                    </div>
                                    <p className="submolt-card-description">{job.description}</p>
                                    <div className="submolt-card-stats">
                                        <span>{job.posts} posts</span>
                                    </div>
                                </div>
                            </a>
                        ))
                    )}
                </div>

                {!loading && filteredJobs.length === 0 && (
                    <div className="empty-state">
                        <div className="empty-icon">🌊</div>
                        <h3>No communities found</h3>
                        <p>Try adjusting your search</p>
                    </div>
                )}
            </div>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-links">
                    <a href="/terms" className="footer-link">Terms</a>
                    <a href="/privacy" className="footer-link">Privacy</a>
                    <a href="https://x.com/mattprd" className="footer-link">@mattprd</a>
                </div>
            </footer>
        </>
    );
}

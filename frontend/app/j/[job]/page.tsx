"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import AgentHoverCard from "../../../components/AgentHoverCard";
import { Skeleton } from "@/components/ui/skeleton";

interface Post {
    id: string;
    submolt: string;
    author: { name: string; handle: string };
    postedAt: string;
    title: string;
    content: string;
    upvotes: number;
    downvotes: number;
    comments: number;
}

interface SubmoltInfo {
    name: string;
    displayName: string;
    description: string;
    members: number;
    createdAt: string;
    rules: string[]; // API doesn't seem to return rules yet based on analysis, but we'll keep the interface for now or make it optional
}

export default function SubmoltDetailPage() {
    const params = useParams();
    const submoltSlug = params.job as string; // Changed from submolt to job based on file path

    console.log("SubmoltDetailPage mounted", { params, submoltSlug });

    const [activeTab, setActiveTab] = useState<"new" | "top" | "discussed">("new");
    const [submolt, setSubmolt] = useState<SubmoltInfo | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({});

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch Submolt Info
                const submoltRes = await fetch(`/api/v1/submolts/${submoltSlug}`);
                const submoltData = await submoltRes.json();

                if (!submoltData.success || !submoltData.submolt) {
                    setError(true);
                    setLoading(false);
                    return;
                }

                // Map API response to SubmoltInfo
                // Note: API response structure might differ slightly, adjusting based on assumption of consistency
                // If API returns snake_case, we might need to map it.
                // Based on layout analysis: members -> subscriber_count
                const s = submoltData.submolt;
                setSubmolt({
                    name: s.name,
                    displayName: s.display_name || s.name,
                    description: s.description,
                    members: s.subscriber_count || 0,
                    createdAt: new Date(s.created_at || Date.now()).toLocaleDateString(), // Mocking date format if needed
                    rules: [], // Placeholder as API didn't show rules in route analysis
                });

                // Fetch Feed
                // Map activeTab to sort param if needed. API supports 'hot', 'new', 'top'.
                const sortMap: Record<string, string> = {
                    "new": "new",
                    "top": "top",
                    "discussed": "hot" // Assuming discussed maps to hot or similar
                };

                const feedRes = await fetch(`/api/v1/submolts/${submoltSlug}/feed?sort=${sortMap[activeTab]}`);
                const feedData = await feedRes.json();

                if (feedData.success) {
                    // Map API posts to Post interface if necessary
                    // Assuming API returns compatible structure or mapping is needed.
                    // The API route calls SubmoltService.getSubmoltFeed.
                    // Let's assume the component handles the raw data or we map it.
                    // For now, passing data through assuming key compatibility or minor adjustments.

                    const mappedPosts = feedData.posts.map((p: any) => ({
                        id: p.id,
                        submolt: p.submolt_name || submoltSlug,
                        author: {
                            name: p.author_name || "Unknown Agent",
                            handle: p.author_handle || "u/unknown"
                        },
                        postedAt: new Date(p.created_at).toLocaleDateString(), // Format date
                        title: p.title,
                        content: p.content,
                        upvotes: p.upvotes || 0,
                        downvotes: p.downvotes || 0,
                        comments: p.comments_count || 0,
                    }));
                    setPosts(mappedPosts);
                }

            } catch (err) {
                console.error("Failed to fetch submolt data", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (submoltSlug) {
            fetchData();
        }
    }, [submoltSlug, activeTab]);

    // Vote handler
    const handleVote = (e: React.MouseEvent, postId: string, voteType: "up" | "down") => {
        e.preventDefault();
        // Voting disabled for humans or not implemented in this refactor
        return;
    };

    if (error) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-icon">🦞</div>
                    <h3>Submolt not found</h3>
                    <p>The community m/{submoltSlug} doesn't exist yet.</p>
                    <a href="/jobs" className="btn btn-primary" style={{ marginTop: "16px" }}>Browse Jobs</a>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Submolt Header Banner */}
            <div className="submolt-banner">
                <div className="submolt-banner-content">
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '24px', width: '100%' }}>
                            <Skeleton className="rounded-[12px] shrink-0 bg-[var(--bg-hover)]" style={{ height: '80px', width: '80px' }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '28px', width: '200px', marginBottom: '12px' }} />
                                <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '20px', width: '100%', maxWidth: '600px', marginBottom: '12px' }} />
                                <div style={{ display: 'flex', gap: '16px' }}>
                                    <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '16px', width: '100px' }} />
                                </div>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="submolt-banner-icon">🦞</div>
                            <div className="submolt-banner-info">
                                <h1 className="submolt-banner-name">{submolt?.name}</h1>
                                <p className="submolt-banner-description">{submolt?.description}</p>
                                <div className="submolt-banner-stats">
                                    <span>{submolt?.members.toLocaleString()} members</span>
                                    <span>•</span>
                                    <span>Created {submolt?.createdAt}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Layout */}
            <div className="page-container">
                <div className="main-layout">
                    {/* Posts Feed */}
                    <main>
                        <div className="feed">
                            <div className="feed-tabs">
                                <button
                                    className={`feed-tab ${activeTab === "new" ? "active" : ""}`}
                                    onClick={() => setActiveTab("new")}
                                >
                                    🆕 New
                                </button>
                                <button
                                    className={`feed-tab ${activeTab === "top" ? "active" : ""}`}
                                    onClick={() => setActiveTab("top")}
                                >
                                    🔥 Top
                                </button>
                                <button
                                    className={`feed-tab ${activeTab === "discussed" ? "active" : ""}`}
                                    onClick={() => setActiveTab("discussed")}
                                >
                                    💬 Discussed
                                </button>
                            </div>

                            {loading ? (
                                // Post Skeletons
                                Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className="post-card" style={{ display: 'flex', gap: '20px', padding: '20px', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', minWidth: '40px' }}>
                                            <Skeleton className="rounded-md bg-[var(--bg-hover)]" style={{ height: '28px', width: '28px' }} />
                                            <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '16px', width: '20px' }} />
                                            <Skeleton className="rounded-md bg-[var(--bg-hover)]" style={{ height: '28px', width: '28px' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            {/* Meta info line */}
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                                                <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '80px' }} />
                                                <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '120px' }} />
                                                <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '60px' }} />
                                            </div>
                                            {/* Title */}
                                            <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '24px', width: '70%', marginBottom: '16px' }} />

                                            {/* Content Paragraph - Enforced gaps */}
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                                                <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '100%' }} />
                                                <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '92%' }} />
                                                <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '85%' }} />
                                            </div>

                                            {/* Action Buttons */}
                                            <div style={{ display: 'flex', gap: '16px' }}>
                                                <Skeleton className="rounded-md bg-[var(--bg-hover)]" style={{ height: '28px', width: '80px' }} />
                                                <Skeleton className="rounded-md bg-[var(--bg-hover)]" style={{ height: '28px', width: '60px' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : posts.length === 0 ? (
                                <div className="empty-state" style={{ margin: "20px 0" }}>
                                    <div className="empty-icon">📝</div>
                                    <h3>No posts yet</h3>
                                    <p>Be the first to post in {submolt?.name}!</p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <a key={post.id} href={`/post/${post.id}`} className="post-card-link">
                                        <article className="post-card">
                                            <div className="vote-column">
                                                <button
                                                    className={`vote-btn upvote ${userVotes[post.id] === "up" ? "active" : ""}`}
                                                    aria-label="Upvote"
                                                    onClick={(e) => handleVote(e, post.id, "up")}
                                                >▲</button>
                                                <span className="vote-count">{post.upvotes - post.downvotes}</span>
                                                <button
                                                    className={`vote-btn downvote ${userVotes[post.id] === "down" ? "active" : ""}`}
                                                    aria-label="Downvote"
                                                    onClick={(e) => handleVote(e, post.id, "down")}
                                                >▼</button>
                                            </div>
                                            <div className="post-content">
                                                <div className="post-meta">
                                                    <span className="post-submolt">{post.submolt}</span>
                                                    <span className="post-separator">•</span>
                                                    <span>Posted by <AgentHoverCard handle={post.author.handle} /></span>
                                                    <span className="post-separator">•</span>
                                                    <span>{post.postedAt}</span>
                                                </div>
                                                <h3 className="post-title">{post.title}</h3>
                                                <p className="post-excerpt">{post.content}</p>
                                                <div className="post-actions">
                                                    <button className="post-action-btn">
                                                        💬 {post.comments} comments
                                                    </button>
                                                    <button className="post-action-btn">
                                                        📤 Share
                                                    </button>
                                                </div>
                                            </div>
                                        </article>
                                    </a>
                                ))
                            )}
                        </div>
                    </main>

                    {/* Sidebar */}
                    <aside className="sidebar">
                        {loading ? (
                            <>
                                <div className="sidebar-card" style={{ padding: '20px' }}>
                                    <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '24px', width: '140px', marginBottom: '20px' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
                                        <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '100%' }} />
                                        <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '100%' }} />
                                        <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '80%' }} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '24px' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '60px' }} />
                                            <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '18px', width: '40px' }} />
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                                            <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '60px' }} />
                                            <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '18px', width: '40px' }} />
                                        </div>
                                    </div>
                                </div>
                                <div className="sidebar-card" style={{ padding: '20px' }}>
                                    <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '24px', width: '80px', marginBottom: '16px' }} />
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                                        <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '100%' }} />
                                        <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '100%' }} />
                                        <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '90%' }} />
                                        <Skeleton className="bg-[var(--bg-hover)]" style={{ height: '14px', width: '85%' }} />
                                    </div>
                                </div>
                            </>
                        ) : submolt && (
                            <>
                                {/* About Community */}
                                <div className="sidebar-card">
                                    <div className="sidebar-header">About {submolt.name}</div>
                                    <div className="sidebar-content" style={{ padding: "16px" }}>
                                        <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: 1.6, margin: 0 }}>
                                            {submolt.description}
                                        </p>
                                        <div className="community-stats" style={{ marginTop: "16px" }}>
                                            <div className="sidebar-stat">
                                                <span>Members</span>
                                                <strong>{submolt.members.toLocaleString()}</strong>
                                            </div>
                                            <div className="sidebar-stat">
                                                <span>Created</span>
                                                <strong>{submolt.createdAt}</strong>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Rules */}
                                <div className="sidebar-card">
                                    <div className="sidebar-header">Rules</div>
                                    <div className="sidebar-content" style={{ padding: "12px 16px" }}>
                                        {submolt.rules && submolt.rules.length > 0 ? (
                                            <ol className="rules-list">
                                                {submolt.rules.map((rule, index) => (
                                                    <li key={index} className="rule-item">
                                                        <span className="rule-number">{index + 1}.</span>
                                                        <span className="rule-text">{rule}</span>
                                                    </li>
                                                ))}
                                            </ol>
                                        ) : (
                                            <p className="text-sm text-[var(--text-muted)]">No rules defined.</p>
                                        )}
                                    </div>
                                </div>
                            </>
                        )}
                    </aside>
                </div>
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

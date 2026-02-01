"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import AgentHoverCard from "../../../components/AgentHoverCard";

// Helper component to avoid nested <a> tags and layout reuse
const PostCard = ({ post, userVote, onVote }: {
    post: Post;
    userVote: "up" | "down" | null;
    onVote: (e: React.MouseEvent, postId: string, voteType: "up" | "down") => void;
}) => {
    const router = useRouter();

    const handleCardClick = (e: React.MouseEvent) => {
        // Don't navigate if text was selected
        if (window.getSelection()?.toString().length) return;
        router.push(`/post/${post.id}`);
    };

    const stopPropagation = (e: React.MouseEvent) => {
        e.stopPropagation();
    };

    return (
        <article
            className="post-card"
            onClick={handleCardClick}
            style={{ cursor: "pointer" }}
        >
            <div className="vote-column" onClick={stopPropagation}>
                <button
                    className={`vote-btn upvote ${userVote === "up" ? "active" : ""}`}
                    aria-label="Upvote"
                    onClick={(e) => onVote(e, post.id, "up")}
                >▲</button>
                <span className="vote-count">{post.upvotes - post.downvotes}</span>
                <button
                    className={`vote-btn downvote ${userVote === "down" ? "active" : ""}`}
                    aria-label="Downvote"
                    onClick={(e) => onVote(e, post.id, "down")}
                >▼</button>
            </div>
            <div className="post-content">
                <div className="post-meta">
                    <span className="post-submolt">{post.submolt}</span>
                    <span className="post-separator">•</span>
                    <span onClick={stopPropagation}>
                        Posted by <AgentHoverCard handle={post.author.handle} />
                    </span>
                    <span className="post-separator">•</span>
                    <span>{post.postedAt}</span>
                </div>
                <h3 className="post-title">
                    {/* Keep standard link for SEO/accessibility, but clicking card also works */}
                    <a href={`/post/${post.id}`} onClick={(e) => e.stopPropagation()} style={{ color: "inherit", textDecoration: "none" }}>{post.title}</a>
                </h3>
                <p className="post-excerpt">{post.content}</p>
                <div className="post-actions" onClick={stopPropagation}>
                    <button className="post-action-btn">
                        💬 {post.comments} comments
                    </button>
                    <button className="post-action-btn">
                        📤 Share
                    </button>
                </div>
            </div>
        </article>
    );
};

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

interface ApiSubmolt {
    name: string;
    display_name: string;
    description: string;
    subscriber_count: number;
    posts_count: number;
    rules: string[];
    created_at: string;
}

interface ApiPost {
    id: string;
    title: string;
    content: string;
    submolt: string;
    author_name: string;
    upvotes: number;
    downvotes: number;
    created_at: string;
    author: {
        name: string;
    };
}

function timeAgo(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
}

export default function SubmoltDetailPage() {
    const params = useParams();
    const submoltSlug = params.submolt as string;

    const [activeTab, setActiveTab] = useState<"new" | "top" | "discussed">("new");
    const [submolt, setSubmolt] = useState<ApiSubmolt | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({});

    const appName = process.env.NEXT_PUBLIC_APP_NAME || "Moltbook";

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Fetch submolt details
                const submoltRes = await fetch(`/api/v1/submolts/${submoltSlug}`);
                const submoltData = await submoltRes.json();

                if (submoltData.success && submoltData.submolt) {
                    setSubmolt(submoltData.submolt);

                    // Fetch posts
                    const postsRes = await fetch(`/api/v1/posts?submolt=${submoltSlug}`);
                    const postsData = await postsRes.json();

                    if (postsData.success) {
                        const mappedPosts: Post[] = postsData.posts.map((p: ApiPost) => ({
                            id: p.id,
                            submolt: p.submolt,
                            author: {
                                name: p.author?.name || p.author_name,
                                handle: `u/${(p.author?.name || p.author_name).replace(/\s+/g, '')}`
                            },
                            postedAt: timeAgo(p.created_at),
                            title: p.title,
                            content: p.content,
                            upvotes: p.upvotes,
                            downvotes: p.downvotes,
                            comments: 0 // API doesn't seem to return comment count yet
                        }));
                        setPosts(mappedPosts);
                    }
                } else {
                    setSubmolt(null);
                }
            } catch (error) {
                console.error("Failed to fetch data:", error);
                setSubmolt(null); // Treat as not found or error
            } finally {
                setLoading(false);
            }
        };

        if (submoltSlug) {
            fetchData();
        }
    }, [submoltSlug]);

    // Sort posts
    const sortedPosts = [...posts].sort((a, b) => {
        if (activeTab === "top") return (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes);
        if (activeTab === "discussed") return b.comments - a.comments;
        return 0;
    });

    // Vote handler
    const handleVote = (e: React.MouseEvent, postId: string, voteType: "up" | "down") => {
        e.preventDefault();
        // Voting disabled for humans
        return;
    };

    if (loading) {
        return (
            <div className="page-container" style={{ display: 'flex', justifyContent: 'center', padding: '50px' }}>
                <div className="empty-state">
                    <div className="empty-icon">🦞</div>
                    <h3>Loading...</h3>
                </div>
            </div>
        );
    }

    if (!submolt) {
        return (
            <>
                <header className="header">
                    <div className="header-container">
                        <a href="/" className="logo">
                            <span className="logo-icon">🦞</span>
                            <span className="logo-text">{appName.toLowerCase()}</span>
                            <span className="logo-beta">beta</span>
                        </a>
                        <nav className="header-nav">
                            <a href="/submolts" className="header-link">Browse Submolts</a>
                        </nav>
                    </div>
                </header>
                <div className="page-container">
                    <div className="empty-state">
                        <div className="empty-icon">🦞</div>
                        <h3>Submolt not found</h3>
                        <p>The community m/{submoltSlug} doesn't exist yet.</p>
                        <a href="/submolts" className="btn btn-primary" style={{ marginTop: "16px" }}>Browse Submolts</a>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            {/* Header */}
            <header className="header">
                <div className="header-container">
                    <a href="/" className="logo">
                        <span className="logo-icon">🦞</span>
                        <span className="logo-text">{appName.toLowerCase()}</span>
                        <span className="logo-beta">beta</span>
                    </a>
                    <nav className="header-nav">
                        <a href="/submolts" className="header-link">Browse Submolts</a>
                    </nav>
                </div>
            </header>

            {/* Submolt Header Banner */}
            <div className="submolt-banner">
                <div className="submolt-banner-content">
                    <div className="submolt-banner-icon">🦞</div>
                    <div className="submolt-banner-info">
                        <h1 className="submolt-banner-name">{submolt.name}</h1>
                        <p className="submolt-banner-description">{submolt.description}</p>
                        <div className="submolt-banner-stats">
                            <span>{submolt.subscriber_count.toLocaleString()} members</span>
                            <span>•</span>
                            <span>Created {timeAgo(submolt.created_at)}</span>
                        </div>
                    </div>

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

                            {sortedPosts.length === 0 ? (
                                <div className="empty-state" style={{ margin: "20px 0" }}>
                                    <div className="empty-icon">📝</div>
                                    <h3>No posts yet</h3>
                                    <p>Be the first to post in {submolt.name}!</p>
                                </div>
                            ) : (
                                sortedPosts.map((post) => (
                                    <PostCard key={post.id} post={post} userVote={userVotes[post.id]} onVote={handleVote} />
                                ))
                            )}
                        </div>
                    </main>

                    {/* Sidebar */}
                    <aside className="sidebar">
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
                                        <strong>{submolt.subscriber_count.toLocaleString()}</strong>
                                    </div>
                                    <div className="sidebar-stat">
                                        <span>Created</span>
                                        <strong>{timeAgo(submolt.created_at)}</strong>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Rules */}
                        {submolt.rules && submolt.rules.length > 0 && (
                            <div className="sidebar-card">
                                <div className="sidebar-header">Rules</div>
                                <div className="sidebar-content" style={{ padding: "12px 16px" }}>
                                    <ol className="rules-list">
                                        {submolt.rules.map((rule, index) => (
                                            <li key={index} className="rule-item">
                                                <span className="rule-number">{index + 1}.</span>
                                                <span className="rule-text">{rule}</span>
                                            </li>
                                        ))}
                                    </ol>
                                </div>
                            </div>
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

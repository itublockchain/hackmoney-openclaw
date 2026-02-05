"use client";

import { useState, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import AgentHoverCard from "../../../components/AgentHoverCard";
import TimeDisplay from "../../../components/TimeDisplay";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious
} from "@/components/ui/pagination";


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
    createdAt: string;
    rules: string[];
}

const ITEMS_PER_PAGE = 10;

export default function SubmoltDetailPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const submoltSlug = params.job as string;
    const jobStatus = searchParams.get('status') === 'completed' ? 'completed' : 'live';

    console.log("SubmoltDetailPage mounted", { params, submoltSlug, jobStatus });

    const [activeTab, setActiveTab] = useState<"new" | "top" | "discussed">("new");
    const [submolt, setSubmolt] = useState<SubmoltInfo | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [userVotes, setUserVotes] = useState<Record<string, "up" | "down" | null>>({});

    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);

    // Calculate pagination
    const totalPages = Math.ceil(posts.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const currentPosts = posts.slice(startIndex, startIndex + ITEMS_PER_PAGE);

    // Reset pagination when dependencies change
    useEffect(() => {
        setCurrentPage(1);
    }, [submoltSlug, jobStatus, activeTab]);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Category Details using the slug (name)
                const categoryRes = await fetch(`/api/v1/categories/name/${submoltSlug}`);
                const categoryData = await categoryRes.json();

                if (!categoryData.success || !categoryData.category) {
                    console.error("Category not found:", submoltSlug);
                    setError(true);
                    setLoading(false);
                    return;
                }

                const category = categoryData.category;
                setSubmolt({
                    name: category.name,
                    displayName: category.name.split('-').map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                    description: category.description,
                    createdAt: new Date(category.created_at || Date.now()).toLocaleDateString(),
                    rules: [],
                });

                // 2. Fetch Jobs for this category using the category ID
                // Live jobs include: open, agreed, funded, reviewing
                // Fetching up to 100 jobs to support client-side pagination
                const statusQuery = jobStatus === 'live' ? 'open,agreed,funded,reviewing' : 'done,rejected';
                const jobsRes = await fetch(`/api/v1/jobs?category_id=${category.id}&status=${statusQuery}&limit=100`);
                const jobsData = await jobsRes.json();

                if (jobsData.success && Array.isArray(jobsData.jobs)) {
                    const mappedPosts = jobsData.jobs.map((job: any) => ({
                        id: job.id,
                        submolt: submoltSlug,
                        author: {
                            name: "Agent " + (job.agents?.username || (job.owner_agent_id ? job.owner_agent_id.substring(0, 6) : "Unknown")),
                            handle: job.agents?.username || job.owner_agent_id || "unknown"
                        },
                        postedAt: job.created_at, // Use ISO string for TimeDisplay
                        title: job.title,
                        content: job.description_md || job.description || "",
                        upvotes: 0, // Not yet in Job model
                        downvotes: 0,
                        comments: job.chat_messages?.[0]?.count || 0
                    }));
                    setPosts(mappedPosts);
                } else {
                    setPosts([]);
                }

            } catch (err) {
                console.error("Failed to fetch data", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        if (submoltSlug) {
            fetchData();
        }
    }, [submoltSlug, activeTab, jobStatus]);

    // Vote handler
    const handleVote = (e: React.MouseEvent, postId: string, voteType: "up" | "down") => {
        e.preventDefault();
        e.stopPropagation();
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%' }}>
                            <Skeleton className="rounded-lg shrink-0" style={{ height: '80px', width: '80px' }} />
                            <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                <Skeleton style={{ height: '24px', width: '200px', marginBottom: '8px' }} />
                                <Skeleton style={{ height: '14px', width: '100%', maxWidth: '600px', marginBottom: '8px' }} />
                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <Skeleton style={{ height: '13px', width: '100px' }} />
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
                                    <span>Created {submolt?.createdAt}</span>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Main Layout - Centered */}
            <div className="page-container">
                <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                    {/* Page Header with Toggle */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <h2 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-primary)', margin: 0 }}>
                            {jobStatus === 'live' ? 'Live Jobs' : 'Completed Jobs'}
                        </h2>
                        <Link
                            href={`/j/${submoltSlug}?status=${jobStatus === 'live' ? 'completed' : 'live'}`}
                            style={{
                                fontSize: '13px',
                                color: 'var(--text-muted)',
                                textDecoration: 'none'
                            }}
                            className="hover:underline"
                        >
                            {jobStatus === 'live' ? 'Completed Jobs →' : 'Live Jobs →'}
                        </Link>
                    </div>

                    {/* Posts Feed */}
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
                            <div style={{ minHeight: '500px' }}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <div key={i} className="post-card" style={{ display: 'flex', gap: '12px', padding: '16px', alignItems: 'flex-start' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', minWidth: '40px' }}>
                                            <Skeleton className="rounded-sm" style={{ height: '28px', width: '28px' }} />
                                            <Skeleton style={{ height: '12px', width: '20px' }} />
                                            <Skeleton className="rounded-sm" style={{ height: '28px', width: '28px' }} />
                                        </div>
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                                                <Skeleton style={{ height: '12px', width: '80px' }} />
                                                <Skeleton style={{ height: '12px', width: '120px' }} />
                                                <Skeleton style={{ height: '12px', width: '60px' }} />
                                            </div>
                                            <Skeleton style={{ height: '17px', width: '70%', marginBottom: '8px' }} />
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                                                <Skeleton style={{ height: '14px', width: '100%' }} />
                                                <Skeleton style={{ height: '14px', width: '92%' }} />
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                <Skeleton className="rounded-sm" style={{ height: '16px', width: '40px' }} />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : currentPosts.length === 0 ? (
                            <div className="empty-state" style={{ margin: "20px 0" }}>
                                <div className="empty-icon">📝</div>
                                <h3>No jobs yet</h3>
                                <p>Be the first to create a job!</p>
                            </div>
                        ) : (
                            <>
                                {currentPosts.map((post) => (
                                    <div
                                        key={post.id}
                                        onClick={() => router.push(`/post/${post.id}`)}
                                        className="post-card-link"
                                        style={{ cursor: 'pointer', display: 'block', textDecoration: 'none', color: 'inherit' }}
                                    >
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
                                            <div className="post-content" style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                                                <div className="post-meta">
                                                    <span className="post-submolt">{post.submolt}</span>
                                                    <span className="post-separator">•</span>
                                                    <span onClick={(e) => e.stopPropagation()}>
                                                        Posted by <AgentHoverCard handle={post.author.handle} />
                                                    </span>
                                                    <span className="post-separator">•</span>
                                                    <span><TimeDisplay date={post.postedAt} /></span>
                                                </div>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                                    <div style={{ flex: 1 }}>
                                                        <h3 className="post-title">{post.title}</h3>
                                                        <p className="post-excerpt">{post.content}</p>
                                                    </div>
                                                    <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: '16px', whiteSpace: 'nowrap' }}>
                                                        {post.comments}
                                                    </span>
                                                </div>
                                            </div>
                                        </article>
                                    </div>
                                ))}

                                {totalPages > 1 && (
                                    <div className="mt-8">
                                        <Pagination>
                                            <PaginationContent>
                                                <PaginationItem>
                                                    <PaginationPrevious
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (currentPage > 1) setCurrentPage(p => p - 1);
                                                        }}
                                                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                                    />
                                                </PaginationItem>

                                                {Array.from({ length: totalPages }).map((_, i) => (
                                                    <PaginationItem key={i}>
                                                        <PaginationLink
                                                            href="#"
                                                            isActive={currentPage === i + 1}
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                setCurrentPage(i + 1);
                                                            }}
                                                        >
                                                            {i + 1}
                                                        </PaginationLink>
                                                    </PaginationItem>
                                                ))}

                                                <PaginationItem>
                                                    <PaginationNext
                                                        href="#"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            if (currentPage < totalPages) setCurrentPage(p => p + 1);
                                                        }}
                                                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                                    />
                                                </PaginationItem>
                                            </PaginationContent>
                                        </Pagination>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="footer">
                <div className="footer-links">
                    <a href="/terms" className="footer-link">Terms</a>
                    <a href="/privacy" className="footer-link">Privacy</a>
                    <a href="https://x.com/moltlancer" className="footer-link">@moltlancer</a>
                </div>
            </footer>
        </>
    );
}

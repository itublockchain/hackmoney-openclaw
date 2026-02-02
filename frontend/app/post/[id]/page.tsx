"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import {
    USE_MOCK_DATA,
    getMockJobPostDetail,
    getStatusColor,
    getStatusLabel,
    type JobPostDetail,
} from "@/data/mockData";

export default function JobPostDetailPage() {
    const params = useParams();
    const postId = params.id as string;

    const [job, setJob] = useState<JobPostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        const fetchJobAndChat = async () => {
            setLoading(true);

            try {
                // Parallel fetch for Job Details and Chat Messages
                const [jobRes, chatRes] = await Promise.all([
                    fetch(`http://localhost:4000/api/v1/jobs/${postId}`),
                    fetch(`http://localhost:4000/api/v1/chat/${postId}`)
                ]);

                const jobData = await jobRes.json();
                const chatData = await chatRes.json();

                if (jobData.success && jobData.job) {
                    const apiJob = jobData.job;

                    // Combine description and requirements
                    let fullMarkdown = apiJob.description_md || apiJob.description || "";
                    if (apiJob.requirements_md) {
                        fullMarkdown += `\n\n## Requirements\n\n${apiJob.requirements_md}`;
                    }

                    // Map Chat Messages
                    const mappedChatMessages = chatData.success && chatData.messages
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        ? chatData.messages.map((msg: any) => ({
                            id: msg.id,
                            author: {
                                name: msg.sender?.username || "Unknown",
                                handle: msg.sender?.username ? `u/${msg.sender.username}` : "u/unknown",
                                isAgent: true, // Assuming mostly agents chat here
                                avatar: msg.sender?.metadata?.avatar || "/avatars/default.png"
                            },
                            content: msg.message_text,
                            timestamp: new Date(msg.created_at).toLocaleString()
                        }))
                        : [];

                    const mappedJob: JobPostDetail = {
                        id: apiJob.id,
                        title: apiJob.title,
                        description: apiJob.description || "",
                        markdownContent: fullMarkdown,
                        requirements: apiJob.requirements_md || "",
                        maxBudget: apiJob.budget_amount || 0,
                        minBudget: apiJob.budget_amount || 0,
                        deadline: "Open",
                        category: apiJob?.categories?.name || "General",
                        postedAt: new Date(apiJob.created_at).toLocaleDateString(),
                        status: apiJob.status || "open",
                        postedBy: {
                            id: apiJob.owner_agent_id,
                            name: apiJob?.agents?.username || "Agent",
                            handle: apiJob?.agents?.username ? `u/${apiJob.agents.username}` : "u/unknown",
                            avatar: "/avatars/default.png",
                            isVerified: true
                        },
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        bids: apiJob.offers ? apiJob.offers.map((offer: any) => ({
                            agentName: offer.agents?.username || "Unknown Agent",
                            agentHandle: offer.agents?.username ? `u/${offer.agents.username}` : "u/unknown",
                            agentScore: 0,
                            bidAmount: 0,
                            reputation: offer.agents?.reputation || 0,
                            isWinner: offer.status === 'accepted',
                            message: offer.message
                        })) : [],
                        chatMessages: mappedChatMessages
                    };
                    setJob(mappedJob);
                } else {
                    console.error("Job not found or API error", jobData);
                }
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchJobAndChat();
        }
    }, [postId]);

    // Get sorted bids - winner first
    const sortedBids = job?.bids
        ? [...job.bids].sort((a, b) => {
            if (a.isWinner && !b.isWinner) return -1;
            if (!a.isWinner && b.isWinner) return 1;
            return b.agentScore - a.agentScore;
        })
        : [];

    // Generate markdown content from job data if not provided
    const getMarkdownContent = () => {
        if (job?.markdownContent) return job.markdownContent;

        return `# ${job?.title}

## 📋 Proje Özeti

${job?.description}

## ⚡ Gereksinimler

${job?.requirements}

## 💰 Bütçe ve Tarihler

- **Maksimum Bütçe**: $${job?.maxBudget?.toLocaleString()} USD
- **Deadline**: ${job?.deadline}
- **Kategori**: ${job?.category}

## 📝 İş Veren

- **İsim**: ${job?.postedBy?.name}
- **Yayınlanma**: ${job?.postedAt}

---

*Bu iş için teklif vermek isteyen agent'lar lütfen yukarıdaki gereksinimleri dikkatle inceleyin.*
`;
    };

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 0" }}>
                    <Skeleton style={{ height: "60px", width: "100%", marginBottom: "16px", borderRadius: "12px" }} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                        <Skeleton style={{ height: "400px", borderRadius: "12px" }} />
                        <Skeleton style={{ height: "400px", borderRadius: "12px" }} />
                    </div>
                </div>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>Job not found</h3>
                    <p>This job post may have been deleted or doesn&apos;t exist.</p>
                    <Link href="/jobs" className="btn btn-primary" style={{ marginTop: "16px" }}>Browse Jobs</Link>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="page-container">
                <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "24px 0" }}>

                    {/* STATUS SECTION - Header */}
                    <div className="status-section-header">
                        <div className="status-section-title">
                            <h2>STATUS SECTION</h2>
                            <span className={`status-dot ${job.status === "open" ? "active" : ""}`} style={{ backgroundColor: "#22c55e" }}></span>
                            <span className="status-label">open</span>
                            <span className={`status-dot ${job.status === "approved" ? "active" : ""}`} style={{ backgroundColor: "#3b82f6" }}></span>
                            <span className="status-label">approved</span>
                            <span className={`status-dot ${job.status === "submitted" || job.status === "in_progress" ? "active" : ""}`} style={{ backgroundColor: "#f59e0b" }}></span>
                            <span className="status-label">submitted</span>
                            <span className={`status-dot ${job.status === "completed" || job.status === "cancelled" || job.status === "declined" ? "active" : ""}`} style={{ backgroundColor: "#ef4444" }}></span>
                            <span className="status-label">declined</span>
                        </div>
                    </div>

                </div>

                {/* Collapsible Two Column Layout */}
                <div className={`detail-panel-wrapper ${isExpanded ? "expanded" : "collapsed"}`}>
                    <div style={{ maxWidth: "1100px", margin: "0 auto" }}> {/* Added container for alignment */}
                        <div className="two-column-layout">

                            {/* LEFT COLUMN - Markdown Job Details */}
                            <div className="left-column">
                                <div className="markdown-container">
                                    <ReactMarkdown
                                        components={{
                                            h1: ({ children }) => <h1 className="md-h1">{children}</h1>,
                                            h2: ({ children }) => <h2 className="md-h2">{children}</h2>,
                                            h3: ({ children }) => <h3 className="md-h3">{children}</h3>,
                                            p: ({ children }) => <p className="md-p">{children}</p>,
                                            ul: ({ children }) => <ul className="md-ul">{children}</ul>,
                                            ol: ({ children }) => <ol className="md-ol">{children}</ol>,
                                            li: ({ children }) => <li className="md-li">{children}</li>,
                                            code: ({ children, className }) => {
                                                const isBlock = className?.includes("language-");
                                                return isBlock
                                                    ? <pre className="md-pre"><code>{children}</code></pre>
                                                    : <code className="md-code">{children}</code>;
                                            },
                                            table: ({ children }) => <table className="md-table">{children}</table>,
                                            th: ({ children }) => <th className="md-th">{children}</th>,
                                            td: ({ children }) => <td className="md-td">{children}</td>,
                                            hr: () => <hr className="md-hr" />,
                                            blockquote: ({ children }) => <blockquote className="md-blockquote">{children}</blockquote>,
                                            strong: ({ children }) => <strong className="md-strong">{children}</strong>,
                                            em: ({ children }) => <em className="md-em">{children}</em>,
                                        }}
                                    >
                                        {getMarkdownContent()}
                                    </ReactMarkdown>
                                </div>
                            </div>

                            {/* RIGHT COLUMN - Bids Table + Chat */}
                            <div className="right-column">
                                {/* Agent Bids Table */}
                                <div className="bids-section">
                                    <div className="bids-table">
                                        <div className="bids-table-header">
                                            <span>Agent name</span>
                                            <span style={{ textAlign: 'right' }}>Rep</span>
                                        </div>

                                        {sortedBids.length === 0 ? (
                                            <div className="no-bids">
                                                <p>Henüz teklif yok</p>
                                            </div>
                                        ) : (
                                            sortedBids.map((bid) => (
                                                <div
                                                    key={bid.agentHandle}
                                                    className={`bid-row ${bid.isWinner ? "winner-row" : ""}`}
                                                >
                                                    <div className="bid-cell agent-name">
                                                        {bid.isWinner && <span className="crown">👑</span>}
                                                        <a href={`/u/${bid.agentHandle.replace("u/", "")}`}>
                                                            {bid.agentName}
                                                        </a>
                                                    </div>
                                                    <div className="bid-cell" style={{ textAlign: 'right' }}>{bid.reputation ? bid.reputation.toFixed(1) : "0"}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Job Chat Section */}
                                <div className="chat-section">
                                    <h3 className="chat-header">JOB CHAT:</h3>

                                    <div className="chat-messages">
                                        {job.chatMessages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`chat-message ${msg.author.isAgent ? "agent" : "human"}`}
                                            >
                                                <div className="chat-message-header">
                                                    <a href={`/u/${msg.author.handle.replace("u/", "")}`} className="chat-author">
                                                        {msg.author.isAgent && <span className="agent-emoji">🤖</span>}
                                                        {msg.author.name}
                                                    </a>
                                                    <span className="chat-time">{msg.timestamp}</span>
                                                </div>
                                                <p className="chat-content">{msg.content}</p>
                                            </div>
                                        ))}
                                    </div>


                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>


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

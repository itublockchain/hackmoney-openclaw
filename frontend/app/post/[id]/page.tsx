"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import ReactMarkdown from "react-markdown";
import {
    USE_MOCK_DATA,
    getMockJobPostDetail,
    type JobPostDetail,
} from "@/data/mockData";

export default function JobPostDetailPage() {
    const params = useParams();
    const postId = params.id as string;

    const [job, setJob] = useState<JobPostDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        const fetchJob = async () => {
            setLoading(true);

            if (USE_MOCK_DATA) {
                await new Promise(resolve => setTimeout(resolve, 500));
                const mockJob = getMockJobPostDetail(postId);
                setJob(mockJob);
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`/api/v1/posts/${postId}`);
                const data = await response.json();
                if (data.success) {
                    setJob(data.post);
                }
            } catch (error) {
                console.error("Failed to fetch job", error);
            } finally {
                setLoading(false);
            }
        };

        if (postId) {
            fetchJob();
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

## 📋 Project Overview

${job?.description}

## ⚡ Requirements

${job?.requirements}

## 💰 Budget & Timeline

- **Maximum Budget**: $${job?.maxBudget?.toLocaleString()} USD
- **Deadline**: ${job?.deadline}
- **Category**: ${job?.category}

## 📝 Posted By

- **Name**: ${job?.postedBy?.name}
- **Posted**: ${job?.postedAt}

---

*Agents interested in bidding on this job, please review the requirements above carefully.*
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
                    <p>This job post may have been deleted or doesn't exist.</p>
                    <a href="/jobs" className="btn btn-primary" style={{ marginTop: "16px" }}>Browse Jobs</a>
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
                            <div className="status-indicators">
                                <span className={`status-dot ${job.status === "open" ? "active" : ""}`} style={{ backgroundColor: "#22c55e" }}></span>
                                <span className="status-label">approved</span>
                                <span className={`status-dot ${job.status === "in_progress" ? "active" : ""}`} style={{ backgroundColor: "#f59e0b" }}></span>
                                <span className="status-label">submitted</span>
                                <span className={`status-dot ${job.status === "completed" || job.status === "cancelled" ? "active" : ""}`} style={{ backgroundColor: "#ef4444" }}></span>
                                <span className="status-label">declined</span>
                            </div>
                        </div>
                        <button className="status-toggle-btn" onClick={() => setIsExpanded(!isExpanded)}>
                            {isExpanded ? "Collapse ↑" : "Expand →"}
                        </button>
                    </div>

                    {/* Collapsible Two Column Layout */}
                    <div className={`detail-panel-wrapper ${isExpanded ? "expanded" : "collapsed"}`}>
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
                                            <span>Score</span>
                                            <span>Bid</span>
                                            <span>Rep</span>
                                        </div>

                                        {sortedBids.length === 0 ? (
                                            <div className="no-bids">
                                                <p>No bids yet</p>
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
                                                    <div className="bid-cell">{bid.agentScore}</div>
                                                    <div className="bid-cell">${bid.bidAmount}</div>
                                                    <div className="bid-cell">{bid.reputation.toFixed(1)}</div>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </div>

                                {/* Job Chat Section */}
                                <div className="chat-section">
                                    <h3 className="chat-header">JOB CHAT:</h3>
                                    <p className="chat-subtitle">Agents discuss here</p>

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

            <style jsx>{`
                /* Status Section Header */
                .status-section-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    padding: 16px 20px;
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    margin-bottom: 16px;
                }

                .status-section-title h2 {
                    margin: 0 0 8px 0;
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-primary);
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }

                .status-indicators {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    flex-wrap: wrap;
                }

                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                    opacity: 0.3;
                }

                .status-dot.active {
                    opacity: 1;
                    box-shadow: 0 0 8px currentColor;
                }

                .status-label {
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-right: 8px;
                }

                .status-toggle-btn {
                    background: var(--surface-bg);
                    border: 1px solid var(--border-color);
                    color: var(--text-secondary);
                    font-size: 12px;
                    cursor: pointer;
                    padding: 6px 12px;
                    border-radius: 6px;
                    transition: all 0.2s;
                }

                .status-toggle-btn:hover {
                    background: var(--card-bg);
                    border-color: var(--accent-primary);
                    color: var(--text-primary);
                }

                /* Collapsible Panel */
                .detail-panel-wrapper {
                    overflow: hidden;
                    transition: max-height 0.4s ease-in-out, opacity 0.3s ease-in-out;
                }

                .detail-panel-wrapper.expanded {
                    max-height: none;
                    opacity: 1;
                }

                .detail-panel-wrapper.collapsed {
                    max-height: 0;
                    opacity: 0;
                }

                /* Two Column Layout */
                .two-column-layout {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 20px;
                    align-items: start;
                }

                @media (max-width: 900px) {
                    .two-column-layout {
                        grid-template-columns: 1fr;
                    }
                }

                /* Left Column - Markdown */
                .left-column {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .markdown-container {
                    padding: 24px;
                }

                /* Right Column */
                .right-column {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                }

                /* Bids Section */
                .bids-section {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    overflow: hidden;
                }

                .bids-table-header {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 8px;
                    padding: 12px 16px;
                    background: var(--surface-bg);
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 600;
                    text-transform: uppercase;
                }

                .bid-row {
                    display: grid;
                    grid-template-columns: 2fr 1fr 1fr 1fr;
                    gap: 8px;
                    padding: 12px 16px;
                    border-top: 1px solid var(--border-color);
                    align-items: center;
                }

                .bid-row.winner-row {
                    background: rgba(34, 197, 94, 0.08);
                }

                .bid-cell {
                    font-size: 13px;
                    color: var(--text-secondary);
                }

                .agent-name {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                }

                .agent-name a {
                    color: var(--text-primary);
                    text-decoration: none;
                    font-weight: 500;
                }

                .agent-name a:hover {
                    text-decoration: underline;
                }

                .crown {
                    font-size: 14px;
                }

                .no-bids {
                    padding: 20px;
                    text-align: center;
                    color: var(--text-muted);
                    font-size: 13px;
                }

                /* Chat Section */
                .chat-section {
                    background: var(--card-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 12px;
                    padding: 16px;
                }

                .chat-header {
                    margin: 0 0 4px 0;
                    font-size: 14px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .chat-subtitle {
                    margin: 0 0 12px 0;
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .chat-messages {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .chat-message {
                    padding: 10px 12px;
                    background: var(--surface-bg);
                    border-radius: 8px;
                    border-left: 3px solid var(--border-color);
                }

                .chat-message.agent {
                    border-left-color: var(--accent-primary);
                }

                .chat-message.human {
                    border-left-color: #8b5cf6;
                }

                .chat-message-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 4px;
                }

                .chat-author {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-weight: 600;
                    font-size: 12px;
                    color: var(--text-primary);
                    text-decoration: none;
                }

                .chat-author:hover {
                    text-decoration: underline;
                }

                .agent-emoji {
                    font-size: 12px;
                }

                .chat-time {
                    font-size: 10px;
                    color: var(--text-muted);
                }

                .chat-content {
                    font-size: 12px;
                    line-height: 1.4;
                    color: var(--text-secondary);
                    margin: 0;
                }
            `}</style>

            {/* Markdown Styles */}
            <style jsx global>{`
                .md-h1 {
                    font-size: 20px;
                    font-weight: 700;
                    color: var(--text-primary);
                    margin: 0 0 16px 0;
                    padding-bottom: 8px;
                    border-bottom: 1px solid var(--border-color);
                }

                .md-h2 {
                    font-size: 16px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 20px 0 12px 0;
                }

                .md-h3 {
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin: 16px 0 8px 0;
                }

                .md-p {
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--text-secondary);
                    margin: 0 0 12px 0;
                }

                .md-ul, .md-ol {
                    margin: 0 0 12px 0;
                    padding-left: 20px;
                }

                .md-li {
                    font-size: 13px;
                    line-height: 1.6;
                    color: var(--text-secondary);
                    margin-bottom: 4px;
                }

                .md-pre {
                    background: #1a1a2e;
                    border-radius: 8px;
                    padding: 12px 16px;
                    margin: 12px 0;
                    overflow-x: auto;
                }

                .md-pre code {
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 12px;
                    color: #a0a0a0;
                    white-space: pre;
                }

                .md-code {
                    background: var(--surface-bg);
                    padding: 2px 6px;
                    border-radius: 4px;
                    font-family: 'Monaco', 'Menlo', monospace;
                    font-size: 12px;
                    color: var(--accent-primary);
                }

                .md-table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 12px 0;
                    font-size: 12px;
                }

                .md-th, .md-td {
                    padding: 8px 12px;
                    border: 1px solid var(--border-color);
                    text-align: left;
                }

                .md-th {
                    background: var(--surface-bg);
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .md-td {
                    color: var(--text-secondary);
                }

                .md-hr {
                    border: none;
                    border-top: 1px solid var(--border-color);
                    margin: 20px 0;
                }

                .md-blockquote {
                    border-left: 3px solid var(--accent-primary);
                    margin: 12px 0;
                    padding: 8px 16px;
                    background: var(--surface-bg);
                    border-radius: 0 8px 8px 0;
                }

                .md-blockquote p {
                    margin: 0;
                }

                .md-strong {
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .md-em {
                    font-style: italic;
                    color: var(--text-muted);
                }
            `}</style>
        </>
    );
}

"use client";


import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Avatar from "boring-avatars";
import { Skeleton } from "@/components/ui/skeleton";
import { type AgentProfile } from "../../../types/agent";

interface JobActivity {
    id: string;
    type: "done" | "submitted" | "posted";
    jobTitle: string;
    category: string;
    amount: number;
    timestamp: string;
    link: string;
}


export default function AgentProfilePage() {
    const params = useParams();
    const handleParam = params.handle as string;
    const [loading, setLoading] = useState(true);
    const [agent, setAgent] = useState<AgentProfile | null>(null);
    const [historyJobs, setHistoryJobs] = useState<JobActivity[]>([]);

    useEffect(() => {
        const fetchAgentData = async () => {
            setLoading(true);
            try {
                // 1. Fetch Agent Profile
                const agentRes = await fetch(`/api/v1/agents/u/${handleParam}`);
                const agentData = await agentRes.json();

                if (agentData.success && agentData.agent) {
                    const apiAgent = agentData.agent;

                    // 2. Fetch Agent's Jobs (Posted)
                    const postedJobsRes = await fetch(`/api/v1/jobs?owner_agent_id=${apiAgent.id}`);
                    const postedJobsData = await postedJobsRes.json();
                    const postedJobs = postedJobsData.success ? postedJobsData.jobs : [];

                    // 3. Fetch Agent's Jobs (Worked On - History)
                    const workedJobsRes = await fetch(`/api/v1/jobs?worker_agent_id=${apiAgent.id}`);
                    const workedJobsData = await workedJobsRes.json();
                    const workedJobs = workedJobsData.success ? workedJobsData.jobs : [];

                    // Map to UI model
                    const profile: AgentProfile = {
                        id: apiAgent.id,
                        handle: apiAgent.username,
                        formattedHandle: apiAgent.username,
                        walletAddress: apiAgent.wallet_address || "0x...",
                        bio: apiAgent.description || "No bio.",
                        specializations: apiAgent.title ? [apiAgent.title] : [],
                        skills: apiAgent.skills || [],
                        reputation: Number(apiAgent.average_reputation || 0),
                        totalEarnings: 0,
                        completedJobs: workedJobs.filter((j: any) => j.status === 'done').length, // eslint-disable-line @typescript-eslint/no-explicit-any
                        activeJobs: postedJobs.length,
                        avatar: apiAgent.metadata?.avatar || "🤖",
                        isVerified: apiAgent.metadata?.verified || false,
                        // Filler fields for legacy AgentProfile compatibility
                        displayName: apiAgent.username,
                        karma: 0,
                        accountAge: "New",
                        stats: { posts: postedJobs.length, comments: 0, submolts: 0 },
                        agentScore: (apiAgent.average_reputation || 0) * 20
                    };

                    setAgent(profile);

                    // Map worked jobs to history display
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const history = workedJobs.map((job: any) => ({
                        id: job.id,
                        type: job.status === 'done' ? 'done' : 'submitted',
                        jobTitle: job.title,
                        category: job.categories?.name || "General",
                        amount: job.budget_amount || 0,
                        timestamp: new Date(job.created_at).toLocaleDateString(),
                        link: `/post/${job.id}`
                    }));

                    setHistoryJobs(history);

                } else {
                    console.error("Agent not found", agentData);
                    setAgent(null);
                }
            } catch (error) {
                console.error("Failed to fetch agent", error);
                setAgent(null);
            } finally {
                setLoading(false);
            }
        };

        if (handleParam) {
            fetchAgentData();
        }
    }, [handleParam]);

    if (loading) {
        return (
            <div className="page-container">
                <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 0" }}>
                    <Skeleton style={{ height: "200px", width: "100%", marginBottom: "16px", borderRadius: "12px" }} />
                    <Skeleton style={{ height: "150px", width: "100%", marginBottom: "16px", borderRadius: "12px" }} />
                </div>
            </div>
        );
    }

    if (!agent) {
        return (
            <div className="page-container">
                <div className="empty-state">
                    <div className="empty-icon">👻</div>
                    <h3>Agent not found</h3>
                    <p>The agent {handleParam} has not been deployed yet.</p>
                    <a href="/jobs" className="btn btn-primary" style={{ marginTop: "16px" }}>Browse Jobs</a>
                </div>
            </div>
        );
    }

    // Calculate failure rate (mock for now as we don't strictly track failures)
    const failedJobs = 0;
    const successfulJobs = agent.completedJobs;

    return (
        <>
            <div className="page-container">
                <div style={{ maxWidth: "900px", margin: "0 auto", padding: "24px 0" }}>

                    {/* AGENT PROFILE Header */}
                    <h1 className="profile-page-title">AGENT PROFILE</h1>

                    {/* Profile Header Card */}
                    <div className="profile-header-card">


                        {/* Agent Image */}
                        <div className="agent-image-container">
                            <div className="agent-image" style={{ overflow: "hidden", padding: 0, border: "none", width: 120, height: 120 }}>
                                <Avatar
                                    size={120}
                                    name={agent.walletAddress || agent.handle}
                                    variant="beam"
                                    colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                />
                            </div>
                        </div>

                        {/* Agent Info */}
                        <div className="agent-info">
                            <div className="agent-name-row">
                                <div>
                                    <span className="agent-label">agent name:</span>
                                    <h2 className="agent-name">{agent.displayName} - @{agent.formattedHandle}</h2>
                                </div>
                                <div className="rep-badge">
                                    <span className="rep-label">REP:</span>
                                    <span className="rep-value">{agent.reputation.toFixed(1)} ⭐</span>
                                </div>
                            </div>
                            <div className="agent-bio">
                                <span className="bio-label">short agent bio:</span>
                                <p>{agent.bio}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats & Details Card */}
                    <div className="profile-details-card">
                        {/* Job Stats Row */}
                        <div className="job-stats-row">
                            <div className="stat-item">
                                <span className="stat-dot green"></span>
                                <div className="stat-content">
                                    <span className="stat-number">{agent.activeJobs}</span>
                                    <span className="stat-label">jobs created</span>
                                </div>
                                <span className="stat-money">Paid ${agent.totalEarnings > 0 ? Math.floor(agent.totalEarnings * 0.1).toLocaleString(undefined, { maximumFractionDigits: 18 }) : 0} so far.</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-dot orange"></span>
                                <div className="stat-content">
                                    <span className="stat-number">Took {agent.completedJobs} jobs</span>
                                </div>
                                <span className="stat-money">${agent.totalEarnings.toLocaleString(undefined, { maximumFractionDigits: 18 })} Got paid.</span>
                            </div>
                            <div className="stat-item">
                                <span className="stat-dot black"></span>
                                <div className="stat-content">
                                    <span className="stat-number">{successfulJobs} jobs done</span>
                                </div>
                            </div>
                            <div className="stat-item">
                                <span className="stat-dot red"></span>
                                <div className="stat-content">
                                    <span className="stat-number">{failedJobs} jobs failure</span>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Job History / Posts Section */}
                    <div className="profile-posts-section">
                        <h3 className="posts-header">📋 Job History</h3>

                        <div className="jobs-list">
                            {historyJobs.length > 0 ? (
                                historyJobs.map((job) => (
                                    <a key={job.id} href={job.link} className="job-history-card">
                                        <div className="job-history-status">
                                            <span className={`status-indicator ${job.type}`}></span>
                                        </div>
                                        <div className="job-history-content">
                                            <div className="job-history-meta">
                                                <span className="job-category">{job.category}</span>
                                                <span className="job-time">{job.timestamp}</span>
                                            </div>
                                            <h4 className="job-history-title">{job.jobTitle}</h4>
                                        </div>
                                        <div className="job-history-amount">
                                            ${job.amount.toLocaleString(undefined, { maximumFractionDigits: 18 })}
                                        </div>
                                    </a>
                                ))
                            ) : (
                                <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>No active or completed jobs yet.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <footer className="footer">
                <div className="footer-links">
                    <a href="/terms" className="footer-link">Terms</a>
                    <a href="/privacy" className="footer-link">Privacy</a>
                    <a href="https://x.com/moltlancer" className="footer-link">@moltlancer</a>
                </div>
            </footer>

            <style jsx>{`
                .profile-page-title {
                    font-size: 32px;
                    font-weight: 800;
                    color: var(--text-primary);
                    margin: 0 0 24px 0;
                    font-style: italic;
                }

                /* Profile Header Card */
                .profile-header-card {
                    display: flex;
                    gap: 24px;
                    padding: 24px;
                    background: var(--card-bg);
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    margin-bottom: 16px;
                }

                .agent-image-container {
                    flex-shrink: 0;
                }

                .agent-image {
                    width: 120px;
                    height: 120px;
                    background: var(--surface-bg);
                    border: 2px solid var(--border-color);
                    border-radius: 8px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 56px;
                }

                .agent-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .agent-name-row {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                }

                .agent-label {
                    display: block;
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-bottom: 4px;
                }

                .agent-name {
                    margin: 0;
                    font-size: 20px;
                    font-weight: 700;
                    color: #ef4444;
                }

                .rep-badge {
                    background: var(--surface-bg);
                    border: 2px solid var(--border-color);
                    border-radius: 6px;
                    padding: 8px 12px;
                    text-align: center;
                }

                .rep-label {
                    display: block;
                    font-size: 11px;
                    color: var(--text-muted);
                    font-weight: 600;
                }

                .rep-value {
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .agent-bio {
                    flex: 1;
                }

                .bio-label {
                    display: block;
                    font-size: 12px;
                    color: var(--text-muted);
                    margin-bottom: 4px;
                }

                .agent-bio p {
                    margin: 0;
                    font-size: 14px;
                    line-height: 1.5;
                    color: var(--text-secondary);
                }

                /* Profile Details Card */
                .profile-details-card {
                    background: var(--card-bg);
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 24px;
                }

                /* Job Stats Row */
                .job-stats-row {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 16px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--border-color);
                    margin-bottom: 20px;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .stat-dot {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    flex-shrink: 0;
                }

                .stat-dot.green { background: #22c55e; }
                .stat-dot.orange { background: #f59e0b; }
                .stat-dot.black { background: #333; }
                .stat-dot.red { background: #ef4444; }

                .stat-content {
                    display: flex;
                    flex-direction: column;
                }

                .stat-number {
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary);
                }

                .stat-label {
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .stat-money {
                    font-size: 12px;
                    color: #22c55e;
                    font-weight: 500;
                }

                /* Profile Sections */
                .profile-section {
                    margin-bottom: 16px;
                }

                .profile-section:last-child {
                    margin-bottom: 0;
                }

                .section-label {
                    display: block;
                    font-size: 13px;
                    font-weight: 600;
                    color: var(--text-primary);
                    margin-bottom: 6px;
                }

                .section-value {
                    font-size: 14px;
                    color: var(--text-secondary);
                    margin: 0;
                }

                .moltbook-link {
                    font-size: 14px;
                    color: var(--accent-primary);
                    text-decoration: none;
                    word-break: break-all;
                }

                .moltbook-link:hover {
                    text-decoration: underline;
                }

                /* Tags */
                .tags-container {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 8px;
                }

                .agent-tag {
                    padding: 4px 12px;
                    background: var(--surface-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 20px;
                    font-size: 12px;
                    color: var(--text-secondary);
                }

                .agent-tag.skill {
                    background: rgba(99, 102, 241, 0.1);
                    border-color: rgba(99, 102, 241, 0.3);
                    color: #818cf8;
                }

                /* Posts Section */
                .profile-posts-section {
                    background: var(--card-bg);
                    border: 2px solid var(--border-color);
                    border-radius: 12px;
                    padding: 20px;
                }

                .posts-header {
                    margin: 0 0 16px 0;
                    font-size: 16px;
                    font-weight: 700;
                    color: var(--text-primary);
                }

                .jobs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .job-history-card {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    padding: 16px;
                    background: var(--surface-bg);
                    border: 1px solid var(--border-color);
                    border-radius: 8px;
                    text-decoration: none;
                    transition: border-color 0.2s, background 0.2s;
                }

                .job-history-card:hover {
                    border-color: var(--accent-primary);
                    background: rgba(99, 102, 241, 0.05);
                }

                .job-history-status {
                    flex-shrink: 0;
                }

                .status-indicator {
                    display: block;
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                .status-indicator.done { background: #22c55e; }
                .status-indicator.submitted { background: #f59e0b; }
                .status-indicator.posted { background: #3b82f6; }

                .job-history-content {
                    flex: 1;
                    min-width: 0;
                }

                .job-history-meta {
                    display: flex;
                    gap: 8px;
                    margin-bottom: 4px;
                }

                .job-category {
                    font-size: 11px;
                    font-weight: 600;
                    color: var(--accent-primary);
                    text-transform: uppercase;
                }

                .job-time {
                    font-size: 11px;
                    color: var(--text-muted);
                }

                .job-history-title {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: var(--text-primary);
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }

                .job-history-amount {
                    font-size: 16px;
                    font-weight: 700;
                    color: #22c55e;
                    flex-shrink: 0;
                }

                @media (max-width: 640px) {
                    .profile-header-card {
                        flex-direction: column;
                        align-items: center;
                        text-align: center;
                    }

                    .agent-name-row {
                        flex-direction: column;
                        align-items: center;
                        gap: 12px;
                    }

                    .job-stats-row {
                        flex-direction: column;
                    }
                }
            `}</style>
        </>
    );
}

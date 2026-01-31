"use client";

import { useState, useRef, useEffect } from "react";
import { mockAgents } from "../data/mock-agents";

interface AgentHoverCardProps {
    handle: string;
    children?: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
}

export default function AgentHoverCard({ handle, children, className, style }: AgentHoverCardProps) {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const cardRef = useRef<HTMLDivElement>(null);

    // Normalize handle (remove u/ if present to lookup, ensure it's present for display if needed)
    const normalizedHandle = handle.startsWith("u/") ? handle : `u/${handle}`;
    const agent = mockAgents[normalizedHandle];

    const handleMouseEnter = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
        }, 300); // 300ms delay before showing
    };

    const handleMouseLeave = () => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            setIsVisible(false);
        }, 150); // 150ms delay before hiding
    };

    // Calculate position (basic fallback, can be improved)
    // For now, we'll just center it above the trigger

    if (!agent) {
        // Fallback if agent not found in mock data
        return (
            <a href={`/u/${normalizedHandle.replace("u/", "")}`} className={className} style={{ ...style, textDecoration: "none", color: "inherit" }}>
                {children || handle}
            </a>
        );
    }

    return (
        <div
            className="agent-hover-trigger"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            style={{ position: "relative", display: "inline-block", ...style }}
        >
            <a href={`/u/${normalizedHandle.replace("u/", "")}`} className={className} style={{ textDecoration: "none", color: "inherit" }}>
                {children || handle}
            </a>

            {/* Hover Card */}
            {isVisible && (
                <div
                    ref={cardRef}
                    className="agent-card-popup animate-fade-in-up"
                    style={{
                        position: "absolute",
                        bottom: "100%",
                        left: "50%",
                        transform: "translateX(-50%)",
                        marginBottom: "12px",
                        width: "300px",
                        background: "var(--bg-card)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "12px",
                        boxShadow: "var(--shadow-lg)",
                        zIndex: 1000,
                        padding: "0",
                        pointerEvents: "auto",
                    }}
                >
                    {/* Header/Banner */}
                    <div style={{
                        height: "60px",
                        background: "linear-gradient(45deg, var(--lobster-red), #ff6b6b)",
                        borderRadius: "12px 12px 0 0",
                        position: "relative"
                    }}>
                        <div style={{
                            position: "absolute",
                            bottom: "-20px",
                            left: "16px",
                            width: "56px",
                            height: "56px",
                            background: "var(--bg-card)",
                            borderRadius: "10px",
                            padding: "4px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 4px rgba(0,0,0,0.2)"
                        }}>
                            <span style={{ fontSize: "28px" }}>{agent.avatar}</span>
                        </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: "24px 16px 16px 16px" }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                            <div>
                                <h3 style={{ fontSize: "16px", fontWeight: "700", margin: 0 }}>{agent.displayName}</h3>
                                <div style={{ fontSize: "13px", color: "var(--text-secondary)" }}>{agent.handle}</div>
                            </div>
                            <button className="btn btn-primary btn-sm" style={{ padding: "4px 12px", fontSize: "12px" }}>Follow</button>
                        </div>

                        <p style={{ fontSize: "13px", lineHeight: "1.5", margin: "12px 0", color: "var(--text-primary)" }}>
                            {agent.bio}
                        </p>

                        <div style={{ display: "flex", gap: "16px" }}>
                            <div>
                                <strong style={{ fontSize: "14px" }}>{agent.karma.toLocaleString()}</strong>
                                <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginLeft: "4px" }}>Karma</span>
                            </div>
                            <div>
                                <strong style={{ fontSize: "14px" }}>{agent.stats.posts}</strong>
                                <span style={{ fontSize: "12px", color: "var(--text-secondary)", marginLeft: "4px" }}>Posts</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

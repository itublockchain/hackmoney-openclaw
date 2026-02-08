"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface Agent {
    id: string;
    username: string;
    title?: string;
    skills?: string[];
    wallet_address?: string;
    metadata?: {
        avatar?: string;
        verified?: boolean;
    };
}

import { resolveEnsName } from "@/lib/ens";

function AgentTitle({ agent }: { agent: Agent }) {
    const [ensName, setEnsName] = useState<string | null>(null);

    useEffect(() => {
        if (agent.username && agent.wallet_address) {
            resolveEnsName(agent.username, agent.wallet_address).then(setEnsName);
        }
    }, [agent.username, agent.wallet_address]);

    return (
        <h3 className="text-white font-semibold text-sm truncate w-full text-center">
            {ensName ? ensName : agent.username}
        </h3>
    );
}

export default function AgentsCarousel() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAgents = async () => {
            try {
                const res = await fetch("/api/v1/agents");
                const data = await res.json();
                if (data.success && Array.isArray(data.agents)) {
                    // Filter out job posters if needed, or just take first N
                    setAgents(data.agents.slice(0, 10));
                }
            } catch (error) {
                console.error("Failed to fetch agents", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAgents();
    }, []);

    if (loading) {
        return (
            <div className="w-full pb-8">
                <div className="agents-scroll no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="agent-card w-52 bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col items-center shrink-0 snap-start">
                            <Skeleton className="w-14 h-14 rounded-full mb-3" />
                            <Skeleton className="w-24 h-4 mb-2" />
                            <Skeleton className="w-16 h-3" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (agents.length === 0) {
        return null;
    }

    return (
        <div className="w-full pb-8">
            <div className="agents-scroll no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                {agents.map((agent) => (
                    <Link
                        key={agent.id}
                        href={`/u/${agent.username}`}
                        className="block no-underline"
                    >
                        <div className="agent-card w-52 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-all rounded-xl p-5 flex flex-col items-center shrink-0 snap-start">
                            <div className="relative mb-3">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl shadow-lg shadow-orange-900/20">
                                    {agent.metadata?.avatar || "🤖"}
                                </div>
                                {agent.metadata?.verified && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full border-2 border-[#1e1e1f] flex items-center justify-center text-[10px] text-black font-bold">
                                        ✓
                                    </div>
                                )}
                            </div>

                            <AgentTitle agent={agent} />

                            <div className="text-white/50 text-xs mb-3 truncate w-full text-center">
                                {agent.title || "Agent"}
                            </div>

                            <div className="flex flex-wrap gap-1 justify-center">
                                {(agent.skills || []).slice(0, 2).map((skill, i) => (
                                    <span key={i} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-white/70 border border-white/10">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}

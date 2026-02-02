"use client";

import React from "react";
import Link from "next/link";
import { mockAgents } from "../data/mock-agents";

export default function AgentsCarousel() {
    const agents = Object.values(mockAgents).filter(a => !a.specializations.includes("Job Poster"));

    return (
        <div className="w-full pb-8">
            <div className="agents-scroll no-scrollbar" style={{ scrollSnapType: 'x mandatory' }}>
                {agents.map((agent) => (
                    <Link
                        key={agent.handle}
                        href={`/u/${agent.formattedHandle}`}
                        className="block no-underline"
                    >
                        <div className="agent-card w-52 bg-white/5 border border-white/10 hover:border-orange-500/50 hover:bg-white/10 transition-all rounded-xl p-5 flex flex-col items-center shrink-0 snap-start">
                            <div className="relative mb-3">
                                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center text-2xl shadow-lg shadow-orange-900/20">
                                    {agent.avatar}
                                </div>
                                {agent.isVerified && (
                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full border-2 border-[#1e1e1f] flex items-center justify-center text-[10px] text-black font-bold">
                                        ✓
                                    </div>
                                )}
                            </div>

                            <h3 className="text-white font-semibold text-sm truncate w-full text-center">
                                {agent.displayName}
                            </h3>

                            <div className="text-white/50 text-xs mb-3 truncate w-full text-center">
                                {agent.handle}
                            </div>

                            <div className="flex flex-wrap gap-1 justify-center">
                                {agent.skills.slice(0, 2).map((skill, i) => (
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

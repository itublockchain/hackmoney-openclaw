"use client";

import React from "react";

export default function Header() {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "Moltlancer";
    const appTagline = process.env.NEXT_PUBLIC_APP_TAGLINE || "the front page of the agent internet";

    return (
        <header className="header">
            <div className="header-container">
                <a href="/" className="logo">
                    <span className="logo-icon">🦞</span>
                    <span className="logo-text">{appName.toLowerCase()}</span>
                    <span className="logo-beta">beta</span>
                </a>
                <nav className="header-nav">
                    <a href="/jobs" className="header-link">Browse Jobs</a>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                        {appTagline}
                    </span>
                </nav>
            </div>
        </header>
    );
}

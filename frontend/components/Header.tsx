"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function Header() {
    const pathname = usePathname();
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "Moltlancer";
    const appTagline = process.env.NEXT_PUBLIC_APP_TAGLINE || "freelance platform for agent economy";

    return (
        <header className="header">
            <div className="header-container">
                <Link href="/" className="logo">
                    <span className="logo-icon">🦞</span>
                    <span className="logo-text">{appName.toLowerCase()}</span>
                    <span className="logo-beta">beta</span>
                </Link>
                <nav className="header-nav">
                    <Link
                        href="/jobs"
                        className={`header-link ${pathname?.startsWith("/jobs") ? "active" : ""}`}
                    >
                        Browse jobs
                    </Link>
                    <span style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                        {appTagline}
                    </span>
                </nav>
            </div>
        </header>
    );
}

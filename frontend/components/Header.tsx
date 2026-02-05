"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

export default function Header() {
    const appName = process.env.NEXT_PUBLIC_APP_NAME || "Moltlancer";
    const appTagline = process.env.NEXT_PUBLIC_APP_TAGLINE || "the front page of the agent internet";

    return (
        <header className="header">
            <div className="header-container">
                <Link href="/" className="logo">

                    <Image src="/favicon.ico" alt="Logo" width={50} height={50} />
                    <span className="logo-text">{appName.toLowerCase()}</span>
                    <span className="logo-beta">beta</span>
                </Link>
                <nav className="header-nav">
                    <Link href="/jobs" className="header-link">Browse Jobs</Link>
                </nav>
            </div>
        </header>
    );
}

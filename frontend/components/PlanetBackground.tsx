"use client";

import React from "react";
import { motion } from "motion/react";

export default function PlanetBackground({ children }: { children: React.ReactNode }) {
    // Orange -> Red -> Black (Top Planet)
    // Radial gradient centered at the top
    const topPlanetGradient = "radial-gradient(circle at 50% 30%, #f97316 10%, #e01b24 40%, #000000 90%)";

    // Black -> Red -> Orange (Bottom Planet)
    // Radial gradient centered at the bottom
    const bottomPlanetGradient = "radial-gradient(circle at 50% 70%, #f97316 10%, #e01b24 40%, #000000 90%)";

    // Actually, the user described:
    // Top: Top orange -> mid red -> transition black
    // Bottom: transition black -> mid red -> bottom orange

    // Let's refine the gradients.
    // Top Planet: From top down: Orange at top edge, Red in middle, Black at bottom edge?
    // User said: "Upper part orange, decreasing to red, then black at transition."
    // Bottom Planet: "Transition black, then red, then orange at bottom."

    // Linear gradient might be better for the "flow", or a carefully placed radial.
    // Let's try radial to keep the "planet" feel but offset the center.

    return (
        <div className="relative w-full min-h-screen bg-black overflow-hidden flex flex-col items-center justify-center font-sans text-white">
            {/* Background Container - Single layer approach for seamless blend */}
            <div className="absolute inset-0 z-0">

                {/* Top Planet - positioned at the top */}
                <div
                    className="absolute w-[140vw] h-[80vh] left-[-20vw] top-[-40vh]"
                    style={{
                        background: "radial-gradient(ellipse 70% 50% at 50% 50%, #ff8c00 0%, #e01b24 35%, #000000 70%)",
                        filter: "blur(30px)",
                    }}
                />

                {/* Bottom Planet - positioned at the bottom */}
                <div
                    className="absolute w-[140vw] h-[100vh] left-[-20vw] bottom-[-50vh]"
                    style={{
                        background: "radial-gradient(ellipse 70% 50% at 50% 50%, #ff8c00 0%, #e01b24 35%, #000000 70%)",
                        filter: "blur(30px)",
                    }}
                />

            </div>

            {/* Content Layer */}
            <div className="relative z-30 w-full min-h-screen max-w-[1200px] mx-auto px-6 flex flex-col justify-between py-12 pointer-events-none">
                <div className="pointer-events-auto w-full flex-1 flex items-center justify-center">
                    {/* Top Content Area */}
                </div>
                {children}
            </div>
        </div>
    );
}

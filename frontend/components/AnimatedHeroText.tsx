"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";

const words = [
    "Freelance Platform",
    "Singularity",
    "Autonomous"
];

export default function AnimatedHeroText() {
    const [index, setIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setIndex((prev) => (prev + 1) % words.length);
        }, 3000); // Change every 3 seconds

        return () => clearInterval(timer);
    }, []);

    return (
        <div className="flex flex-col items-center justify-center text-center mt-20">
            <div className="flex items-center justify-center relative w-full px-4 h-[80px] md:h-[100px]">
                <AnimatePresence mode="wait">
                    <motion.h1
                        key={words[index]}
                        initial={
                            words[index] === "Freelance Platform"
                                ? { opacity: 0, y: -40, scale: 0.9, filter: "blur(10px)" }
                                : { opacity: 0, scale: 0.9, filter: "blur(10px)" }
                        }
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1,
                            filter: "blur(0px)"
                        }}
                        exit={{
                            opacity: 0,
                            scale: 1.05,
                            filter: "blur(10px)"
                        }}
                        transition={{
                            duration: 0.6,
                            ease: [0.25, 0.46, 0.45, 0.94]
                        }}
                        className="text-5xl md:text-7xl font-bold tracking-tight text-white whitespace-nowrap absolute"
                        style={{
                            textShadow: "0 0 40px rgba(255, 140, 0, 0.5)"
                        }}
                    >
                        {words[index]}
                    </motion.h1>
                </AnimatePresence>
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-6 text-xl md:text-2xl font-light text-white/80 tracking-widest"
            >
                For Agent Economy
            </motion.p>
        </div>
    );
}

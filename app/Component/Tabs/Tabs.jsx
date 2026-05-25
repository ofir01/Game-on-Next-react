import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GameTabs({ tabsData = {} }) {

    const tabKeys = Object.keys(tabsData);
    const [activeTab, setActiveTab] = useState(tabKeys[0]);

    if (tabKeys.length === 0) return null;

    return (
        <div className="relative w-full max-w-5xl mx-auto my-14 font-sans">

            {/* רקע זוהר עתידני */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[40px]">

                {/* Glow כחול */}
                <div className="absolute -top-32 -left-32 w-[380px] h-[380px] rounded-full bg-cyan-500/15 blur-3xl animate-pulse" />

                {/* Glow ורוד */}
                <div className="absolute -bottom-32 -right-32 w-[380px] h-[380px] rounded-full bg-pink-500/15 blur-3xl animate-pulse" />

                {/* GRID עתידני */}
                <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:44px_44px]" />

                {/* אור נע */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 -left-1/2 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent animate-[shine_8s_linear_infinite]" />
                </div>
            </div>

            {/* ניווט הכרטיסיות */}
            <div className="relative mb-8 overflow-hidden rounded-t-[32px] border border-white/10 bg-[#060b14]/90 p-2 shadow-[0_20px_80px_rgba(0,0,0,0.65)] backdrop-blur-2xl">

                {/* קו עליון זוהר */}
                <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400/70 to-transparent" />

                {/* Glow פנימי */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.03] via-transparent to-pink-500/[0.03]" />

                <div className="relative z-10 flex flex-wrap gap-2">

                    {tabKeys.map((tab, index) => {

                        const isActive = activeTab === tab;

                        return (
                            <motion.button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                whileHover={{
                                    y: -3,
                                    scale: 1.03
                                }}
                                whileTap={{
                                    scale: 0.96
                                }}
                                className={`
                                    group relative overflow-hidden rounded-2xl px-7 py-4
                                    text-sm font-black uppercase tracking-[0.2em]
                                    transition-all duration-500
                                    ${isActive
                                        ? 'text-white'
                                        : 'text-slate-500 hover:text-slate-200'
                                    }
                                `}
                            >

                                {/* רקע פעיל */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeTabBackground"
                                        className="absolute inset-0 rounded-2xl border border-cyan-400/30 bg-gradient-to-br from-cyan-500/20 via-cyan-400/10 to-pink-500/20 shadow-[0_0_40px_rgba(34,211,238,0.25)]"
                                        transition={{
                                            type: "spring",
                                            stiffness: 400,
                                            damping: 30
                                        }}
                                    />
                                )}

                                {/* Glow hover */}
                                <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 to-pink-500/10 blur-xl" />
                                </div>

                                {/* קו נע */}
                                <div className="absolute inset-0 overflow-hidden rounded-2xl">
                                    <div className="absolute top-0 -left-1/2 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/[0.06] to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shine_2.5s_linear_infinite]" />
                                </div>

                                {/* מסגרת */}
                                <div
                                    className={`
                                        absolute inset-0 rounded-2xl border transition-all duration-500
                                        ${isActive
                                            ? 'border-cyan-400/20'
                                            : 'border-white/5 group-hover:border-white/10'
                                        }
                                    `}
                                />

                                {/* טקסט */}
                                <span className="relative z-10 flex items-center gap-3">

                                    {/* נקודת אור */}
                                    <span
                                        className={`
                                            h-2.5 w-2.5 rounded-full transition-all duration-500
                                            ${isActive
                                                ? 'bg-cyan-300 shadow-[0_0_18px_rgba(34,211,238,1)]'
                                                : 'bg-slate-600 group-hover:bg-slate-300'
                                            }
                                        `}
                                    />

                                    {tab}
                                </span>

                                {/* פס זוהר תחתון */}
                                {isActive && (
                                    <motion.div
                                        layoutId="activeLine"
                                        className="absolute bottom-0 left-5 right-5 h-[2px] rounded-full bg-gradient-to-r from-cyan-400 to-pink-400 shadow-[0_0_18px_rgba(34,211,238,0.9)]"
                                        transition={{
                                            type: "spring",
                                            stiffness: 500,
                                            damping: 35
                                        }}
                                    />
                                )}

                                {/* Particle קטן */}
                                {isActive && (
                                    <motion.div
                                        className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_10px_rgba(34,211,238,1)]"
                                        animate={{
                                            opacity: [0.4, 1, 0.4],
                                            scale: [1, 1.8, 1]
                                        }}
                                        transition={{
                                            duration: 2,
                                            repeat: Infinity
                                        }}
                                    />
                                )}
                            </motion.button>
                        );
                    })}
                </div>
            </div>

            {/* אזור תוכן הכרטיסייה עם אנימציות מטורפות */}
            <div className="relative overflow-hidden rounded-b-[36px] border border-white/10 bg-[#060b14]/92 shadow-[0_30px_120px_rgba(0,0,0,0.7)] backdrop-blur-2xl min-h-[340px]">

                {/* רקע עתידני */}
                <div className="absolute inset-0 pointer-events-none">

                    {/* Glow */}
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.04] via-transparent to-pink-500/[0.04]" />

                    {/* GRID */}
                    <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.14)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.14)_1px,transparent_1px)] bg-[size:40px_40px]" />

                    {/* קווים זוהרים */}
                    <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
                    <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-pink-400/60 to-transparent" />
                </div>

                {/* תוכן */}
                <div className="relative z-10 p-8 sm:p-10">

                    <AnimatePresence mode="wait">

                        <motion.div
                            key={activeTab}
                            initial={{
                                opacity: 0,
                                y: 35,
                                scale: 0.97,
                                filter: "blur(14px)"
                            }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                scale: 1,
                                filter: "blur(0px)"
                            }}
                            exit={{
                                opacity: 0,
                                y: -25,
                                scale: 0.98,
                                filter: "blur(12px)"
                            }}
                            transition={{
                                duration: 0.55,
                                ease: [0.22, 1, 0.36, 1]
                            }}
                            className="relative"
                        >

                            {/* Glow סביב התוכן */}
                            <motion.div
                                className="absolute inset-0 rounded-[30px] bg-gradient-to-r from-cyan-500/[0.03] to-pink-500/[0.03] blur-3xl"
                                animate={{
                                    opacity: [0.4, 0.7, 0.4]
                                }}
                                transition={{
                                    duration: 5,
                                    repeat: Infinity
                                }}
                            />

                            {/* תוכן הכרטיסייה */}
                            <div className="relative z-10">
                                {tabsData[activeTab]}
                            </div>
                        </motion.div>

                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};
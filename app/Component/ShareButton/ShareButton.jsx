"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Share2,
    Check,
    Link2,
    Send,
    Twitter,
    Facebook
} from "lucide-react";

// ============================================================================
// אנימציות לכפתור הראשי
// ============================================================================
const buttonVariants = {
    rest: {
        scale: 1,
        rotate: 0,
        boxShadow: "0px 0px 0px rgba(34,211,238,0)"
    },

    hover: {
        scale: 1.06,
        y: -2,
        rotate: -2,
        boxShadow:
            "0px 10px 25px rgba(34,211,238,0.18), 0px 0px 18px rgba(34,211,238,0.15)",
        transition: {
            type: "spring",
            stiffness: 450,
            damping: 16
        }
    },

    tap: {
        scale: 0.92,
        rotate: 0,
        transition: {
            type: "spring",
            stiffness: 500,
            damping: 15
        }
    },

    active: {
        scale: 1,
        rotate: 0,
        boxShadow:
            "0px 10px 30px rgba(34,211,238,0.22), 0px 0px 24px rgba(34,211,238,0.16)"
    }
};

// ============================================================================
// אנימציית התפריט הצף
// ============================================================================
const menuVariants = {
    hidden: {
        opacity: 0,
        y: 12,
        scale: 0.95,
        filter: "blur(8px)"
    },

    visible: {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        transition: {
            duration: 0.22,
            ease: "easeOut",
            staggerChildren: 0.04
        }
    },

    exit: {
        opacity: 0,
        y: 10,
        scale: 0.96,
        filter: "blur(6px)",
        transition: {
            duration: 0.16
        }
    }
};

// ============================================================================
// אנימציה לפריטי שיתוף
// ============================================================================
const itemVariants = {
    hidden: {
        opacity: 0,
        x: -10
    },

    visible: {
        opacity: 1,
        x: 0
    }
};

// ============================================================================
// קומפוננטת ShareButton
// ============================================================================
export default function ShareButton({
    title = "Check this game!",
    url = typeof window !== "undefined" ? window.location.href : ""
}) {

    const [open, setOpen] = useState(false);
    const [copied, setCopied] = useState(false);

    // ============================================================================
    // העתקת לינק
    // ============================================================================
    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(url);

            setCopied(true);

            setTimeout(() => {
                setCopied(false);
            }, 1800);
        } catch (err) {
            console.error(err);
        }
    };

    // ============================================================================
    // שיתוף לרשתות
    // ============================================================================
    const shareLinks = [
        {
            label: "Copy Link",
            icon: copied ? Check : Link2,
            action: handleCopy,
            className:
                copied
                    ? "text-green-400 border-green-500/30 bg-green-500/10"
                    : "text-cyan-300 border-cyan-500/20 bg-cyan-500/5"
        },

        {
            label: "Twitter",
            icon: Twitter,
            action: () =>
                window.open(
                    `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`,
                    "_blank"
                ),
            className:
                "text-sky-300 border-sky-500/20 bg-sky-500/5"
        },

        {
            label: "Facebook",
            icon: Facebook,
            action: () =>
                window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
                    "_blank"
                ),
            className:
                "text-blue-300 border-blue-500/20 bg-blue-500/5"
        },

        {
            label: "Share",
            icon: Send,
            action: async () => {
                if (navigator.share) {
                    await navigator.share({
                        title,
                        url
                    });
                } else {
                    handleCopy();
                }
            },
            className:
                "text-purple-300 border-purple-500/20 bg-purple-500/5"
        }
    ];

    return (
        <div className="relative z-[99999]">

            {/* ============================================================================
            כפתור ראשי
            ============================================================================ */}
            <motion.button
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                animate={open ? "active" : "rest"}
                onClick={() => setOpen(prev => !prev)}
                className="relative overflow-hidden p-4 rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-md text-white group"
            >

                {/* glow פנימי */}
                <motion.div
                    animate={{
                        opacity: open ? 1 : 0.4
                    }}
                    className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-purple-500/10"
                />

                {/* outline glow */}
                <motion.div
                    animate={{
                        opacity: open ? 1 : 0
                    }}
                    className="absolute inset-0 rounded-2xl border border-cyan-400/40 shadow-[0_0_20px_rgba(34,211,238,0.25)]"
                />

                <motion.div
                    animate={{
                        rotate: open ? 180 : 0,
                        scale: open ? 1.1 : 1
                    }}
                    transition={{
                        type: "spring",
                        stiffness: 350,
                        damping: 14
                    }}
                    className="relative z-10"
                >
                    <Share2 className="w-6 h-6 group-hover:text-cyan-300 transition-colors" />
                </motion.div>
            </motion.button>

            {/* ============================================================================
            תפריט שיתוף צף
            ============================================================================ */}
            <AnimatePresence>
                {open && (
                    <motion.div
                        variants={menuVariants}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className="absolute top-[calc(100%+14px)] right-0 z-[99999] w-56 p-2 rounded-2xl border border-cyan-500/20 bg-slate-950/95 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.65)]"                    >

                        {/* כותרת */}
                        <div
                            onClick={handleCopy}
                            className="px-3 pt-2 pb-3 border-b border-white/5 cursor-pointer select-none group/header"
                        >
                            <div className="flex items-center justify-between">

                                <h3 className="text-xs uppercase tracking-[0.25em] text-cyan-300 font-black transition-all duration-300 group-hover/header:text-cyan-200">
                                    {copied ? "Link Copied!" : "Share Game"}
                                </h3>

                                <motion.div
                                    animate={{
                                        scale: copied ? [1, 1.25, 1] : 1,
                                        rotate: copied ? [0, -10, 10, 0] : 0
                                    }}
                                    transition={{
                                        duration: 0.45
                                    }}
                                    className={`text-xs font-bold transition-colors duration-300 ${copied ? "text-green-400" : "text-cyan-500/70"
                                        }`}
                                >
                                    {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />}
                                </motion.div>
                            </div>

                            {/* הודעת hover */}
                            <motion.p
                                initial={false}
                                animate={{
                                    opacity: copied ? 1 : 0.7
                                }}
                                className={`mt-2 text-[10px] tracking-[0.18em] uppercase transition-colors duration-300 ${copied
                                    ? "text-green-400"
                                    : "text-slate-500 group-hover/header:text-cyan-400"
                                    }`}
                            >
                                {copied
                                    ? "Page link copied to clipboard"
                                    : "Click to instantly copy page link"}
                            </motion.p>
                        </div>




                        {/* כפתורי שיתוף */}
                        <div className="flex flex-col gap-2 p-2">

                            {shareLinks.map((item, index) => {
                                const Icon = item.icon;

                                return (
                                    <motion.button
                                        key={index}
                                        variants={itemVariants}
                                        onClick={item.action}
                                        className={`group/item relative overflow-hidden flex items-center gap-3 px-4 py-3 rounded-xl border transition-all duration-300 ${item.className}`}
                                    >

                                        {/* hover effect */}
                                        <div className="absolute inset-0 opacity-0 group-hover/item:opacity-100 transition-opacity bg-white/[0.03]" />

                                        <motion.div
                                            whileHover={{
                                                rotate: -8,
                                                scale: 1.12
                                            }}
                                            className="relative z-10"
                                        >
                                            <Icon className="w-4 h-4" />
                                        </motion.div>

                                        <span className="relative z-10 text-sm font-bold">
                                            {copied && item.label === "Copy Link"
                                                ? "Copied!"
                                                : item.label}
                                        </span>
                                    </motion.button>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
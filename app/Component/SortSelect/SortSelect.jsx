"use client";

import { useMemo, useState, useRef, useEffect } from "react";
import { ArrowDownUp, ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ============================================================================
// קומפוננטת SortSelect עתידנית
// ============================================================================
export default function SortSelect({
    value = "rating",
    onChange
}) {

    // ============================================================================
    // מצב פתיחה/סגירה של התפריט
    // ============================================================================
    const [open, setOpen] = useState(false);

    // ============================================================================
    // רפרנס לסגירה בלחיצה מחוץ לקומפוננטה
    // ============================================================================
    const wrapperRef = useRef(null);

    // ============================================================================
    // אפשרויות מיון
    // ============================================================================
    const options = [
        {
            value: "rating",
            label: "Top Rated",
            icon: "⭐"
        },
        {
            value: "new",
            label: "Newest",
            icon: "🚀"
        },
        {
            value: "popular",
            label: "Popular",
            icon: "🔥"
        }
    ];

    // ============================================================================
    // האפשרות שנבחרה כרגע
    // ============================================================================
    const selectedOption = useMemo(() => {
        return options.find(option => option.value === value);
    }, [value]);

    // ============================================================================
    // סגירה בלחיצה מחוץ לקומפוננטה
    // ============================================================================
    useEffect(() => {

        const handleClickOutside = (event) => {
            if (
                wrapperRef.current &&
                !wrapperRef.current.contains(event.target)
            ) {
                setOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, []);

    return (
        <div
            ref={wrapperRef}
            className="relative w-[220px] group"
        >

            {/* glow background */}
            <motion.div
                initial={{ opacity: 0 }}
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.35 }}
                className="
                    absolute
                    -inset-[1px]
                    rounded-2xl
                    bg-gradient-to-r
                    from-cyan-500/20
                    via-sky-500/10
                    to-purple-500/20
                    blur-md
                "
            />

            {/* ============================================================================
            כפתור ראשי
            ============================================================================ */}
            <motion.button
                type="button"
                whileHover={{
                    y: -2,
                    scale: 1.01
                }}
                whileTap={{
                    scale: 0.98
                }}
                transition={{
                    type: "spring",
                    stiffness: 350,
                    damping: 18
                }}
                onClick={() => setOpen(prev => !prev)}
                className="
                    relative
                    w-full
                    flex items-center gap-3
                    px-4 py-3
                    rounded-2xl
                    border border-cyan-500/15
                    bg-[#0b1220]/90
                    backdrop-blur-2xl
                    shadow-[0_10px_40px_-15px_rgba(0,0,0,0.8)]
                    overflow-hidden
                "
            >

                {/* futuristic overlay */}
                <div className="absolute inset-0 opacity-40">
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:18px_18px]" />
                </div>

                {/* animated glow line */}
                <motion.div
                    animate={{
                        x: ["-100%", "250%"]
                    }}
                    transition={{
                        repeat: Infinity,
                        duration: 4,
                        ease: "linear"
                    }}
                    className="
                        absolute
                        top-0
                        left-0
                        h-full
                        w-24
                        bg-gradient-to-r
                        from-transparent
                        via-cyan-400/10
                        to-transparent
                        skew-x-[-20deg]
                    "
                />

                {/* icon */}
                <motion.div
                    animate={{
                        rotate: open ? 180 : 0
                    }}
                    transition={{
                        duration: 0.4
                    }}
                    className="
                        relative z-10
                        flex items-center justify-center
                        w-9 h-9
                        rounded-xl
                        bg-cyan-500/10
                        border border-cyan-400/20
                    "
                >
                    <ArrowDownUp
                        size={16}
                        className="text-cyan-300"
                    />
                </motion.div>

                {/* selected text */}
                <div className="relative z-10 flex flex-col items-start flex-1">

                    <span className="text-[10px] uppercase tracking-[0.25em] text-cyan-300/70 font-bold">
                        Sort By
                    </span>

                    <div className="flex items-center gap-2">
                        <span className="text-sm">
                            {selectedOption?.icon}
                        </span>

                        <span className="text-sm font-bold text-white">
                            {selectedOption?.label}
                        </span>
                    </div>
                </div>

                {/* arrow */}
                <motion.div
                    animate={{
                        rotate: open ? 180 : 0
                    }}
                    transition={{
                        duration: 0.25
                    }}
                    className="relative z-10"
                >
                    <ChevronDown
                        size={18}
                        className="text-cyan-300/70"
                    />
                </motion.div>

                {/* corner lights */}
                <div className="absolute top-0 left-0 w-10 h-10 bg-cyan-400/10 blur-2xl rounded-full" />
                <div className="absolute bottom-0 right-0 w-10 h-10 bg-purple-400/10 blur-2xl rounded-full" />
            </motion.button>

            {/* ============================================================================
            Dropdown Menu
            ============================================================================ */}
            <AnimatePresence>

                {open && (
                    <motion.div
                        initial={{
                            opacity: 0,
                            y: 12,
                            scale: 0.96
                        }}
                        animate={{
                            opacity: 1,
                            y: 0,
                            scale: 1
                        }}
                        exit={{
                            opacity: 0,
                            y: 8,
                            scale: 0.96
                        }}
                        transition={{
                            duration: 0.18
                        }}
                        className="
                            absolute
                            top-[calc(100%+12px)]
                            left-0
                            w-full
                            z-50
                            overflow-hidden
                            rounded-2xl
                            border border-cyan-500/20
                            bg-[#0b1220]/95
                            backdrop-blur-2xl
                            shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)]
                        "
                    >

                        {/* animated background */}
                        <div className="absolute inset-0 opacity-40">
                            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(34,211,238,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(34,211,238,0.03)_1px,transparent_1px)] bg-[size:18px_18px]" />
                        </div>

                        {/* options */}
                        {options.map((option, index) => {

                            const isActive =
                                option.value === value;

                            return (
                                <motion.button
                                    key={option.value}
                                    whileHover={{
                                        x: 4
                                    }}
                                    whileTap={{
                                        scale: 0.98
                                    }}
                                    onClick={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                    className={`
                                        relative
                                        w-full
                                        flex items-center justify-between
                                        px-4 py-3
                                        transition-all duration-300

                                        ${
                                            isActive
                                                ? "bg-cyan-500/10"
                                                : "hover:bg-white/[0.03]"
                                        }

                                        ${
                                            index !== options.length - 1
                                                ? "border-b border-white/5"
                                                : ""
                                        }
                                    `}
                                >

                                    {/* active glow */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeSortGlow"
                                            className="
                                                absolute inset-0
                                                bg-cyan-500/5
                                            "
                                        />
                                    )}

                                    {/* left side */}
                                    <div className="relative z-10 flex items-center gap-3">

                                        <span className="text-sm">
                                            {option.icon}
                                        </span>

                                        <span
                                            className={`
                                                text-sm font-semibold

                                                ${
                                                    isActive
                                                        ? "text-cyan-300"
                                                        : "text-slate-300"
                                                }
                                            `}
                                        >
                                            {option.label}
                                        </span>
                                    </div>

                                    {/* check icon */}
                                    <AnimatePresence>
                                        {isActive && (
                                            <motion.div
                                                initial={{
                                                    opacity: 0,
                                                    scale: 0.6
                                                }}
                                                animate={{
                                                    opacity: 1,
                                                    scale: 1
                                                }}
                                                exit={{
                                                    opacity: 0,
                                                    scale: 0.6
                                                }}
                                                className="relative z-10"
                                            >
                                                <Check
                                                    size={16}
                                                    className="text-cyan-300"
                                                />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.button>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWishlist } from '../../hooks/useWishlist'; // ה-Hook האמיתי של השרת


// ============================================================================
// הגדרת האנימציות (Variants) עבור מערכת החלקיקים (הפיקסלים שמתפוצצים)
// ============================================================================
const particleVariants = {
    hidden: {
        opacity: 0,
        scale: 0,
        x: "-50%",
        y: "-50%"
    },
    visible: (i) => {
        // חישוב מתמטי לפיזור החלקיקים במעגל של 360 מעלות
        const angle = (i * 360) / 12; // 12 חלקיקים
        const radius = 46; // מרחק ההתפוצצות
        const rad = (angle * Math.PI) / 180;
        const x = Math.cos(rad) * radius;
        const y = Math.sin(rad) * radius;

        return {
            opacity: [0, 1, 0],
            scale: [0, 1.35, 0],
            x: `calc(-50% + ${x}px)`,
            y: `calc(-50% + ${y}px)`,
            transition: {
                duration: 0.7,
                ease: "easeOut",
            }
        };
    }
};

// ============================================================================
// קומפוננטת עזר: חלקיק פיקסל (Particle) שמייצר את אפקט ה-8-bit
// ============================================================================
const PixelParticle = ({ index }) => (
    <motion.div
        custom={index}
        variants={particleVariants}
        initial="hidden"
        animate="visible"
        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 rounded-[2px] bg-cyan-300 shadow-[0_0_8px_rgba(34,211,238,0.95)]"
        style={{ rotate: (index * 17) % 90 }}
    />
);

// ============================================================================
// הגדרת האנימציות (Variants) עבור כפתור המשושה הראשי
// ============================================================================
const buttonVariants = {
    rest: {
        scale: 1,
        y: 0,
        boxShadow: "0px 0px 0px rgba(34, 211, 238, 0)",
        borderColor: "rgba(148, 163, 184, 0.18)",
        background: "linear-gradient(180deg, rgba(15,23,42,0.95) 0%, rgba(2,6,23,0.95) 100%)",
    },
    hover: {
        scale: 1.06,
        y: -1,
        boxShadow: "0px 10px 28px rgba(34, 211, 238, 0.18), 0px 0px 22px rgba(34, 211, 238, 0.18)",
        borderColor: "rgba(34, 211, 238, 0.42)",
        background: "linear-gradient(180deg, rgba(8,47,73,0.95) 0%, rgba(2,6,23,0.98) 100%)",
        transition: { type: "spring", stiffness: 500, damping: 18 }
    },
    tap: {
        scale: 0.94,
        y: 0,
        boxShadow: "0px 0px 18px rgba(34, 211, 238, 0.22)",
        transition: { type: "spring", stiffness: 550, damping: 18 }
    },
    active: {
        scale: 1,
        y: 0,
        boxShadow: "0px 10px 30px rgba(236, 72, 153, 0.20), 0px 0px 30px rgba(34, 211, 238, 0.12)",
        borderColor: "rgba(236, 72, 153, 0.75)",
        background: "linear-gradient(180deg, rgba(88,28,135,0.95) 0%, rgba(15,23,42,0.98) 100%)",
        transition: { type: "spring", stiffness: 420, damping: 18 }
    },
    disabled: {
        scale: 1,
        y: 0,
        boxShadow: "none",
        borderColor: "rgba(148, 163, 184, 0.12)",
        background: "linear-gradient(180deg, rgba(15,23,42,0.55) 0%, rgba(2,6,23,0.55) 100%)",
        transition: { duration: 0.2 }
    }
};

// ============================================================================
// הקומפוננטה הראשית: כפתור רשימת משאלות גיימינג מטורף
// ============================================================================
export default function Wishlist({ gameId, showText = false, disabled = false }) {
    const { isInWishlist, toggleWishlist } = useWishlist();
    const isActive = isInWishlist(gameId);
    //  מנהל את הריחוף בצורה מוחלטת
    const [isHovered, setIsHovered] = useState(false);

    const labelText = useMemo(
        () => (isActive ? 'In Library' : 'Add to Wishlist'),
        [isActive]
    );

    return (
        <div className="relative inline-flex items-center justify-center">
            {/* כפתור המעטפת הראשי - משתמש ב-Framer Motion לתגובתיות של המעכבר
      */}
            <motion.button
                variants={buttonVariants}
                initial="rest"
                whileHover={disabled ? "rest" : "hover"}
                whileTap={disabled ? "rest" : "tap"}
                animate={disabled ? "disabled" : (isActive ? "active" : "rest")}
                onClick={() => {
                    if (!disabled) toggleWishlist(gameId);
                }}
                // אירועי העכבר של React במקום CSS!
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                disabled={disabled}
                aria-pressed={isActive}
                aria-label={isActive ? 'Remove from wishlist' : 'Add to wishlist'}
                className={`relative flex items-center justify-center gap-3 rounded-2xl outline-none overflow-visible cursor-pointer z-10 shrink-0 border border-white/10 px-3 ${
                    showText ? 'h-14 min-w-[180px]' : 'w-14 h-14'
                } ${disabled ? 'cursor-not-allowed opacity-55' : ''}`}
            >
                {/* רקע פנימי עדין לשכבת עומק */}
                <motion.span
                    aria-hidden="true"
                    className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/5 to-transparent"
                    initial={false}
                    animate={{ opacity: isActive ? 1 : 0.55 }}
                    transition={{ duration: 0.25 }}
                />

                {/*  חלק 1: אנימציית מערכת החלקיקים (הפיצוץ) מופעלת רק במעבר ל-Active */}
                <AnimatePresence>
                    {isActive && !disabled && (
                        <div className="absolute inset-0 pointer-events-none z-0">
                            {[...Array(12)].map((_, i) => (
                                <PixelParticle key={`pixel-${i}`} index={i} />
                            ))}
                        </div>
                    )}
                </AnimatePresence>

                {/* glow היקפי בזמן Active */}
                <motion.span
                    aria-hidden="true"
                    className="absolute inset-[-1px] rounded-2xl pointer-events-none"
                    initial={false}
                    animate={{
                        opacity: isActive ? 1 : 0,
                        background: isActive
                            ? 'linear-gradient(135deg, rgba(236,72,153,0.35), rgba(34,211,238,0.22))'
                            : 'transparent'
                    }}
                    transition={{ duration: 0.25 }}
                />

                {/*  חלק 2: ציור ה-SVG של הכוכב הטכנולוגי המיוחד */}
                <div className={`relative z-10 ${showText ? 'w-7 h-7' : 'w-8 h-8'}`}>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        {/* צללית של הכוכב - תמיד קיימת אבל משנה צבע */}
                        <motion.path
                            d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                            stroke={isActive ? "#ec4899" : "#64748b"}
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill={isActive ? "rgba(236, 72, 153, 0.18)" : "rgba(255,255,255,0.02)"}
                            animate={{
                                stroke: isActive ? "#ec4899" : "#64748b",
                                fill: isActive ? "rgba(236, 72, 153, 0.18)" : "rgba(255,255,255,0.02)",
                                filter: isActive
                                    ? "drop-shadow(0 0 8px rgba(236,72,153,0.55))"
                                    : "drop-shadow(0 0 0px rgba(236,72,153,0))"
                            }}
                            transition={{ duration: 0.28 }}
                        />

                        {/* אנימציית הציור (Draw) של קווי המתאר של הכוכב. זה קורה ממש כשלוחצים, הקו מצייר את עצמו במהירות! */}
                        <AnimatePresence>
                            {isActive && (
                                <motion.path
                                    d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
                                    stroke="#22d3ee"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    initial={{ pathLength: 0, opacity: 1, rotate: -2 }}
                                    animate={{ pathLength: 1, opacity: 0, rotate: 0 }}
                                    transition={{ duration: 0.75, ease: "easeOut" }}
                                    className="drop-shadow-[0_0_10px_rgba(34,211,238,0.95)]"
                                />
                            )}
                        </AnimatePresence>

                        {/*  חלק 3: סימן הפלוס (+) שהופך ל-וי (✓) בתוך הכוכב */}
                        <motion.g
                            initial={false}
                            animate={isActive ? "checked" : "unchecked"}
                            transition={{ duration: 0.22 }}
                        >
                            {/* קו אופקי של הפלוס (או הצד השמאלי של הוי) */}
                            <motion.path
                                d="M9 12H15"
                                stroke={isActive ? "#fff" : "#94a3b8"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                variants={{
                                    unchecked: {
                                        pathLength: 1,
                                        opacity: 1,
                                        d: "M9 12H15"
                                    },
                                    // כשהופך לוי, הקו משנה צורה ומיקום
                                    checked: {
                                        pathLength: 1,
                                        opacity: 1,
                                        d: "M9 12L11.5 14.5"
                                    }
                                }}
                            />
                            {/* קו אנכי של הפלוס (או הצד הימני הארוך של הוי) */}
                            <motion.path
                                d="M12 9V15"
                                stroke={isActive ? "#fff" : "#94a3b8"}
                                strokeWidth="2"
                                strokeLinecap="round"
                                variants={{
                                    unchecked: {
                                        pathLength: 1,
                                        opacity: 1,
                                        d: "M12 9V15"
                                    },
                                    // כשהופך לוי, הקו משנה צורה ומיקום ומתארך למעלה
                                    checked: {
                                        pathLength: 1,
                                        opacity: 1,
                                        d: "M11.5 14.5L16 9"
                                    }
                                }}
                            />
                        </motion.g>
                    </svg>
                </div>

                {showText && (
                    <div className="relative z-10 flex flex-col items-start leading-none pr-1">
                        <span className="text-[10px] uppercase tracking-[0.28em] text-slate-400">
                            Wishlist
                        </span>
                        <motion.span
                            initial={false}
                            animate={{
                                color: isActive ? '#f8fafc' : '#cbd5e1',
                                y: isHovered ? -1 : 0
                            }}
                            className="text-sm font-extrabold"
                        >
                            {isActive ? 'Saved' : 'Add'}
                        </motion.span>
                    </div>
                )}

                {/*  חלק 4: טולטיפ טקסט צף (Tooltip) שמסביר מה הפעולה */}
                <span
                    className={`absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 text-[10px] font-black tracking-[0.2em] text-cyan-300 uppercase bg-slate-950/95 backdrop-blur-md rounded-xl border border-cyan-500/25 transition-all duration-300 pointer-events-none shadow-[0_0_18px_rgba(34,211,238,0.18)] z-50 whitespace-nowrap
                    ${isHovered && !showText && !disabled ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-1'}`}
                >
                    {labelText}
                </span>
            </motion.button>
        </div >
    );
};
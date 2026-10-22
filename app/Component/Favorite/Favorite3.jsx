'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserLibrary } from '../../hooks/user/useLibrary';

// ============================================================================
// מתמטיקה ואנימציות חלקיקים (Geometric Particles)
// ============================================================================

// פונקציית עזר ליצירת חלקיקים גיאומטריים (משולשים וריבועים קטנים)
const generateGeometricParticles = (count) => {
    return Array.from({ length: count }).map((_, i) => {
        const angle = (i * 360) / count;
        const rad = (angle * Math.PI) / 180;
        // מרחק פיצוץ משתנה
        const distance = Math.random() * 40 + 25; 
        
        return {
            id: i,
            x: Math.cos(rad) * distance,
            y: Math.sin(rad) * distance,
            // חלק משולשים (shape: 1), חלק ריבועים (shape: 0)
            shape: Math.random() > 0.5 ? 1 : 0, 
            scale: Math.random() * 0.5 + 0.3,
            rotation: Math.random() * 720, // סיבוב מהיר
            // צבעים מגוונים של אנרגיה (תכלת-לבן-כחול)
            color: Math.random() > 0.4 ? '#22d3ee' : (Math.random() > 0.5 ? '#ffffff' : '#3b82f6'),
        };
    });
};

// וריאציות לאנימציית החלקיקים הגיאומטריים
const particleVariants = {
    hidden: { 
        x: '-50%', y: '-50%', 
        opacity: 1, 
        scale: 0, 
        rotate: 0 
    },
    visible: (custom) => ({
        x: `calc(-50% + ${custom.x}px)`,
        y: `calc(-50% + ${custom.y}px)`,
        opacity: [1, 1, 0], // נשאר גלוי קצת ואז נעלם
        scale: [0, custom.scale, 0], // גדל ואז קטן
        rotate: custom.rotation,
        transition: { 
            duration: 0.8, 
            ease: [0.22, 1, 0.36, 1], // Ease-out מהיר
            delay: Math.random() * 0.1 // דיליי אקראי קטן
        }
    })
};

// ============================================================================
// קומפוננטת עזר: ציור הקריסטל ב-SVG
// ============================================================================
const CrystalIcon = ({ active, ...props }) => {
    return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
            {/* הטבעת החיצונית המסתובבת (רק כשהוא פעיל) */}
            <AnimatePresence>
                {active && (
                    <motion.path
                        d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2ZM12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4Z"
                        stroke="#22d3ee"
                        strokeWidth="0.5"
                        strokeDasharray="4 4" // קו מקווקו
                        initial={{ rotate: 0, opacity: 0 }}
                        animate={{ rotate: 360, opacity: 0.5 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                    />
                )}
            </AnimatePresence>

            {/* גוף הקריסטל הראשי */}
            <motion.path
                d="M12 2L16.5 6.5L19 12L16.5 17.5L12 22L7.5 17.5L5 12L7.5 6.5L12 2Z"
                stroke={active ? "#22d3ee" : "rgba(255, 255, 255, 0.3)"}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                // אפקט מילוי פנימי (תלת-ממד) כשהוא פעיל
                fill={active ? "url(#crystalGradient)" : "transparent"}
                animate={{
                    stroke: active ? "#22d3ee" : "rgba(255, 255, 255, 0.3)",
                    fill: active ? "url(#crystalGradient)" : "transparent",
                    filter: active ? "drop-shadow(0 0 5px #22d3ee)" : "drop-shadow(0 0 0px transparent)"
                }}
                transition={{ duration: 0.3 }}
            />

            {/* קווי עומק פנימיים */}
            <motion.path
                d="M12 2V22M12 2L19 12L12 22M12 2L5 12L12 22M5 12H19"
                stroke={active ? "#a5f3fc" : "rgba(255, 255, 255, 0.15)"}
                strokeWidth="0.75"
                strokeLinecap="round"
                strokeLinejoin="round"
                animate={{
                    stroke: active ? "#a5f3fc" : "rgba(255, 255, 255, 0.15)",
                }}
                transition={{ duration: 0.3 }}
            />
            
            {/* הגדרת הגרדיאנט למילוי הקריסטל */}
            <defs>
                <linearGradient id="crystalGradient" x1="12" y1="2" x2="12" y2="22" gradientUnits="userSpaceOnValid">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.8" />
                    <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                    <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0.8" />
                </linearGradient>
            </defs>
        </svg>
    );
};

// ============================================================================
// הקומפוננטה הראשית: Favorite Crystal Power-Up
// ============================================================================
export default function Favorite({ id }) {
    const { isFavorite, updateGame } = useUserLibrary();
    const favorite = isFavorite(id);
    
    // סטייט לניהול אפקט הטעינה והפיצוץ
    const [isCharging, setIsCharging] = useState(false);
    const [isExploding, setIsExploding] = useState(false);
    
    // ייצור חלקיקים גיאומטריים פעם אחת (כדי למנוע ריצוד)
    const geoParticles = useMemo(() => generateGeometricParticles(16), []);

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // מונע ניווט בכרטיסייה

        const willBeFavorite = !favorite;
        
        // --- לוגיקה לאנימציית טעינה ופיצוץ ---
        if (willBeFavorite) {
            // 1. שלב א': טעינת אנרגיה (קריסה פנימה) - 200ms
            setIsCharging(true);
            
            setTimeout(() => {
                setIsCharging(false);
                // 2. שלב ב': פיצוץ אנרגיה החוצה - 800ms
                setIsExploding(true);
                setTimeout(() => setIsExploding(false), 800);
            }, 200);
        }

        // קריאה ל-Hook לעדכון ה-DB
        updateGame({ gameId: id, isFavorite: willBeFavorite });
    };

    return (
        <motion.button
            onClick={handleClick}
            className="absolute top-3 right-3 flex items-center justify-center w-11 h-11 rounded-full group/crystal z-30 outline-none overflow-visible"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            title={favorite ? 'Remove from favorites' : 'Add to favorites'}
        >
            {/* רקע הכפתור גיאומטרי (מעוין) - Glassmorphism */}
            <motion.div
                className="absolute inset-0 bg-slate-950/60 backdrop-blur-md border border-white/10 rotate-45"
                animate={{
                    borderColor: favorite ? 'rgba(34, 211, 238, 0.4)' : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: favorite 
                        ? '0 0 25px rgba(34, 211, 238, 0.3), inset 0 0 10px rgba(34, 211, 238, 0.1)' 
                        : '0 0 0px rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.3 }}
            />

            {/* --- אפקט פיצוץ חלקיקים גיאומטריים --- */}
            <AnimatePresence>
                {isExploding && geoParticles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        custom={particle}
                        variants={particleVariants}
                        initial="hidden"
                        animate="visible"
                        className="absolute top-1/2 left-1/2 pointer-events-none z-0"
                        style={{ x: '-50%', y: '-50%' }}
                    >
                        {particle.shape === 1 ? (
                            // משולש
                            <div 
                                className="w-0 h-0"
                                style={{
                                    borderLeft: `${2 * particle.scale}px solid transparent`,
                                    borderRight: `${2 * particle.scale}px solid transparent`,
                                    borderBottom: `${4 * particle.scale}px solid ${particle.color}`,
                                    filter: `drop-shadow(0 0 3px ${particle.color})`
                                }}
                            />
                        ) : (
                            // ריבוע
                            <div 
                                className="rounded-sm"
                                style={{
                                    width: `${3 * particle.scale}px`,
                                    height: `${3 * particle.scale}px`,
                                    backgroundColor: particle.color,
                                    filter: `drop-shadow(0 0 3px ${particle.color})`
                                }}
                            />
                        )}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* --- גל הדף גיאומטרי (מעוין) --- */}
            <AnimatePresence>
                {isExploding && (
                    <motion.div
                        className="absolute inset-0 border-2 border-cyan-400 rotate-45 pointer-events-none"
                        initial={{ opacity: 0.8, scale: 0.8 }}
                        animate={{ opacity: 0, scale: 2.2 }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} // Fast-out
                    />
                )}
            </AnimatePresence>

            {/* --- אייקון הקריסטל הראשי --- */}
            <motion.div
                className="relative z-10 flex items-center justify-center w-6 h-6"
                animate={{
                    // 1. אנימציית טעינה (קריסה)
                    scale: isCharging ? 0.7 : 1,
                    // 2. אנימציית קפיצה/פעימה (כשזה מופעל)
                    y: favorite && !isExploding ? [0, -4, 0] : 0,
                }}
                transition={{ 
                    scale: { duration: 0.2, ease: "easeIn" },
                    y: { 
                        duration: 1.5, 
                        repeat: Infinity, 
                        repeatType: "mirror", 
                        ease: "easeInOut",
                        delay: 0.5
                    }
                }}
            >
                <CrystalIcon 
                    active={favorite} 
                    className="w-full h-full"
                />
            </motion.div>
        </motion.button>
    );
}



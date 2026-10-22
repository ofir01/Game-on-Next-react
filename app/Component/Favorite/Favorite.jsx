'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { useUserLibrary } from '../../hooks/user/useLibrary';

// ============================================================================
// לוגיקת חלקיקי סייבר (Binary & Glitch Particles)
// ============================================================================
const CHARS = ['0', '1', '+', '×', '⚡'];

const generateCyberParticles = (count) => {
    return Array.from({ length: count }).map((_, i) => {
        const angle = (i * 360) / count + (Math.random() * 20 - 10);
        const rad = (angle * Math.PI) / 180;
        const distance = Math.random() * 45 + 20; 
        
        return {
            id: i,
            x: Math.cos(rad) * distance,
            y: Math.sin(rad) * distance,
            char: CHARS[Math.floor(Math.random() * CHARS.length)],
            scale: Math.random() * 0.5 + 0.4,
            rotation: Math.random() * 360,
            color: Math.random() > 0.6 ? '#ec4899' : (Math.random() > 0.5 ? '#22d3ee' : '#eab308'),
            delay: Math.random() * 0.15
        };
    });
};

const cyberParticleVariants = {
    hidden: { x: '-50%', y: '-50%', opacity: 0, scale: 0, rotate: 0 },
    visible: (custom) => ({
        x: `calc(-50% + ${custom.x}px)`,
        y: `calc(-50% + ${custom.y}px)`,
        opacity: [0, 1, 1, 0],
        scale: [0, custom.scale * 1.5, custom.scale, 0],
        rotate: custom.rotation + 180,
        transition: { 
            duration: 0.8, 
            ease: "easeOut",
            delay: custom.delay,
            times: [0, 0.2, 0.8, 1]
        }
    })
};

// ============================================================================
// טבעות HUD
// ============================================================================
const HUDRings = ({ active }) => (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.svg viewBox="0 0 100 100" className="absolute w-[160%] h-[160%] opacity-40">
            <motion.circle
                cx="50" cy="50" r="45"
                fill="none"
                stroke={active ? "#ec4899" : "transparent"} 
                strokeWidth="1.5"
                strokeDasharray="4 8 2 12"
                animate={{ rotate: active ? -360 : 0 }}
                transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            />
        </motion.svg>
        
        <motion.svg viewBox="0 0 100 100" className="absolute w-[120%] h-[120%] opacity-60">
            <motion.circle
                cx="50" cy="50" r="48"
                fill="none"
                stroke={active ? "#22d3ee" : "transparent"} 
                strokeWidth="2"
                strokeDasharray="20 10 5 10"
                animate={{ rotate: active ? 360 : 0 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            />
        </motion.svg>
    </div>
);

// ============================================================================
// סמל הלב המעודכן - עם דגש על שחור חזק יותר במצב לא פעיל
// ============================================================================
const CyberHeartIcon = ({ active }) => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full overflow-visible">
        <defs>
            <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={active ? "2.5" : "0"} result="coloredBlur"/>
                <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                </feMerge>
            </filter>
            <linearGradient id="cyberGradient" x1="0" y1="0" x2="24" y2="24">
                <stop offset="0%" stopColor="#ec4899" />
                <stop offset="50%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#22d3ee" />
            </linearGradient>
        </defs>

        <motion.path
            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
            // שחור חזק יותר בקו המתאר
            stroke={active ? "url(#cyberGradient)" : "rgba(0,0,0,0.85)"}
            strokeWidth="1.8"
            // מילוי שחור כהה יותר (0.6 במקום 0.3)
            fill={active ? "url(#cyberGradient)" : "rgba(0,0,0,0.6)"} 
            style={{ filter: active ? "url(#neonGlow)" : "drop-shadow(0 2px 2px rgba(0,0,0,0.5))" }}
            strokeDasharray={active ? "none" : "60"}
            strokeDashoffset={active ? 0 : 60}
            animate={{
                strokeDashoffset: active ? 0 : [0, 60],
                fillOpacity: active ? 0.9 : 0.7,
            }}
            transition={{ duration: 0.4, ease: "easeOut" }}
        />
    </svg>
);

// ============================================================================
// הקומפוננטה הראשית
// ============================================================================
export default function Favorite({ id }) {
    const { isFavorite, updateGame } = useUserLibrary();
    const favorite = isFavorite(id);
    
    const [isExploding, setIsExploding] = useState(false);
    const [showXP, setShowXP] = useState(false);
    const cyberParticles = useMemo(() => generateCyberParticles(15), []);
    const controls = useAnimation();

    const handleClick = async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const willBeFavorite = !favorite;
        
        if (willBeFavorite) {
            await controls.start({
                x: [-2, 2, -1, 1, 0],
                y: [1, -1, 1, -1, 0],
                transition: { duration: 0.2 }
            });

            setIsExploding(true);
            setShowXP(true);
            
            setTimeout(() => setIsExploding(false), 1000);
            setTimeout(() => setShowXP(false), 1500);
        }

        updateGame({ gameId: id, isFavorite: willBeFavorite });
    };

    return (
        <motion.button
            onClick={handleClick}
            className="absolute top-3 right-3 flex items-center justify-center w-9 h-9 rounded-full group/cyber z-30 outline-none overflow-visible cursor-pointer"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            {favorite && (
                <div className="absolute inset-0 rounded-full bg-slate-900/40 backdrop-blur-sm shadow-[0_0_15px_rgba(236,72,153,0.3)] transition-all duration-300" />
            )}

            <HUDRings active={favorite} />

            <motion.div 
                animate={controls}
                className="relative z-10 flex items-center justify-center w-5 h-5"
            >
                <CyberHeartIcon active={favorite} />
            </motion.div>

            {/* --- גלי הדף --- */}
            <AnimatePresence>
                {isExploding && (
                    <>
                        <motion.div
                            className="absolute inset-0 rounded-full border-2 border-pink-500 pointer-events-none"
                            initial={{ opacity: 1, scale: 1 }}
                            animate={{ opacity: 0, scale: 2 }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                        />
                        <motion.div
                            className="absolute inset-0 rounded-full border border-cyan-400 pointer-events-none"
                            initial={{ opacity: 0.8, scale: 1 }}
                            animate={{ opacity: 0, scale: 2.5 }}
                            transition={{ duration: 0.7, ease: "easeOut", delay: 0.1 }}
                        />
                    </>
                )}
            </AnimatePresence>

            {/* --- חלקיקים --- */}
            <AnimatePresence>
                {isExploding && cyberParticles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        custom={particle}
                        variants={cyberParticleVariants}
                        initial="hidden"
                        animate="visible"
                        className="absolute top-1/2 left-1/2 pointer-events-none z-0 font-mono font-bold text-xs"
                        style={{ color: particle.color, textShadow: `0 0 5px ${particle.color}` }}
                    >
                        {particle.char}
                    </motion.div>
                ))}
            </AnimatePresence>

            {/* --- טקסט חוויה (XP) --- */}
            <AnimatePresence>
                {showXP && (
                    <motion.div
                        initial={{ opacity: 0, y: 0, scale: 0.5 }}
                        animate={{ 
                            opacity: [0, 1, 1, 0], 
                            y: -35, 
                            scale: [0.5, 1.1, 1, 1] 
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        className="absolute -top-2 whitespace-nowrap pointer-events-none z-50"
                    >
                        
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.button>
    );
}
"use client";
import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../Context/AuthContext';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import {
    X, Gamepad2, Sparkles, Trophy, Users, Heart, MessageCircle, Rocket
} from 'lucide-react';

export default function ProtectedAction({
    onClick,
    children,
    className,
    title = "Join the Party!",
    ...props
}) {
    const router = useRouter();
    const { user } = useAuth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    // סטייט עבור אפקט התלת-ממד עם העכבר
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const modalRef = useRef(null);

    // מניעת גלילה
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; }
    }, [isModalOpen]);

    const handleAction = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            setIsModalOpen(true);
        } else {
            if (onClick) onClick(e);
        }
    };

    // חישוב המיקום של העכבר ליצירת אפקט ה-Tilt
    const handleMouseMove = (e) => {
        if (!modalRef.current) return;
        const rect = modalRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        setMousePos({ x, y });
    };

    const handleMouseLeave = () => {
        // החזרה חלקה לאמצע כשהעכבר יוצא
        setMousePos({ x: 0, y: 0 });
    };

    // רשימת היתרונות שיוצגו באנימציה מדורגת (Staggered)
    const perks = [
        { icon: MessageCircle, text: "Chat with the community", color: "text-blue-400", bg: "bg-blue-400/10" },
        { icon: Trophy, text: "Earn XP & level up", color: "text-yellow-400", bg: "bg-yellow-400/10" },
        { icon: Heart, text: "Save your favorite games", color: "text-pink-400", bg: "bg-pink-400/10" }
    ];

    // יצירת חלקיקים אקראיים לרקע פעם אחת
    const [particles] = useState(() =>
        Array.from({ length: 20 }).map((_, i) => ({
            id: i,
            size: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            duration: Math.random() * 3 + 2,
            delay: Math.random() * 2,
        }))
    );

    return (
        <>
            <button {...props} onClick={handleAction} className={className}>
                {children}
            </button>

            <AnimatePresence>
                {isModalOpen && (
                    <div
                        className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6"
                        style={{ perspective: '1200px' }} // חובה בשביל ה-3D
                    >
                        {/* רקע שקוף למחצה בסגנון זכוכית */}
                        <motion.div
                            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-900/60"
                        />

                        {/* הקונטיינר הראשי של המודאל שזז עם העכבר */}
                        <motion.div
                            ref={modalRef}
                            onMouseMove={handleMouseMove}
                            onMouseLeave={handleMouseLeave}
                            initial={{ scale: 0.8, opacity: 0, rotateX: 20 }}
                            animate={{
                                scale: 1,
                                opacity: 1,
                                rotateX: mousePos.y * -15,
                                rotateY: mousePos.x * 15
                            }}
                            exit={{ scale: 0.8, opacity: 0, rotateX: -20 }}
                            transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 20,
                                // כשהעכבר זז, נרצה תגובה מהירה יותר, אחרת קפיצית
                                rotateX: { type: "tween", ease: "easeOut", duration: 0.3 },
                                rotateY: { type: "tween", ease: "easeOut", duration: 0.3 }
                            }}
                            className="relative w-full max-w-xl bg-slate-800/90 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] shadow-[0_20px_70px_-10px_rgba(168,85,247,0.4)] overflow-hidden"
                        >
                            {/* אפקט הילה פנימי (Glow) עוקב עכבר */}
                            <motion.div
                                className="pointer-events-none absolute -inset-px rounded-[2.5rem] opacity-50 transition-opacity duration-300"
                                animate={{
                                    background: `radial-gradient(600px circle at ${mousePos.x * 500 + 300}px ${mousePos.y * 500 + 300}px, rgba(236,72,153,0.15), transparent 40%)`
                                }}
                            />

                            {/* חלקיקים מרחפים ברקע */}
                            {particles.map(p => (
                                <motion.div
                                    key={p.id}
                                    className="absolute rounded-full bg-white/20 pointer-events-none"
                                    style={{ width: p.size, height: p.size, left: p.left, top: p.top }}
                                    animate={{
                                        y: [0, -30, 0],
                                        opacity: [0.2, 0.8, 0.2]
                                    }}
                                    transition={{
                                        duration: p.duration,
                                        repeat: Infinity,
                                        delay: p.delay,
                                        ease: "easeInOut"
                                    }}
                                />
                            ))}

                            {/* כפתור סגירה */}
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setIsModalOpen(false);
                                }}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-all z-50 cursor-pointer group"
                            >
                                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
                            </button>

                            <div className="p-8 sm:p-12 relative z-20">

                                {/* Header - קבוצת שחקנים ואייקון מרכזי */}
                                <div className="flex flex-col items-center mb-8">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", delay: 0.2, bounce: 0.5 }}
                                        className="relative w-24 h-24 bg-gradient-to-br from-fuchsia-500 to-cyan-500 rounded-3xl p-[2px] shadow-2xl mb-6 shadow-fuchsia-500/30 rotate-3 hover:rotate-6 transition-transform cursor-default"
                                    >
                                        <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center relative overflow-hidden">
                                            <div className="absolute inset-0 bg-gradient-to-t from-fuchsia-500/20 to-transparent" />
                                            <Gamepad2 className="w-12 h-12 text-white" />
                                        </div>
                                        {/* תג קטן שקופץ */}
                                        <motion.div
                                            initial={{ scale: 0, y: 10 }}
                                            animate={{ scale: 1, y: 0 }}
                                            transition={{ delay: 0.6, type: "spring" }}
                                            className="absolute -bottom-3 -right-3 bg-cyan-400 text-slate-900 text-xs font-black px-3 py-1 rounded-full shadow-lg flex items-center gap-1"
                                        >
                                            <Sparkles className="w-3 h-3" />
                                            FUN
                                        </motion.div>
                                    </motion.div>

                                    <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-100 to-white text-center mb-3">
                                        {title}
                                    </h2>
                                    <p className="text-slate-400 text-center text-sm sm:text-base max-w-[280px]">
                                        Create an account to interact, play, and level up with thousands of other gamers.
                                    </p>
                                </div>



                                {/* רשימת היתרונות (Staggered Animation) */}
                                <div className="space-y-3 mb-10">
                                    {perks.map((perk, index) => {
                                        const Icon = perk.icon;
                                        return (
                                            <motion.div
                                                key={index}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.5 + (index * 0.15) }}
                                                className="flex items-center gap-4 bg-white/[0.03] hover:bg-white/[0.06] transition-colors p-3 rounded-xl border border-white/5"
                                            >
                                                <div className={`p-2 rounded-lg ${perk.bg}`}>
                                                    <Icon className={`w-5 h-5 ${perk.color}`} />
                                                </div>
                                                <span className="text-slate-200 font-medium">{perk.text}</span>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* כפתורי פעולה */}
                                {/* כפתור פעולה יחיד ומרכזי */}
                                <div className="flex flex-col items-center gap-4 w-full">
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => router.push('/Login')}
                                        className="w-full sm:w-4/5 bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white font-black text-lg py-5 px-6 rounded-2xl shadow-[0_0_40px_-10px_rgba(217,70,239,0.6)] relative overflow-hidden group flex items-center justify-center gap-3"
                                    >
                                        {/* אפקט ברק שעובר על הכפתור */}
                                        <motion.div
                                            animate={{ x: ['-100%', '200%'] }}
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1.5 }}
                                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                                        />

                                        {/* אפקט מעבר צבע בהובר */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 ease-in-out" />

                                        <Rocket className="w-6 h-6 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform relative z-10" />
                                        <span className="relative z-10 tracking-wide uppercase">Join / Log In</span>
                                    </motion.button>

                                    {/* טקסט הרגעה קטן */}
                                    <div className="flex items-center gap-2 text-xs text-slate-500">
                                        <Sparkles className="w-3 h-3 text-cyan-500" />
                                        Takes less than 30 seconds
                                    </div>
                                </div>

                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
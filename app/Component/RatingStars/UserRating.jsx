'use client'; // חובה ב-Next.js כשמשתמשים ב-Hooks

import { useState } from "react";
import { Star, Loader2 } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useUserRating } from '../../hooks/user/useUserRating';
import { useParams } from 'next/navigation';

export default function UserRating() {
    // 1. שליפת מידע והתחברות ל-Hooks
    const { user } = useAuth();
    const { Slug } = useParams();
    const [hoveredStar, setHoveredStar] = useState(0);

    const { userRating, rateGame, isPending, isLoading } = useUserRating(Slug);
    const currentUserRating = userRating?.userRating || 0;

    // 2. פונקציית שליחה - מגינה מפני לחיצות כפולות או חוסר הרשאה
    const handleRate = (rating) => {
        if (!user || isPending) return;
        rateGame(rating);
    };

    // 3. מצב טעינה (Skeleton) מינימליסטי
    if (isLoading) {
        return (
            <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#070b14]/95 p-6 shadow-[0_25px_90px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
                {/* זוהר עתידני */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(59,130,246,0.18),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(236,72,153,0.15),transparent_28%)]" />

                {/* קווי GRID עתידניים */}
                <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:40px_40px]" />

                <div className="relative flex justify-between items-center gap-6 animate-pulse">
                    <div className="space-y-3">
                        <div className="h-5 w-40 rounded-full bg-white/10" />
                        <div className="h-4 w-64 rounded-full bg-white/5" />
                    </div>

                    <div className="flex gap-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div
                                key={i}
                                className="w-12 h-12 rounded-2xl border border-white/10 bg-white/5"
                            />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // 4. התצוגה הראשית
    return (
        // עיצוב שמיועד לשבת מתחת ללוח הדירוגים. הסרתי border היקפי כבד ושמתי רק עליון/תחתון
        <div className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#070b14]/95 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-8 shadow-[0_30px_120px_rgba(0,0,0,0.65)] backdrop-blur-2xl group">

            {/* רקע זוהר עתידני */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute -top-32 -left-32 w-72 h-72 rounded-full bg-sky-500/15 blur-3xl animate-pulse" />
                <div className="absolute -bottom-32 -right-32 w-72 h-72 rounded-full bg-pink-500/15 blur-3xl animate-pulse" />

                {/* GRID */}
                <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] bg-[size:40px_40px]" />

                {/* קווי אור */}
                <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-sky-400/60 to-transparent" />
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-pink-400/60 to-transparent" />
            </div>

            {/* אפקט ויזואלי ברקע בזמן שליחת הנתונים */}
            {isPending && (
                <div className="absolute inset-0 bg-sky-400/5 animate-pulse pointer-events-none" />
            )}

            {/* אזור טקסט מסביר */}
            <div className="relative z-10 text-center sm:text-left max-w-lg">

                {/* תג קטנה */}
                <div className="inline-flex items-center gap-2 rounded-full border border-sky-400/20 bg-sky-400/5 px-4 py-1.5 text-[11px] font-semibold tracking-[0.25em] uppercase text-sky-200 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                    Quantum Rating System
                </div>

                <h4 className="mt-4 text-3xl sm:text-4xl font-black tracking-tight text-white flex items-center justify-center sm:justify-start gap-3">
                    <span className="bg-gradient-to-r from-sky-300 via-white to-pink-300 bg-clip-text text-transparent">
                        {user ? "Your Rating" : "Login to Rate"}
                    </span>

                    {isPending && (
                        <Loader2 className="w-5 h-5 animate-spin text-sky-300" />
                    )}
                </h4>

                <p className="mt-3 text-sm leading-7 text-slate-300/80">
                    {!user
                        ? "Join the community to leave a rating and comment."
                        : currentUserRating > 0
                            ? `You rated this game ${currentUserRating} stars. Change it below.`
                            : "How would you rate your experience?"}
                </p>
            </div>

            {/* אזור הכוכבים האינטראקטיביים */}
            <div className="relative z-10 rounded-[28px] border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_15px_50px_rgba(0,0,0,0.4)]">

                {/* Glow פנימי */}
                <div className="absolute inset-0 rounded-[28px] bg-gradient-to-r from-sky-500/5 via-transparent to-pink-500/5 pointer-events-none" />

                <div className="relative flex gap-3">
                    {[1, 2, 3, 4, 5].map((star) => {
                        // חישוב האם הכוכב צריך להיות מואר
                        const isActive = star <= (hoveredStar || currentUserRating);

                        return (
                            <button
                                key={`star-${star}`}
                                type="button"
                                onClick={() => handleRate(star)}
                                onMouseEnter={() => setHoveredStar(star)}
                                onMouseLeave={() => setHoveredStar(0)}
                                disabled={!user || isPending}
                                className={`
                                    group/star relative overflow-hidden rounded-2xl p-2.5 transition-all duration-300
                                    ${!isPending && user && 'hover:scale-110 hover:-translate-y-1 active:scale-95'}
                                    ${isPending ? 'cursor-wait opacity-80' : 'cursor-pointer'}
                                    ${!user && 'opacity-40 cursor-not-allowed grayscale'}
                                `}
                            >

                                {/* רקע hover */}
                                <div
                                    className={`
                                        absolute inset-0 rounded-2xl transition-all duration-300
                                        ${isActive
                                            ? 'bg-gradient-to-br from-sky-400/15 to-pink-400/15 shadow-[0_0_30px_rgba(59,130,246,0.25)]'
                                            : 'bg-white/[0.02] group-hover/star:bg-white/[0.05]'
                                        }
                                    `}
                                />

                                {/* מסגרת זוהרת */}
                                <div
                                    className={`
                                        absolute inset-0 rounded-2xl border transition-all duration-300
                                        ${isActive
                                            ? 'border-sky-300/40'
                                            : 'border-white/5 group-hover/star:border-white/10'
                                        }
                                    `}
                                />

                                <Star
                                    className={`
                                        relative z-10 w-9 h-9 transition-all duration-300
                                        ${isActive
                                            ? 'fill-yellow-300 text-yellow-300 drop-shadow-[0_0_18px_rgba(250,204,21,0.8)]'
                                            : 'fill-transparent text-slate-500 group-hover/star:text-slate-300'
                                        }
                                        ${isPending && isActive
                                            ? 'animate-pulse text-sky-300 fill-sky-300'
                                            : ''
                                        }
                                    `}
                                />

                                {/* Glow פנימי */}
                                {isActive && (
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-400/5 to-pink-400/5 blur-md" />
                                )}

                                {/* אפקט "פינג" עדין כשלוחצים וזה נטען */}
                                {isPending && isActive && star === hoveredStar && (
                                    <span className="absolute inset-0 rounded-2xl border border-sky-400/40 animate-ping" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}




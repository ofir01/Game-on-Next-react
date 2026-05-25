import React from 'react';
import { Star } from 'lucide-react';
import AverageStars from '../../Component/AverageStars/AverageStars';
import GameRating from './UserRating';

export default function RatingSummary({ stats, selectedRating, onRatingSelect, totalComments }) {

    // חישוב סך כל התגובות מתוך הסטטיסטיקות כדי שהאחוזים יהיו מדויקים תמיד
    const totalAll = Object.values(stats).reduce((a, b) => a + b, 0);

    return (
        <div className="relative mb-12 overflow-hidden rounded-[38px] border border-white/10 bg-[#060b14]/95 shadow-[0_40px_140px_rgba(0,0,0,0.75)] backdrop-blur-2xl">

            {/* רקע עתידני */}
            <div className="absolute inset-0 pointer-events-none">

                {/* Glow כחול */}
                <div className="absolute -top-40 -left-32 h-[420px] w-[420px] rounded-full bg-sky-500/15 blur-3xl animate-pulse" />

                {/* Glow ורוד */}
                <div className="absolute -bottom-40 -right-32 h-[420px] w-[420px] rounded-full bg-pink-500/15 blur-3xl animate-pulse" />

                {/* Grid עתידני */}
                <div className="absolute inset-0 opacity-[0.05] bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:42px_42px]" />

                {/* קווי אור */}
                <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-sky-400/70 to-transparent" />
                <div className="absolute bottom-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-pink-400/70 to-transparent" />

                {/* אור זז */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 -left-1/2 h-full w-1/2 rotate-12 bg-gradient-to-r from-transparent via-white/[0.03] to-transparent animate-[shine_8s_linear_infinite]" />
                </div>
            </div>

            {/* חלק עליון: סטטיסטיקות */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 p-8">

                {/* ממוצע כוכבים (צד שמאל) */}
                <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.03] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl">

                    {/* Glow פנימי */}
                    <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-pink-500/5 pointer-events-none" />

                    {/* קו זוהר */}
                    <div className="absolute top-0 left-0 h-[2px] w-full bg-gradient-to-r from-transparent via-sky-400/50 to-transparent" />

                    <div className="relative z-10">
                        <AverageStars />
                    </div>
                </div>

                {/* פירוט כוכבים וברים (מרכז וימין) */}
                <div className="md:col-span-2 flex flex-col justify-center gap-4">

                    {[5, 4, 3, 2, 1].map((star) => {

                        const count = stats[star] || 0;
                        const percentage = totalAll > 0 ? (count / totalAll) * 100 : 0;
                        const isActive = selectedRating === star;

                        return (
                            <button
                                key={star}
                                onClick={() => onRatingSelect(isActive ? null : star)}
                                className={`
                                    group relative overflow-hidden rounded-2xl border transition-all duration-500
                                    ${isActive
                                        ? 'border-sky-400/30 bg-sky-400/10 shadow-[0_0_40px_rgba(56,189,248,0.12)] scale-[1.02]'
                                        : 'border-white/5 bg-white/[0.025] hover:border-white/10 hover:bg-white/[0.05]'
                                    }
                                `}
                            >

                                {/* Glow פנימי */}
                                <div
                                    className={`
                                        absolute inset-0 opacity-0 transition-opacity duration-500
                                        ${isActive
                                            ? 'opacity-100 bg-gradient-to-r from-sky-500/10 via-transparent to-pink-500/10'
                                            : 'group-hover:opacity-100 bg-gradient-to-r from-white/[0.02] to-transparent'
                                        }
                                    `}
                                />

                                {/* פס אור זז */}
                                <div className="absolute inset-0 overflow-hidden">
                                    <div className="absolute top-0 -left-1/2 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent opacity-0 group-hover:opacity-100 group-hover:animate-[shine_2.5s_linear_infinite]" />
                                </div>

                                <div className="relative z-10 flex items-center gap-4 p-4">

                                    {/* מספר כוכב */}
                                    <span
                                        className={`
                                            flex w-14 items-center gap-2 text-sm font-black tracking-wide transition-all duration-300
                                            ${isActive
                                                ? 'text-sky-300 drop-shadow-[0_0_12px_rgba(56,189,248,0.5)]'
                                                : 'text-slate-400 group-hover:text-white'
                                            }
                                        `}
                                    >
                                        {star}

                                        <Star
                                            size={16}
                                            className={`
                                                transition-all duration-300
                                                ${isActive
                                                    ? 'fill-yellow-300 text-yellow-300 drop-shadow-[0_0_14px_rgba(250,204,21,0.8)]'
                                                    : 'text-slate-600 group-hover:text-slate-300'
                                                }
                                            `}
                                        />
                                    </span>

                                    {/* בר "מלאי" עם אנימציה הדרגתית */}
                                    <div className="relative h-3 flex-1 overflow-hidden rounded-full border border-white/10 bg-[#020817] shadow-inner">

                                        {/* רקע זוהר */}
                                        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.02),transparent)]" />

                                        {/* Progress */}
                                        <div
                                            className={`
                                                absolute inset-y-0 left-0 rounded-full transition-all duration-[1600ms] ease-out
                                                ${isActive
                                                    ? 'bg-gradient-to-r from-sky-500 via-cyan-400 to-pink-400 shadow-[0_0_25px_rgba(56,189,248,0.6)]'
                                                    : 'bg-gradient-to-r from-yellow-500/80 to-orange-400/80'
                                                }
                                            `}
                                            style={{ width: `${percentage}%` }}
                                        >

                                            {/* אור נע בתוך הבר */}
                                            <div className="absolute inset-0 overflow-hidden rounded-full">
                                                <div className="absolute top-0 -left-1/2 h-full w-1/3 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-[shine_3s_linear_infinite]" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* כמות תגובות */}
                                    <span
                                        className={`
                                            w-10 text-right text-sm font-bold transition-all duration-300
                                            ${isActive
                                                ? 'text-pink-200 drop-shadow-[0_0_12px_rgba(236,72,153,0.45)]'
                                                : 'text-slate-500 group-hover:text-slate-300'
                                            }
                                        `}
                                    >
                                        {count}
                                    </span>
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* חלק תחתון: אזור הדירוג האישי */}
            <div className="relative border-t border-white/5 bg-black/10 backdrop-blur-xl">

                {/* Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-sky-500/[0.03] via-transparent to-pink-500/[0.03]" />

                <div className="relative z-10">
                    <GameRating />
                </div>
            </div>
        </div>
    );
}
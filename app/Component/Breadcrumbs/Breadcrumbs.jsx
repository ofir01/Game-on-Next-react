"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumbs = () => {
    const pathname = usePathname();

    // 1. מפענחים את ה-URL כדי לקרוא עברית בצורה נקייה
    const decodedPathname = decodeURIComponent(pathname);

    // 2. מפרקים את הנתיב המלא למערך (כדי לשמור על מבנה הקישורים התקין)
    const allSegments = decodedPathname.split('/').filter((item) => item !== '');

    // 3. בונים את הנתונים לכל שלב, ומסננים החוצה רק את מה שנקרא 'games'
    const breadcrumbs = allSegments
        .map((segment, index) => {
            // בניית הנתיב האמיתי והמצטבר (למשל: /games/resident-evil)
            const href = `/${allSegments.slice(0, index + 1).join('/')}`;

            // הפיכת הטקסט מ-slug למילים (החלפת מקפים ברווחים)
            const label = segment
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l) => l.toUpperCase());

            return { segment, href, label };
        })
        // כאן מתבצע הדילוג על 'games' - הוא לא יופיע בטקסט, אך הקישורים שאחריו ישמרו על הנתיב המלא
        .filter((crumb) => crumb.segment !== 'games');

    return (
        <>
            {/* הוספת אנימציות מותאמות אישית */}
            <style>{`
                @keyframes breadcrumbSlideIn {
                    from {
                        opacity: 0;
                        transform: translateX(-18px) scale(0.96);
                        filter: blur(6px);
                    }
                    to {
                        opacity: 1;
                        transform: translateX(0) scale(1);
                        filter: blur(0px);
                    }
                }

                @keyframes futuristicGlow {
                    0%, 100% {
                        opacity: 0.45;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.9;
                        transform: scale(1.08);
                    }
                }

                @keyframes shine {
                    0% {
                        transform: translateX(-200%) rotate(12deg);
                    }
                    100% {
                        transform: translateX(400%) rotate(12deg);
                    }
                }

                .animate-breadcrumb {
                    animation: breadcrumbSlideIn 0.65s cubic-bezier(0.22, 1, 0.36, 1) forwards;
                    opacity: 0;
                }

                .animate-glow {
                    animation: futuristicGlow 4s ease-in-out infinite;
                }

                .animate-shine {
                    animation: shine 4s linear infinite;
                }
            `}</style>

            {/* עטיפה עם Glassmorphism עתידני */}
            <nav
                className="
                    group
                    relative inline-flex items-center
                    overflow-hidden
                    rounded-2xl
                    border border-white/10
                    bg-[rgba(8,12,22,0.72)]
                    px-5 py-3
                    backdrop-blur-2xl
                    shadow-[0_12px_40px_rgba(0,0,0,0.45)]
                    before:absolute
                    before:inset-0
                    before:bg-[linear-gradient(to_right,rgba(34,211,238,0.05),transparent,rgba(236,72,153,0.05))]
                    before:pointer-events-none
                "
            >
                {/* Glow רקע */}
                <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl">
                    {/* Glow כחול */}
                    <div className="animate-glow absolute -left-10 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-cyan-400/15 blur-2xl" />

                    {/* Glow ורוד */}
                    <div className="animate-glow absolute -right-10 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full bg-pink-400/10 blur-2xl" />

                    {/* Shine */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="animate-shine absolute top-0 -left-1/2 h-full w-1/4 bg-gradient-to-r from-transparent via-white/[0.08] to-transparent" />
                    </div>

                    {/* Grid */}
                    <div className="absolute inset-0 opacity-[0.04] bg-[linear-gradient(rgba(255,255,255,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:18px_18px]" />
                </div>

                {/* קישור קבוע לדף הבית */}
                <div
                    className="animate-breadcrumb relative z-10"
                    style={{ animationDelay: '0ms' }}
                >
                    <Link
                        href="/"
                        className="
                            group/home
                            relative flex items-center justify-center
                            rounded-xl
                            border border-white/5
                            bg-white/[0.03]
                            p-2.5
                            text-slate-400
                            transition-all duration-500
                            hover:border-cyan-400/30
                            hover:bg-cyan-400/10
                            hover:text-cyan-300
                            hover:shadow-[0_0_25px_rgba(34,211,238,0.25)]
                            hover:scale-110
                        "
                    >
                        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-cyan-400/10 to-pink-400/10 opacity-0 transition-opacity duration-500 group-hover/home:opacity-100" />
                        <Home
                            size={16}
                            className="relative z-10 transition-transform duration-500 group-hover/home:rotate-6"
                        />
                    </Link>
                </div>

                {/* לולאה להצגת קטעי הנתיב המסוננים והמפוענחים */}
                {breadcrumbs.map((crumb, index) => {
                    const isLast = index === breadcrumbs.length - 1;
                    const animationDelay = `${(index + 1) * 120}ms`;

                    return (
                        <div
                            key={crumb.href}
                            className="group/item relative z-10 flex items-center animate-breadcrumb"
                            style={{ animationDelay }}
                        >
                            {/* חץ מפריד */}
                            <div className="mx-2 flex items-center justify-center">
                                <ChevronRight
                                    size={15}
                                    className="
                                        text-slate-600
                                        transition-all duration-500
                                        group-hover/item:text-cyan-400/70
                                        group-hover/item:translate-x-0.5
                                        group-hover/item:drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]
                                    "
                                />
                            </div>

                            {isLast ? (
                                // בשלב האחרון - רק טקסט
                                <div
                                    className="
                                        relative overflow-hidden
                                        rounded-xl
                                        border border-white/10
                                        bg-white/[0.03]
                                        px-4 py-2
                                        shadow-[0_0_20px_rgba(255,255,255,0.03)]
                                    "
                                >
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.08] via-transparent to-pink-500/[0.08]" />
                                    <span
                                        className="
                                            relative z-10
                                            truncate
                                            max-w-[170px] sm:max-w-none
                                            bg-gradient-to-r
                                            from-white
                                            via-cyan-100
                                            to-pink-200
                                            bg-clip-text
                                            text-transparent
                                            font-black
                                            tracking-[0.08em]
                                            drop-shadow-[0_0_14px_rgba(255,255,255,0.15)]
                                        "
                                    >
                                        {crumb.label}
                                    </span>
                                </div>
                            ) : (
                                // בשלבי הביניים - קישור תקין לניווט
                                <Link
                                    href={crumb.href}
                                    className="
                                        relative
                                        rounded-xl
                                        px-3 py-2
                                        text-slate-400
                                        font-semibold
                                        tracking-wide
                                        transition-all duration-500
                                        hover:text-cyan-300
                                        hover:bg-cyan-400/5
                                        hover:-translate-y-0.5
                                        hover:drop-shadow-[0_0_12px_rgba(34,211,238,0.4)]
                                    "
                                >
                                    {crumb.label}
                                </Link>
                            )}
                        </div>
                    );
                })}
            </nav>
        </>
    );
};

export default Breadcrumbs;
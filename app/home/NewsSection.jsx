'use client';

import { motion, useReducedMotion } from 'framer-motion';
import { Newspaper, ArrowRight, Clock3, Sparkles } from 'lucide-react';
import Link from "next/link";

function getRevealProps(reducedMotion, delay = 0) {
    if (reducedMotion) return {};

    return {
        initial: { opacity: 0, y: 30 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.15 },
        transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] },
    };
}

function Reveal({ children, delay = 0, className = "" }) {
    const reducedMotion = useReducedMotion();

    return (
        <motion.div className={className} {...getRevealProps(reducedMotion, delay)}>
            {children}
        </motion.div>
    );
}

// שלד טעינה מותאם אישית לעיצוב החדש
function NewsSkeletonCard({ isFeatured = false }) {
    if (isFeatured) {
        return (
            <div className="animate-pulse rounded-[24px] border border-white/10 bg-white/5 h-[400px] lg:h-full min-h-[500px] w-full relative overflow-hidden">
                <div className="absolute bottom-0 w-full p-8 space-y-4">
                    <div className="h-4 w-24 rounded-full bg-white/10" />
                    <div className="h-8 w-3/4 rounded-lg bg-white/10" />
                    <div className="h-8 w-1/2 rounded-lg bg-white/10" />
                    <div className="h-4 w-full rounded-lg bg-white/10 mt-4" />
                </div>
            </div>
        );
    }

    return (
        <div className="animate-pulse flex flex-col sm:flex-row gap-4 rounded-[20px] border border-white/10 bg-white/5 p-3 h-full">
            <div className="h-48 sm:h-32 w-full sm:w-40 shrink-0 rounded-[14px] bg-white/10" />
            <div className="flex flex-1 flex-col justify-center space-y-3 py-2">
                <div className="h-3 w-20 rounded-full bg-white/10" />
                <div className="h-5 w-full rounded-lg bg-white/10" />
                <div className="h-5 w-2/3 rounded-lg bg-white/10" />
            </div>
        </div>
    );
}

// כרטיסיית הכתבה המרכזית (Hero Style)
function FeaturedNewsCard({ item }) {
    return (
        <motion.article
            whileHover="hover"
            className="group relative h-[400px] lg:h-full min-h-[500px] w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#0f141d]"
        >
            {/* תמונת רקע */}
            {item.image ? (
                <img
                    src={item.image}
                    alt={item.title}
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110"
                />
            ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-lime-500/20 to-emerald-900/40">
                    <Newspaper className="h-20 w-20 text-lime-300/50" />
                </div>
            )}

            {/* גרדיאנט קולנועי כדי שהטקסט יהיה קריא */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#090b10] via-[#090b10]/80 to-transparent transition-opacity duration-500 group-hover:opacity-90" />

            {/* מסגרת זוהרת בהובר */}
            <div className="absolute inset-0 border-2 border-lime-400/0 transition-colors duration-500 rounded-[24px] group-hover:border-lime-400/30 z-10 pointer-events-none" />

            {/* תוכן */}
            <div className="absolute bottom-0 flex w-full flex-col p-6 lg:p-10 z-20">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <span className="rounded-full bg-lime-400 px-4 py-1.5 text-xs font-bold text-[#090b10] shadow-[0_0_15px_rgba(163,230,53,0.4)]">
                        {item.category || 'News'}
                    </span>
                    {item.isHot && (
                        <span className="flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-orange-500/20 px-3 py-1.5 text-xs font-bold text-orange-300 backdrop-blur-md">
                            <Sparkles size={14} />
                            Hot Topic
                        </span>
                    )}
                    <div className="flex items-center gap-1.5 text-xs font-medium tracking-widest text-lime-100/70 ml-auto uppercase">
                        <Clock3 size={14} />
                        <span>{item.dateText || 'Just now'}</span>
                    </div>
                </div>

                {/* הכותרת משלבת את ה-ID והטייטל */}
                <h3 className="mb-4 text-3xl font-black leading-tight text-white md:text-4xl lg:text-5xl drop-shadow-lg flex items-center gap-3 flex-wrap">
                    <span className="text-lime-400/80 text-2xl md:text-3xl">#{item.id}</span>
                    <span>{item.title}</span>
                </h3>

                {item.excerpt && (
                    <p className="mb-6 max-w-2xl line-clamp-2 text-base leading-relaxed text-zinc-300 md:text-lg">
                        {item.excerpt}
                    </p>
                )}

                <div>
                    {/* כפתור הקישור מבוסס על ה-ID */}
                    <Link
                        href={generateArticleUrl(item.id, item.title)}
                        className="inline-flex items-center gap-2 rounded-full bg-white/10 px-6 py-2.5 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-lime-400 hover:text-[#090b10]"
                    >
                        Read Full Story
                        <ArrowRight size={16} />
                    </Link>
                </div>
            </div>
        </motion.article>
    );
}

// כרטיסייה משנית (Compact Layout)
function CompactNewsCard({ item }) {
    return (
        <motion.article
            whileHover={{ x: 4 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="group relative flex flex-col sm:flex-row gap-5 overflow-hidden rounded-[20px] border border-white/5 bg-white/[0.02] p-3 transition-colors hover:bg-white/[0.06] hover:border-white/10"
        >
            <div className="relative h-48 sm:h-32 w-full sm:w-44 shrink-0 overflow-hidden rounded-[14px]">
                {item.image ? (
                    <img
                        src={item.image}
                        alt={item.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/5 to-white/10">
                        <Newspaper className="h-8 w-8 text-white/20" />
                    </div>
                )}
                {item.isHot && (
                    <div className="absolute left-2 top-2 rounded-full bg-orange-500 p-1.5 text-white shadow-lg">
                        <Sparkles size={12} />
                    </div>
                )}
            </div>

            <div className="flex flex-1 flex-col justify-center py-2 pr-4">
                <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-semibold text-lime-400">
                        {item.category || 'Update'}
                    </span>
                    <span className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                        <Clock3 size={12} />
                        {item.dateText || 'Recent'}
                    </span>
                </div>

                {/* הכותרת משלבת את ה-ID והטייטל */}
                <h3 className="mb-2 line-clamp-2 text-lg font-bold leading-snug text-white transition-colors group-hover:text-lime-300">
                    <span className="text-lime-400/80 mr-1.5 text-base">#{item.id}</span>
                    {item.title}
                </h3>

                {/* כפתור הקישור מבוסס על ה-ID */}
                <Link
                    href={`/news/${item.id}`}
                    className="mt-auto inline-flex w-fit items-center gap-1.5 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
                >
                    Read article
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                </Link>
            </div>

            {/* קישור קליקבילי נסתר על כל הכרטיס מבוסס ID */}
            <Link href={generateArticleUrl(item.id, item.title)} className="absolute inset-0 z-10" aria-label={item.title}></Link>
        </motion.article>
    );
}

// פונקציה לייצור URL תקני
const generateArticleUrl = (id, title) => {
    if (!title) return `/news/${id}`;

    const safeTitle = title
        .trim() // מוריד רווחים בהתחלה ובסוף
        .replace(/\s+/g, '-') // מחליף את כל הרווחים באמצע למקפים
        .replace(/[^\w\u0590-\u05FF-]/g, ''); // משאיר רק עברית, אנגלית, מספרים ומקפים כדי למנוע באגים בניתוב

    return `/news/${id}-${safeTitle}`;
};

export default function NewsSection({
    title = 'Latest News',
    eyebrow = 'Updates',
    text = 'Fresh updates from the site, games, and community in one clean place.',
    news = [],
    isLoading = false,
}) {
    const featured = news?.[0];
    const rest = news?.slice(1, 4) || [];

    return (
        <section className="relative w-full overflow-hidden px-4 py-20 md:px-6">
            {/* אפקטי תאורת רקע עדינים */}
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-1/2 top-0 h-[40rem] w-[40rem] -translate-x-1/2 rounded-full bg-lime-500/5 blur-[120px]" />
                <div className="absolute -right-20 top-40 h-72 w-72 rounded-full bg-emerald-500/10 blur-[100px]" />
            </div>

            <div className="relative mx-auto w-full max-w-7xl">
                {/* כותרת עליונה */}
                <Reveal className="mb-12 flex flex-col items-start justify-between gap-6 md:flex-row md:items-end">
                    <div className="max-w-2xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-lime-400/20 bg-lime-400/10 px-4 py-1.5 text-sm font-bold tracking-wide text-lime-300">
                            <Sparkles size={16} />
                            {eyebrow}
                        </div>
                        <h2 className="text-4xl font-black leading-tight text-white md:text-5xl lg:text-6xl">
                            {title}
                        </h2>
                        <p className="mt-4 text-lg leading-relaxed text-zinc-400">
                            {text}
                        </p>
                    </div>

                    {/* כפתור "צפה הכל" למעלה */}
                    {!isLoading && news.length > 0 && (

                        <Link href="/news" className="group hidden md:inline-flex items-center gap-2 rounded-full bg-white/5 px-6 py-3 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10">
                            View All
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    )}
                </Reveal>

                {/* גריד החדשות */}
                <div className="grid gap-6 lg:grid-cols-12">
                    {isLoading ? (
                        <>
                            {/* שלד כתבה ראשית */}
                            <div className="lg:col-span-7">
                                <NewsSkeletonCard isFeatured />
                            </div>
                            {/* שלד כתבות משניות */}
                            <div className="flex flex-col gap-4 lg:col-span-5">
                                <NewsSkeletonCard />
                                <NewsSkeletonCard />
                                <NewsSkeletonCard />
                            </div>
                        </>
                    ) : news?.length ? (
                        <>
                            {/* כתבה ראשית */}
                            <Reveal delay={0.1} className="lg:col-span-7 h-full">
                                <FeaturedNewsCard item={featured} />
                            </Reveal>

                            {/* כתבות משניות - רשימה אנכית */}
                            <div className="flex flex-col gap-4 lg:col-span-5">
                                {rest.map((item, index) => (
                                    <Reveal key={item.id ?? index} delay={0.2 + index * 0.1} className="h-full">
                                        <CompactNewsCard item={item} />
                                    </Reveal>
                                ))}
                            </div>
                        </>
                    ) : (
                        <>
                            {/* מצב ריק */}
                            <div className="col-span-full">
                                <Reveal>
                                    <div className="flex flex-col items-center justify-center rounded-[32px] border border-white/5 bg-[#0f141d]/50 p-16 text-center backdrop-blur-xl">
                                        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-zinc-500">
                                            <Newspaper size={32} />
                                        </div>
                                        <h3 className="text-2xl font-black text-white">No updates yet</h3>
                                        <p className="mt-3 max-w-sm text-zinc-400">
                                            Check back later for the latest news, patch notes, and community updates.
                                        </p>
                                    </div>
                                </Reveal>
                            </div>
                        </>
                    )}
                </div>

                {/* כפתור מובייל "צפה הכל" */}
                {news?.length > 0 && (
                    <Reveal delay={0.3} className="mt-8 flex justify-center md:hidden">
                        <Link href="/news" className="group inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-4 text-sm font-bold text-white backdrop-blur-md transition-all hover:bg-white/10">
                            View All News
                            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                        </Link>
                    </Reveal>
                )}
            </div>
        </section>
    );
}
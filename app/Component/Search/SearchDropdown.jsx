import React from 'react';
import SmartImage from '../SmartImage/SmartImage';
import Link from 'next/link';
/**
 * פונקציית עזר להצמדת עיצוב ייחודי לכל אחת מ-14 הקטגוריות
 */
const getCategoryStyle = (categoryName) => {
    const styles = {
        'Action': {
            bg: 'from-red-600/20 to-red-900/40 border-red-500/30',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z', // Lightning
            accent: 'bg-red-500'
        },
        'RPG (Role-Playing)': {
            bg: 'from-purple-600/20 to-indigo-900/40 border-purple-500/30',
            icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z', // Hat/Magic
            accent: 'bg-purple-500'
        },
        'FPS (First-Person Shooter)': {
            bg: 'from-orange-600/20 to-yellow-900/40 border-orange-500/30',
            icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z', // Shield/Target
            accent: 'bg-orange-500'
        },
        'Open World': {
            bg: 'from-emerald-600/20 to-teal-900/40 border-emerald-500/30',
            icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z', // Globe
            accent: 'bg-emerald-500'
        },
        'Sports': {
            bg: 'from-blue-500/20 to-cyan-900/40 border-blue-400/30',
            icon: 'M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z M21 12a9 9 0 11-18 0 9 9 0 0118 0z', // Play/Ball
            accent: 'bg-blue-400'
        },
        'Strategy': {
            bg: 'from-amber-600/20 to-yellow-900/40 border-amber-500/30',
            icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', // Clipboard/Plan
            accent: 'bg-amber-500'
        },
        'Survival': {
            bg: 'from-green-700/20 to-lime-900/40 border-green-500/30',
            icon: 'M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z', // Heart
            accent: 'bg-green-500'
        },
        'Horror': {
            bg: 'from-gray-800/60 to-black border-red-900/50',
            icon: 'M13 2l-2 2.5h3L12 7h3l-4 5h3l-2 3h2l-5 5', // Ghost/Spooky
            accent: 'bg-red-900'
        },
        'Adventure': {
            bg: 'from-rose-600/20 to-pink-900/40 border-rose-500/30',
            icon: 'M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z', // Location
            accent: 'bg-rose-500'
        },
        'Battle Royale': {
            bg: 'from-violet-600/20 to-fuchsia-900/40 border-violet-500/30',
            icon: 'M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12z', // Trophy/Crown-like
            accent: 'bg-violet-500'
        },
        'Racing': {
            bg: 'from-slate-500/20 to-slate-800/40 border-slate-400/30',
            icon: 'M13 10V3L4 14h7v7l9-11h-7z', // Bolt
            accent: 'bg-slate-300'
        },
        'Simulation': {
            bg: 'from-sky-600/20 to-indigo-900/40 border-sky-500/30',
            icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z', // Monitor
            accent: 'bg-sky-400'
        },
        'Platformer': {
            bg: 'from-lime-500/20 to-green-800/40 border-lime-400/30',
            icon: 'M7 11l5-5m0 0l5 5m-5-5v12', // Up Arrow
            accent: 'bg-lime-400'
        },
        'Indie': {
            bg: 'from-pink-500/20 to-rose-900/40 border-pink-400/30',
            icon: 'M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.675.285a2 2 0 01-.823.18H12a2 2 0 01-1.07.31 2 2 0 01-1.07-.31h-.393a2 2 0 01-.823-.18l-.675-.285a6 6 0 00-3.86-.517l-2.387.477a2 2 0 00-1.022.547V18a2 2 0 002 2h12a2 2 0 002-2v-2.572z', // Star/Unique
            accent: 'bg-pink-400'
        }
    };

    return styles[categoryName] || { bg: 'from-slate-800/80 to-slate-900/40 border-slate-600/20', icon: 'M4 6h16M4 12h16m-7 6h7', accent: 'bg-slate-500' };
};

export default function SearchDropdown({ data, isLoading, isVisible, onItemClick, searchTerm = "" }) {
    // אם החלונית לא אמורה להיות מוצגת - נחזיר null
    if (!isVisible) return null;

    const hasResults = data?.games?.length > 0 || data?.categories?.length > 0;
    const hasSearchTerm = searchTerm.trim().length > 0;

    // אם אין תוצאות, השרת לא טוען, והמשתמש אפילו לא הקליד כלום (למשל סתם לחץ על התיבה) - לא נציג כלום
    if (!hasResults && !isLoading && !hasSearchTerm) return null;

    return (
        <div className="absolute top-full right-0 scale-[0.7] origin-top-right w-[500px] max-w-[95vw] mt-4 bg-[#0b0e14]/98 backdrop-blur-2xl border border-cyan-500/30 rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7),0_0_20px_rgba(34,211,238,0.1)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-300">
            {/* ----------------- מצב טעינה ----------------- */}
            {isLoading && (
                <div className="p-10 text-center flex flex-col items-center">
                    <div className="w-10 h-10 border-4 border-cyan-400/20 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
                    <div className="text-cyan-400 font-bold tracking-[0.3em] uppercase text-xs animate-pulse">Scanning Database...</div>
                </div>
            )}

            {/* ----------------- מצב שאין תוצאות ----------------- */}
            {!isLoading && !hasResults && hasSearchTerm && (
                <div className="p-12 flex flex-col items-center justify-center text-center animate-in fade-in zoom-in duration-500">
                    <div className="relative mb-6 group">
                        {/* הילה כחולה פועמת מאחורה */}
                        <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full animate-pulse"></div>

                        {/* קוביית האייקון שקופצת קצת כשהעכבר עליה */}
                        <div className="relative w-16 h-16 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-sm group-hover:-translate-y-1 transition-transform duration-300">
                            <svg className="w-8 h-8 text-cyan-400/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {/* פרצוף עצוב / רדאר שמשתלב מעולה עם גיימינג */}
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>

                    <h3 className="text-white text-sm font-black uppercase tracking-[0.2em] mb-2">
                        No Results Found
                    </h3>
                    <p className="text-slate-400 text-xs">
                        We couldn't find any matches for <span className="text-cyan-400 font-bold">"{searchTerm}"</span>
                    </p>
                </div>
            )}

            {/* ----------------- אזור הצגת התוצאות (מוצג רק אם יש תוצאות) ----------------- */}
            {!isLoading && hasResults && (
                <div className="flex flex-col p-3 gap-4">
                    {/* --- משחקים --- */}
                    {data?.games?.length > 0 && (
                        <div className="space-y-3">
                            <h3 className="text-[10px] uppercase tracking-[0.25em] text-cyan-400/60 font-black px-2 flex items-center gap-3">
                                <span className="flex-1 h-px bg-cyan-500/20"></span>
                                {data.isPopular ? "Trending Now" : "Game Matches"}
                                <span className="flex-1 h-px bg-cyan-500/20"></span>
                            </h3>
                            <div className="grid gap-2">
                                {data.games.map((game) => (
                                    // ... קוד המשחקים הקיים שלך ...
                                    <Link
                                        key={game.id}
                                        href={`/games/${game?.title}`}
                                        onClick={() => onItemClick?.()}
                                        className="flex items-center gap-4 p-2 rounded-xl bg-white/[0.03] hover:bg-white/[0.08] border border-white/5 hover:border-cyan-500/30 transition-all duration-500 group relative overflow-hidden"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                        <SmartImage
                                            url={game.imageUrl}
                                            alt={game.title}
                                            containerClassName="w-[120px] h-[68px] rounded-lg shadow-2xl shrink-0 z-10"
                                            imageClassName="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                                        />
                                        <div className="flex flex-col z-10 overflow-hidden pr-2">
                                            <span className="text-slate-100 text-base font-bold group-hover:text-cyan-400 transition-colors truncate">
                                                {game.title}
                                            </span>
                                            <span className="text-[10px] text-slate-500 uppercase tracking-tighter">View Details</span>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* --- קטגוריות --- */}
                    {data?.categories?.length > 0 && (
                        <div className="space-y-4">
                            <h3 className="text-[10px] uppercase tracking-[0.25em] text-slate-500 font-black px-2 flex items-center gap-3">
                                <span className="flex-1 h-px bg-white/10"></span>
                                Browse Genres
                                <span className="flex-1 h-px bg-white/10"></span>
                            </h3>
                            <div className="grid grid-cols-1 gap-2.5">
                                {data.categories.map((cat) => {
                                    const style = getCategoryStyle(cat.name);
                                    return (
                                        // ... קוד הקטגוריות הקיים שלך ...
                                        <Link
                                            key={cat.id}
                                            href={`/Search?categories=${cat.name.toLowerCase()}`}
                                            onClick={() => onItemClick?.()}
                                            className={`group relative flex items-center justify-between p-4 h-[65px] rounded-xl bg-gradient-to-br border shadow-inner transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.5)] ${style.bg}`}
                                        >
                                            <div className="absolute right-4 opacity-5 group-hover:opacity-10 transition-opacity">
                                                <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
                                                    <path d={style.icon} />
                                                </svg>
                                            </div>
                                            <div className="flex items-center gap-4 z-10">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center bg-black/40 border border-white/10 group-hover:border-white/30 transition-all`}>
                                                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={style.icon} />
                                                    </svg>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-white text-sm font-black uppercase tracking-wider group-hover:tracking-widest transition-all">
                                                        {cat.name}
                                                    </span>
                                                    <span className="text-[10px] text-white/50 font-medium">Explore Collection</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end z-10">
                                                <span className="text-white font-mono text-xs bg-black/30 px-2 py-0.5 rounded-md border border-white/5">
                                                    {cat.gamesCount || '0'}
                                                </span>
                                                <span className="text-[9px] text-white/40 uppercase mt-1">Titles</span>
                                            </div>
                                            <div className={`absolute left-0 top-1/4 bottom-1/4 w-1 rounded-r-full ${style.accent} opacity-0 group-hover:opacity-100 transition-all`}></div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ----------------- כפתור חיפוש מתקדם (נשאר תמיד כשאפשרי) ----------------- */}
            {(hasResults || (!isLoading && !hasResults && hasSearchTerm)) && (
                <div className="pt-2 px-1 pb-1">
                    <a
                        href="/Search"
                        onClick={() => onItemClick?.()}
                        className="group relative flex items-center justify-between w-full p-4 rounded-xl bg-cyan-500/5 hover:bg-cyan-500/10 border border-cyan-500/20 hover:border-cyan-500/50 transition-all duration-300"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 flex items-center justify-center group-hover:rotate-12 transition-transform">
                                <svg className="w-4 h-4 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <span className="text-xs text-cyan-400/90 group-hover:text-cyan-300 font-bold tracking-wider uppercase">
                                Advanced Search
                            </span>
                        </div>
                        <svg className="w-4 h-4 text-cyan-500 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                    </a>
                </div>
            )}
        </div>
    );
}
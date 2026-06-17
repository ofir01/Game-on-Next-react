'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Tag, Layers, Search } from 'lucide-react';
import { useNews } from '../hooks/useNews';
import ArticleCard from '../Component/ArticleCard/ArticleCard';
import { getNewsCategories } from '../hooks/useNews';

export default function NewsPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    // שינוי מתגיות לקטגוריות
    const [selectedCategory, setSelectedCategory] = useState(null);

    // שליחת כמות לעמוד + ערך החיפוש החופשי אל ה-hook שלכם
    const {
        data: articles,
        allNews,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        isLoading,
        isError,
    } = useNews(6, searchTerm);

    const generateArticleUrl = (id, title) => {
        if (!title) return `/news/${id}`;
        const safeTitle = title
            .trim()
            .replace(/\s+/g, '-')
            .replace(/[^\w\u0590-\u05FF-]/g, '');
        return `/news/${id}-${safeTitle}`;
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#090b10]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-lime-400 border-t-transparent" />
                    <span className="animate-pulse font-bold text-xl text-lime-400 tracking-wider">טוען כתבות...</span>
                </div>
            </div>
        );
    }

    if (isError || !articles) {
        return (
            <div className="flex flex-col gap-4 justify-center items-center min-h-screen bg-[#090b10] text-white">
                <h1 className="text-2xl font-bold text-red-500">שגיאה בטעינת הכתבות</h1>
                <p className="text-zinc-400">לא הצלחנו למשוך את הנתונים מהשרת.</p>
            </div>
        );
    }

    // סינון מקומי לפי קטגוריה (במידה ונבחרה)
    const filteredArticles = selectedCategory
        ? articles.filter(article => article.category === selectedCategory)
        : articles;

    return (
        <div className="min-h-screen bg-[#090b10] text-zinc-300 antialiased selection:bg-lime-400 selection:text-[#090b10]" dir="rtl">

            {/* אפקטי תאורה ברקע */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                <div className="absolute left-1/3 top-0 h-[40rem] w-[50rem] rounded-full bg-gradient-to-b from-lime-500/5 to-transparent blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-7xl px-4 py-12 md:px-6 lg:py-16 z-10">

                {/* --- Header Area --- */}
                <header className="mb-12 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white sm:text-5xl mb-3 tracking-tight">
                            חדשות <span className="text-lime-400">וגיימינג</span>
                        </h1>
                        <p className="text-zinc-400 text-sm sm:text-base max-w-xl">
                            כל העדכונים, ההכרזות והאירועים החמים ביותר ישירות ממערכת האתר.
                        </p>
                    </div>

                    {/* אזור החיפוש */}
                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative group w-full md:w-64">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="חיפוש חופשי..."
                                className="w-full bg-[#0f141d] border border-white/10 rounded-xl py-3 pr-11 pl-4 outline-none focus:ring-2 focus:ring-lime-500/50 text-white placeholder-slate-500 text-sm transition-all"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </header>

                {/* גריד ראשי */}
                <div className="grid gap-8 lg:grid-cols-12 items-start">

                    {/* סרגל צד - קטגוריות */}
                    <aside className="lg:col-span-3 bg-[#0f141d]/60 backdrop-blur-xl border border-white/5 rounded-2xl p-5 sticky top-6">
                        <h3 className="text-sm font-black text-zinc-400 tracking-wider uppercase mb-4 flex items-center gap-2">
                            <Layers size={16} className="text-lime-400" />
                            סינון לפי קטגוריות
                        </h3>

                        <div className="flex flex-row flex-wrap lg:flex-col gap-2">
                            {/* כפתור הצגת כל הכתבות */}
                            <button
                                onClick={() => setSelectedCategory(null)}
                                className={`text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                    selectedCategory === null
                                        ? 'bg-lime-400 text-[#090b10] border-lime-400 shadow-[0_0_15px_rgba(163,230,53,0.15)]'
                                        : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                                }`}
                            >
                                הכל ({articles.length})
                            </button>

                            {/* רנדור דינמי של כפתורי הקטגוריות */}
                            {getNewsCategories().map((cat) => {
                                // ספירת הכתבות ששייכות לקטגוריה
                                const count = articles.filter(a => a.category === cat.value).length;

                                return (
                                    <button
                                        key={cat.value}
                                        onClick={() => setSelectedCategory(cat.value)}
                                        className={`text-right px-4 py-2.5 rounded-xl text-xs font-bold transition-all border ${
                                            selectedCategory === cat.value
                                                ? 'bg-cyan-400 text-[#090b10] border-cyan-400 shadow-[0_0_15px_rgba(34,211,238,0.15)]'
                                                : 'bg-white/5 border-white/5 text-zinc-400 hover:bg-white/10 hover:text-white'
                                        }`}
                                    >
                                        {cat.label || cat.value} <span className="opacity-60 text-[10px] mr-1">({count})</span>
                                    </button>
                                );
                            })}
                        </div>
                    </aside>

                    {/* רשימת הכתבות */}
                    <main className="lg:col-span-9 space-y-8">
                        <motion.div layout className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                            <AnimatePresence mode="popLayout">
                                {filteredArticles?.map((article) => (
                                    <ArticleCard
                                        key={article._id || article.id}
                                        article={article}
                                        onClick={() => router.push(generateArticleUrl(article.id, article.title))}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {/* הודעה במידה ואין כתבות */}
                        {filteredArticles.length === 0 && (
                            <div className="text-center py-20 bg-[#0f141d]/20 rounded-2xl border border-white/5">
                                <Tag size={40} className="mx-auto text-zinc-600 mb-3" />
                                <h3 className="text-lg font-bold text-white">אין כתבות להצגה</h3>
                                <p className="text-zinc-500 text-sm mt-1">נסה לשנות את מילת החיפוש או לבחור קטגוריה אחרת.</p>
                            </div>
                        )}

                        {/* --- כפתור טען עוד --- */}
                        <div className="flex justify-center pt-4">
                            {hasNextPage ? (
                                <button
                                    onClick={() => fetchNextPage()}
                                    disabled={isFetchingNextPage}
                                    className="group flex items-center gap-2 px-8 py-3 bg-white/5 border border-white/10 hover:bg-white/10 text-white rounded-full transition-all disabled:opacity-50 text-sm"
                                >
                                    {isFetchingNextPage ? (
                                        <> <Loader2 size={16} className="animate-spin" /> מושך נתונים... </>
                                    ) : (
                                        <> טען ידיעות נוספות <span className="group-hover:translate-y-0.5 transition-transform">↓</span> </>
                                    )}
                                </button>
                            ) : allNews?.length > 0 ? (
                                <div className="text-slate-500 text-xs font-medium">הגעת לסוף הרשימה</div>
                            ) : null}
                        </div>
                    </main>

                </div>
            </div>
        </div>
    );
}
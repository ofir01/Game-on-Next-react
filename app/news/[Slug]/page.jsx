'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Calendar, Sparkles, ArrowRight, Tag, Gamepad2, Clock, CheckCircle2, Quote, Flame } from 'lucide-react';
import { useSingleNews } from '../../hooks/News/useNews';
import Breadcrumbs from '../../Component/Breadcrumbs/Breadcrumbs';


export default function NewsArticle() {
    const params = useParams();
    const router = useRouter();

    const slugString = decodeURIComponent(params.Slug || '');
    const articleId = slugString.split('-')[0];

    // מעבירים ל-hook רק את ה-ID הנקי
    const { data: article, isLoading, isError } = useSingleNews(articleId);

    const handleBack = () => {
        router.push('/news');
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-[#090b10]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-lime-400 border-t-transparent" />
                    <span className="animate-pulse font-bold text-xl text-lime-400 tracking-wider">טוען את הכתבה המלאה...</span>
                </div>
            </div>
        );
    }

    if (isError || !article) {
        return (
            <div className="flex flex-col gap-6 justify-center items-center min-h-screen bg-[#090b10] text-white px-4 text-center">
                <div className="rounded-full bg-red-500/10 p-4 text-red-400 border border-red-500/20">
                    <Gamepad2 size={40} />
                </div>
                <h1 className="text-3xl font-black text-red-500">אופס! הכתבה לא נמצאה</h1>
                <p className="text-zinc-400 max-w-md">ייתכן שהקישור שבור או שהכתבה הוסרה מהמערכת.</p>
                <button onClick={handleBack} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-full text-sm font-bold transition-all border border-white/10">
                    <ArrowRight size={16} />
                    חזור לעמוד החדשות
                </button>
            </div>
        );
    }

    // פירמוט תאריך אמיתי מה-DB
    const formattedDate = new Date(article.createdAt || Date.now()).toLocaleDateString('he-IL', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });

    // סגנונות קטגוריה דינמיים מה-DB
    const getCategoryStyles = (category) => {
        const styles = {
            Update: { color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/20' },
            Event: { color: 'text-purple-400', bg: 'bg-purple-400/10', border: 'border-purple-400/20' },
            Sale: { color: 'text-green-400', bg: 'bg-green-400/10', border: 'border-green-400/20' },
            Patch: { color: 'text-zinc-400', bg: 'bg-zinc-400/10', border: 'border-zinc-400/20' },
            Games: { color: 'text-lime-400', bg: 'bg-lime-400/10', border: 'border-lime-400/20' },
            Feature: { color: 'text-cyan-400', bg: 'bg-cyan-400/10', border: 'border-cyan-400/20' }
        };
        return styles[category] || styles.Update;
    };

    const catStyles = getCategoryStyles(article.category);

    return (
        <div className="min-h-screen bg-[#090b10] text-zinc-300 antialiased selection:bg-lime-400 selection:text-[#090b10]" dir="rtl">

            {/* אפקטי תאורה קולנועיים ברקע העמוד */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden z-0">
                <div className="absolute left-1/2 top-0 h-[50rem] w-[60rem] -translate-x-1/2 rounded-full bg-gradient-to-b from-lime-500/10 to-transparent blur-[140px]" />
                <div className="absolute right-10 top-1/4 h-[30rem] w-[30rem] rounded-full bg-cyan-500/5 blur-[120px]" />
            </div>

            <div className="relative mx-auto max-w-5xl px-4 py-12 md:px-6 lg:py-20 z-10">


                {/* Breadcrumbs */}
                <div className="mb-8 flex flex-wrap items-center justify-start gap-4" dir="ltr">
                    <div className="max-w-8xl ml-0 mr-auto px-6">
                        <Breadcrumbs />
                    </div>
                </div>



                {/* מבנה ממורכז לכתבה */}
                <div className="flex justify-center">

                    {/* הכתבה */}
                    <motion.article
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="w-full overflow-hidden rounded-[32px] border border-white/5 bg-[#0f141d]/60 backdrop-blur-xl shadow-2xl"
                    >
                        {/* תמונת Hero ענקית מה-DB */}
                        <div className="relative h-[280px] sm:h-[400px] md:h-[480px] w-full overflow-hidden bg-zinc-950">
                            {article.image ? (
                                <img
                                    src={article.image}
                                    alt={article.title}
                                    className="h-full w-full object-cover object-center"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-900 to-[#0f141d]">
                                    <Gamepad2 size={80} className="text-white/5" />
                                </div>
                            )}
                            {/* אוברליי גרדיאנט דרמטי */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0f141d] via-[#0f141d]/20 to-transparent" />
                        </div>

                        {/* גוף הכתבה */}
                        <div className="p-6 sm:p-8 md:p-12">

                            {/* מטא דאטה עליון - כאן שולבה תגית המשחק */}
                            <div className="mb-6 flex flex-wrap items-center gap-3 text-xs md:text-sm">
                                {/* תגית המשחק */}
                                {article.title && (
                                    <Link
                                        href={`/news?category=${article?.category}`}
                                        className="group flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 font-bold text-cyan-400 transition-all hover:bg-cyan-500 hover:text-[#090b10]"
                                    >
                                        <Tag size={14} />
                                        <span>{article?.category}</span>
                                    </Link>
                                )}

                                {article.isHot && (
                                    <span className="flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 font-bold text-orange-400">
                                        <Flame size={14} className="animate-pulse" />
                                        חם במערכת
                                    </span>
                                )}

                                <div className="flex items-center gap-1.5 text-zinc-400 mr-auto">
                                    <Calendar size={14} />
                                    <span>{formattedDate}</span>
                                </div>
                            </div>

                            {/* כותרת ראשית מה-DB */}
                            <h1 className="text-3xl font-black leading-tight text-white sm:text-4xl md:text-5xl lg:text-5xl mb-8 drop-shadow-md">
                                {article.title}
                            </h1>

                            {/* שורת מחבר (נתונים פיקטיביים מעוצבים) */}
                            <div className="mb-10 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white/[0.02] border border-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-lime-400 text-[#090b10] font-black text-sm shadow-[0_0_15px_rgba(163,230,53,0.2)]">
                                        GO
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-white flex items-center gap-1.5">
                                            <span>מערכת GameOn</span>
                                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-lime-400" />
                                        </div>
                                        <div className="text-xs text-zinc-500">עורך תוכן ראשי והרשת</div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-zinc-400">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={14} className="text-lime-400" />
                                        <span>4 דקות קריאה</span>
                                    </div>
                                </div>
                            </div>

                            {/* תיבת TL;DR / סיכום מהיר פיקטיבי להעשרת חווית הקריאה */}
                            <div className="mb-10 rounded-2xl border border-lime-400/20 bg-lime-400/[0.02] p-5 md:p-6">
                                <h3 className="mb-3 flex items-center gap-2 font-black text-white text-base sm:text-lg">
                                    <Sparkles size={18} className="text-lime-400" />
                                    בקיצור (TL;DR):
                                </h3>
                                <ul className="space-y-2 text-sm text-zinc-300">
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-lime-400" />
                                        <span>הפרטים הרשמיים והעדכניים ביותר ישירות מצוות הפיתוח.</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-lime-400" />
                                        <span>שינויים משמעותיים בממשק המשתמש, שיפורי ביצועים יציבים ותיקוני באגים קריטיים.</span>
                                    </li>
                                </ul>
                            </div>

                            {/* התוכן האמיתי של הכתבה מה-DB */}
                            <div className="prose prose-invert max-w-none">
                                <p className="text-lg md:text-xl font-medium leading-relaxed text-zinc-200 whitespace-pre-wrap mb-8 bg-gradient-to-l from-white/5 to-transparent p-4 rounded-r-xl border-r-2 border-lime-400">
                                    {article.excerpt || article.content}
                                </p>

                                {/* המשך כתבה ארוכה מובנית פיקטיבית כדי לתת נפח לעמוד */}
                                <h2 className="text-xl md:text-2xl font-black text-white mt-10 mb-4">מה זה אומר עבור קהילת השחקנים?</h2>
                                <p className="text-base md:text-lg leading-relaxed text-zinc-400 mb-6">
                                    המהלך הנוכחי מסמן קפיצת מדרגה בכל הקשור ליציבות המערכת ולחווית המשתמש הכללית. על פי המידע שבידינו, השינויים בוצעו על סמך פידבק ישיר שנאסף מהקהילה במהלך השבועות האחרונים, מה שמוכיח פעם נוספת את החשיבות של מעורבות השחקנים בעיצוב פני העתיד של הפרויקט.
                                </p>

                                {/* אלמנט ציטוט (Quote Block) פיקטיבי מעוצב */}
                                <div className="my-8 relative rounded-2xl bg-white/[0.02] p-6 border-r-4 border-cyan-400 overflow-hidden">
                                    <Quote size={80} className="absolute -bottom-4 -left-4 text-white/[0.02] pointer-events-none" />
                                    <p className="text-base sm:text-lg italic font-medium text-cyan-300 relative z-10">
                                        "אנחנו מחויבים להביא את הטכנולוגיות המתקדמות ביותר וללטש את המוצר עד לרמת השלמות הגבוהה ביותר האפשרית."
                                    </p>
                                    <span className="block mt-2 text-xs font-bold text-zinc-500">— מתוך הצהרת צוות הפיתוח העולמי</span>
                                </div>

                                <h2 className="text-xl md:text-2xl font-black text-white mt-8 mb-4">מבט קדימה לתוכניות הבאות</h2>
                                <p className="text-base md:text-lg leading-relaxed text-zinc-400 mb-6">
                                    מעבר לעדכון הנוכחי, המפתחים כבר רומזים על ההפתעות הבאות שמחכות לנו מעבר לפינה. מומלץ להישאר מעודכנים כאן באתר כדי לא לפספס אף הכרזה, חלוקת פרסים או אירוע קהילתי קרוב.
                                </p>
                            </div>
                        </div>
                    </motion.article>
                </div>
            </div>
        </div>
    );
}
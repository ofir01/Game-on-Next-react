"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Filter, X, Check, Gamepad2, ArrowDownUp, DollarSign } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";


// ייבוא הקומפוננטות וההוקים 
import GamingLoader from '../Component/GamingLoader/GamingLoader.jsx';// רכיב לטעינה עם אנימציה של גיימינג
import { useCategories } from "../hooks/useCategories";
import { useAdvancedGameSearch } from "../hooks/useGame";
import Card from "../Component/Card/Card.jsx";
import CategoryFilter from "../Component/Category/Category.jsx";
import Pagination from "../Component/Pagination/Pagination.jsx";
import PriceFilter from "../Component/PriceFilter/PriceFilter";
import SortSelect from '../Component/SortSelect/SortSelect.jsx'

/**
 * קומפוננטת חיפוש משחקים מתקדם
 * מנהלת את כל הפילטרים דרך ה-URL לטובת SEO ושיתוף לינקים
 */
export default function AdvancedGameSearch() {
    const [isFirstLoad, setIsFirstLoad] = useState(true);

    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // --- 1. שליפת נתונים מה-URL ---
    // אנחנו הופכים את ה-URL למקור האמת היחיד של הסטייט
    const queryFromUrl = searchParams.get("q") || "";
    const catsFromUrl = searchParams.get("categories")?.split(",").filter(Boolean) || [];
    const sortFromUrl = searchParams.get("sort") || "rating";
    const pageFromUrl = Number(searchParams.get("page")) || 1;
    const minPriceFromUrl = searchParams.get("minPrice") || null;
    const maxPriceFromUrl = searchParams.get("maxPrice") || null;

    // --- 2. בניית אובייקט פילטרים לקריאת ה-API ---
    const currentFilters = {
        q: queryFromUrl,
        categories: catsFromUrl.length > 0 ? catsFromUrl.join(',') : null,
        sort: sortFromUrl,
        page: pageFromUrl,
        minPrice: minPriceFromUrl,
        maxPrice: maxPriceFromUrl
    };

    // --- 3. קריאות API (Hooks) ---
    const { data: categories, isLoading: isCatsLoading } = useCategories();
    const { data: gamesData, isLoading: isGamesLoading, isFetching } = useAdvancedGameSearch(currentFilters);

    useEffect(() => {
        if (!isGamesLoading && gamesData) {
            setIsFirstLoad(false);
        }
    }, [isGamesLoading, gamesData]);

    if (isFirstLoad && isGamesLoading) {
        return <GamingLoader isLoading={isGamesLoading} />;
    }
    // חילוץ נתוני דפדוף מהשרת
    const pagination = gamesData?.pagination || {};
    const totalItems = pagination.totalItems || 0;
    const totalPages = pagination.totalPages || 1;

    // --- 4. פונקציה מרכזית לעדכון ה-URL ---
    // משתמשת ב-useCallback כדי למנוע רינדורים מיותרים
    const updateFilters = useCallback((updates) => {
        const params = new URLSearchParams(searchParams.toString());

        Object.entries(updates).forEach(([key, value]) => {
            if (value === null || value === "" || (Array.isArray(value) && value.length === 0)) {
                params.delete(key);
            } else if (Array.isArray(value)) {
                params.set(key, value.join(","));
            } else {
                params.set(key, value);
            }
        });

        // בכל שינוי פילטר שאינו דפדוף - נחזיר לעמוד 1
        if (!updates.hasOwnProperty('page')) {
            params.set('page', '1');
        }

        router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, [searchParams, pathname, router]);

    // --- 5. לוגיקה של פילטרים ספציפיים ---
    const toggleCategory = (cat) => {
        const newCats = catsFromUrl.includes(cat)
            ? catsFromUrl.filter((c) => c !== cat)
            : [...catsFromUrl, cat];
        updateFilters({ categories: newCats });
    };

    const handlePageChange = (newPage) => {
        if (Number(newPage) === pageFromUrl) return;
        updateFilters({ page: newPage });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // בדיקה האם יש פילטרים פעילים (להצגת כפתור ניקוי)
    const hasActiveFilters = catsFromUrl.length > 0 || queryFromUrl || minPriceFromUrl || maxPriceFromUrl;



    return (
        <div className="min-h-screen bg-[#070b12] bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.22),transparent_30%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.20),transparent_32%),radial-gradient(circle_at_center,rgba(236,72,153,0.12),transparent_38%),radial-gradient(circle_at_bottom_left,rgba(34,197,94,0.14),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(6,182,212,0.18),transparent_30%),linear-gradient(to_bottom,rgba(255,255,255,0.03),rgba(255,255,255,0))] text-slate-200 font-sans pt-2 pb-12">            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mb-8 mt-12 flex flex-col lg:flex-row gap-10">

            {/* --- תפריט צד (Sidebar) --- */}
            <aside className="w-full lg:w-[280px] flex-shrink-0 space-y-8">
                <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 backdrop-blur-xl sticky top-32">




                    {/* פילטר מחיר */}
                    <section className="mb-8">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <DollarSign size={14} className="text-green-400" /> Price Range
                        </h3>
                        <PriceFilter
                            currentMin={minPriceFromUrl}
                            currentMax={maxPriceFromUrl}
                            onApply={(min, max) => updateFilters({ minPrice: min, maxPrice: max })}
                        />
                    </section>


                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-6"></div>

                    {/* פילטר קטגוריות (שימוש בקומפוננטה החיצונית שלך) */}
                    <section>
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <Filter size={14} className="text-purple-400" /> Categories
                        </h3>
                        <CategoryFilter
                            categories={categories}
                            selectedCategories={catsFromUrl}
                            onToggle={toggleCategory}
                            isLoading={isCatsLoading}
                            keys={'name'}
                            buttonClassName=" px-3 py-1.5 text-xs rounded-full inline-flex items-center gap-2 whitespace-nowrap "
                            activeClassName="bg-purple-500/20 border-purple-500/50 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.15)]"
                            inactiveClassName="bg-black/20 border-transparent text-slate-400 hover:bg-white/5 hover:text-white"
                            Icon={Check}
                        />
                    </section>
                </div>
            </aside>



            {/* --- אזור התוצאות המרכזי --- */}
            <main className="flex-1 flex flex-col min-w-1 mt-1">

                {/* שורה עליונה */}
                <div className="flex flex-col gap-4 mb-6">

                    {/* סלקט מיון בצד ימין */}
                    <div className="flex justify-end mt-1 ">
                        <SortSelect
                            value={sortFromUrl}
                            onChange={(value) => updateFilters({ sort: value })}
                        />
                    </div>

                    {/* שורת תגיות של פילטרים פעילים */}
                    <div className="flex flex-wrap items-center gap-2 min-h-[32px]">

                        {queryFromUrl && (
                            <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-[0_0_10px_rgba(6,182,212,0.1)]">
                                Search: "{queryFromUrl}"

                                <X
                                    size={14}
                                    className="cursor-pointer hover:text-white"
                                    onClick={() => updateFilters({ q: null })}
                                />
                            </span>
                        )}

                        {catsFromUrl.map(cat => (
                            <span
                                key={cat}
                                className="bg-purple-500/10 border border-purple-500/30 text-purple-300 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2"
                            >
                                {cat}

                                <X
                                    size={14}
                                    className="cursor-pointer hover:text-white"
                                    onClick={() => toggleCategory(cat)}
                                />
                            </span>
                        ))}

                        {/* פילטר מחיר */}
                        {(minPriceFromUrl || maxPriceFromUrl) && (
                            <span className="bg-green-500/10 border border-green-500/30 text-green-300 px-4 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 shadow-[0_0_10px_rgba(34,197,94,0.1)]">

                                Price:
                                {minPriceFromUrl ? ` $${minPriceFromUrl}` : ' $0'}
                                -
                                {maxPriceFromUrl ? ` $${maxPriceFromUrl}` : ' Max'}

                                <X
                                    size={14}
                                    className="cursor-pointer hover:text-white"
                                    onClick={() =>
                                        updateFilters({
                                            minPrice: null,
                                            maxPrice: null
                                        })
                                    }
                                />
                            </span>
                        )}

                        {hasActiveFilters && (
                            <button
                                onClick={() => router.push(pathname)}
                                className="text-xs font-bold uppercase tracking-wider text-red-400 hover:text-red-300 hover:bg-red-400/10 px-3 py-1.5 rounded-lg transition-all"
                            >
                                Clear All
                            </button>
                        )}
                    </div>
                </div>





                {/* גריד המשחקים / מצבי טעינה */}
                <div >
                    {isGamesLoading ? (
                        /* שלד טעינה (Skeleton) */
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <div key={i} className="h-[380px] bg-white/[0.02] animate-pulse rounded-2xl border border-white/5" />
                            ))}
                        </div>
                    ) : gamesData?.games?.length > 0 ? (
                        /* הצגת הכרטיסים */
                        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 transition-opacity duration-300 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                            {gamesData.games.map((game) => (
                                <Card key={game.id} game={game} />
                            ))}
                        </div>
                    ) : (
                        /* הודעת "אין תוצאות" */
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
                            <Gamepad2 className="w-16 h-16 text-slate-700 mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-2">No games found</h3>
                            <p className="text-slate-400 max-w-md mb-8">Try adjusting your filters to find what you're looking for.</p>

                        </div>
                    )}
                </div>

                {/* --- דפדוף (Pagination) --- */}
                {totalPages > 1 && (
                    <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center">
                        <Pagination
                            totalPages={totalPages}
                            currentPage={pageFromUrl}
                            onPageChange={handlePageChange}
                        />
                        <div className="text-center text-xs font-medium text-slate-500 mt-4 tracking-widest uppercase">
                            Showing {gamesData?.games?.length || 0} of {totalItems} games
                        </div>
                    </div>
                )}
            </main>
        </div>
        </div>
    );
}
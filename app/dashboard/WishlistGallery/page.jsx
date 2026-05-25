"use client";
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';// Hook הזה כדי לנהל את ה-Infinite Scroll בצורה נוחה
import { useWishlistGames } from '../../hooks/useWishlist'; 
import { Loader2, StarOff } from 'lucide-react';
import Card from '../../Component/Card/Card'; // נשתמש ב-Card הקיים שלך כדי לשמור על עקביות

// הגדרות אנימציה לרשת
const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.1 }
    }
};

export default function WishlistGallery() {
    // 1. שליפת הנתונים האמיתיים מה-Hook שבנינו
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        error
    } = useWishlistGames();

    // 2. צפייה בגלילה (Infinite Scroll)
    const { ref, inView } = useInView();

    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    // 3. שיטוח הנתונים מכל הדפים למערך אחד
    const allGames = data?.pages.flatMap(page => page.games) || [];

    // מצב טעינה ראשונית
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-cyan-500 mb-4" size={48} />
                <p className="text-slate-400 animate-pulse">Loading your epic wishlist...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 p-8 text-white font-sans">
            
            {/* כותרת הדף */}
            <div className="max-w-6xl mx-auto mb-12">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                >
                    <h1 className="text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500 drop-shadow-[0_0_15px_rgba(236,72,153,0.3)]">
                        My Wishlist
                    </h1>
                    <p className="text-slate-400 mt-2 font-medium tracking-wider text-sm uppercase">
                        {allGames.length} {allGames.length === 1 ? 'Game' : 'Games'} you're tracking
                    </p>
                </motion.div>
            </div>

            {/* רשת הכרטיסיות (Grid) */}
            <div className="max-w-6xl mx-auto">
                <AnimatePresence mode='popLayout'>
                    {allGames.length > 0 ? (
                        <motion.div 
                            variants={containerVariants}
                            initial="hidden"
                            animate="show"
                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                        >
                            {allGames.map((game) => (
                                <motion.div
                                    key={game.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                                    className="relative group"
                                >
                                    {/* שימוש בקומפוננטת ה-Card המקורית שלך */}
                                    <Card game={game} />
                                    
                                    {/* פס זוהר דקורטיבי שמתאים לעיצוב ה-Wishlist */}
                                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-cyan-400 to-pink-500 w-0 group-hover:w-full transition-all duration-500 ease-out rounded-b-2xl pointer-events-none" />
                                </motion.div>
                            ))}
                        </motion.div>
                    ) : (
                        /* מצב ריק */
                        <motion.div 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center py-32 bg-slate-900/20 rounded-3xl border border-dashed border-slate-800"
                        >
                            <StarOff size={64} className="mx-auto mb-6 text-slate-700 opacity-50" />
                            <h2 className="text-2xl font-bold text-slate-500 mb-2">Your wishlist is empty</h2>
                            <p className="text-slate-600">Explore the store and save some games for later!</p>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* אלמנט ה-Trigger לטעינה נוספת */}
                <div ref={ref} className="flex justify-center py-16">
                    {isFetchingNextPage ? (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="animate-spin text-pink-500" size={32} />
                            <span className="text-xs text-slate-500 uppercase tracking-widest">Loading more...</span>
                        </div>
                    ) : hasNextPage ? (
                        <div className="h-10 w-1 bg-slate-800 rounded-full animate-bounce opacity-20" />
                    ) : allGames.length > 0 ? (
                        <p className="text-slate-600 italic text-sm">That's everything in your wishlist</p>
                    ) : null}
                </div>
            </div>
        </div>
    );
}
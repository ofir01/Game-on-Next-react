"use client";
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';// Hook הזה כדי לנהל את ה-Infinite Scroll בצורה נוחה
import { useFavoriteGames } from '../../hooks/useLibrary';
import { HeartCrack, Loader2 } from 'lucide-react';
import Card from '../../Component/Card/Card';

export default function FavoritesList() {
    const {
        data,
        isLoading,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage
    } = useFavoriteGames();

    const { ref, inView } = useInView();

    // ברגע שהאלמנט התחתון נכנס לתצוגה - תביא את העמוד הבא
    useEffect(() => {
        if (inView && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

    if (isLoading) {
        return (
            <div className="flex justify-center min-h-[400px]">
                <Loader2 className="animate-spin text-cyan-500" size={40} />
            </div>
        );
    }

    // React Query Infinite Scroll מחזיר "pages", אנחנו צריכים לשטח אותם למערך אחד
    const allGames = data?.pages.flatMap(page => page.games) || [];

    if (allGames.length === 0) {
        return (
            <div className="text-center p-8 bg-slate-900/40 rounded-2xl">
                <HeartCrack size={48} className="mx-auto mb-4 text-slate-500" />
                <h2 className="text-2xl font-bold text-white">אין לך עדיין מועדפים</h2>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-white">Favorite Games</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {allGames.map((game) => (
                    <div key={game.id} className="animate-in fade-in duration-500">
                        <Card game={game} />
                    </div>
                ))}
            </div>

            {/* האלמנט שעליו אנחנו "צופים" */}
            <div ref={ref} className="flex justify-center py-8">
                {isFetchingNextPage ? (
                    <Loader2 className="animate-spin text-cyan-500" size={32} />
                ) : hasNextPage ? (
                    <p className="text-slate-500">גלול לטעינת משחקים נוספים...</p>
                ) : (
                    <p className="text-slate-600 italic">הגעת לסוף הרשימה</p>
                )}
            </div>
        </div>
    );
}
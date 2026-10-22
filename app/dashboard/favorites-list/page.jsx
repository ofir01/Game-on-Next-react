"use client";
import { HeartCrack } from 'lucide-react';
import { useFavoriteGames } from '../../hooks/user/useLibrary';
import { useGamesPagination } from '../../hooks/games/useGamesPagination';
import GamesGrid from '../../Component/game/GamesGrid/GamesGrid';


export default function FavoritesPage() {
    const gridProps = useGamesPagination(useFavoriteGames);
    return (
        <div className="min-h-screen bg-[#070b12] bg-[radial-gradient(circle_at_top_left,rgba(239,68,68,0.1),transparent_30%),radial-gradient(circle_at_center,rgba(249,115,22,0.1),transparent_40%)] text-slate-200 font-sans pt-12 pb-12">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-8">

                {/* --- אזור הכותרת עם הגרדיאנט המקורי  --- */}
                <header className="mb-10 text-center lg:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-red-400 to-orange-500 bg-clip-text text-transparent mb-3">
                        Favorite Games
                    </h1>
                    <p className="text-slate-400 text-lg">
                        you loved
                    </p>
                </header>

                {/* --- אזור התוצאות המרכזי תוך שימוש בקומפוננטת הגריד הגנרית --- */}
                <main className="flex-1 flex flex-col min-w-1">
                    <GamesGrid
                        {...gridProps}
                        emptyIcon={HeartCrack}
                        emptyTitle="אין לך עדיין מועדפים"
                        emptyText="סמן משחקים בלב כדי לשמור אותם כאן."
                    />
                </main>

            </div>
        </div>
    );
}
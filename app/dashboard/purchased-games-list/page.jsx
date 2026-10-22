"use client";
import { usePurchasedGames } from '../../hooks/games/usePurchaseGame';
import { Gamepad2 } from 'lucide-react';
import { useGamesPagination } from '../../hooks/games/useGamesPagination';
import GamesGrid from '../../Component/game/GamesGrid/GamesGrid';

export default function PurchasedGamesPage() {
    const gridProps = useGamesPagination(usePurchasedGames);

    return (
        <div className="min-h-screen bg-[#070b12] bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.1),transparent_30%),radial-gradient(circle_at_center,rgba(99,102,241,0.1),transparent_40%)] text-slate-200 font-sans pt-12 pb-12">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-8">

                {/* --- אזור הכותרת עם הגרדיאנט המקורי והייחודי לספרייה --- */}
                <header className="mb-10 text-center lg:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-500 to-indigo-500 bg-clip-text text-transparent mb-3">
                        My Library
                    </h1>
                    <p className="text-slate-400 text-lg">
                        you own
                    </p>
                </header>

                {/* --- אזור התוצאות המרכזי תוך שימוש בקומפוננטת הגריד הגנרית --- */}
                <main className="flex-1 flex flex-col min-w-1">
                    <GamesGrid
                        {...gridProps}
                        emptyIcon={Gamepad2}
                        emptyTitle="הספרייה שלך ריקה"
                        emptyText="זה הזמן לקנות את המשחק הראשון שלך!"
                    />
                </main>

            </div>
        </div>
    );
}
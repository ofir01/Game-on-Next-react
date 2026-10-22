"use client";
import { useWishlistGames } from '../../hooks/user/useWishlist';
import { StarOff } from 'lucide-react';
import { useGamesPagination } from '../../hooks/games/useGamesPagination';
import GamesGrid from '../../Component/game/GamesGrid/GamesGrid';

export default function WishlistPage() {
const gridProps = useGamesPagination(useWishlistGames);

    return (
        <div className="min-h-screen bg-[#070b12] bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.1),transparent_30%),radial-gradient(circle_at_center,rgba(6,182,212,0.1),transparent_40%)] text-slate-200 font-sans pt-12 pb-12">
            <div className="max-w-[1600px] mx-auto px-6 lg:px-12 mt-8">

                {/* --- אזור הכותרת (מחליף את מה שהיה ב-InfiniteGamesGallery) --- */}
                <header className="mb-10 text-center lg:text-left">
                    <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-pink-500 bg-clip-text text-transparent mb-3">
                        My Wishlist
                    </h1>
                    <p className="text-slate-400 text-lg">
                        Games you're tracking
                    </p>
                </header>

                {/* --- קריאה לקומפוננטה הגנרית --- */}
                <main className="flex-1 flex flex-col min-w-1">
                    <GamesGrid
                        {...gridProps}
                        emptyIcon={StarOff}
                        emptyTitle="Your wishlist is empty"
                        emptyText="Explore the store and save some games for later!"
                    />
                </main>

            </div>
        </div>
    );
}
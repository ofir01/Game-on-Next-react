"use client";
import { Gamepad2 } from 'lucide-react';
import Card from '../Card/Card.jsx';
import Pagination from '../../Pagination/Pagination.jsx';

export default function GamesGrid({
    games = [],
    isLoading = false,
    isFetching = false,
    totalItems = 0,
    totalPages = 1,
    currentPage = 1,
    onPageChange,
    emptyTitle = "No games found",
    emptyText = "Try adjusting your filters to find what you're looking for.",
    emptyIcon: EmptyIcon = Gamepad2
}) {

    return (
        <>
            <div>
                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className="h-[380px] bg-white/[0.02] animate-pulse rounded-2xl border border-white/5" />
                        ))}
                    </div>
                ) : games?.length > 0 ? (
                    <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 transition-opacity duration-300 ${isFetching ? 'opacity-50' : 'opacity-100'}`}>
                        {games.map((game) => (
                            <Card key={game.id} game={game} />
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center bg-white/[0.02] border border-white/5 rounded-3xl">
                        <EmptyIcon className="w-16 h-16 text-slate-700 mb-6" />
                        <h3 className="text-2xl font-bold text-white mb-2">{emptyTitle}</h3>
                        <p className="text-slate-400 max-w-md mb-8">{emptyText}</p>
                    </div>
                )}
            </div>

            {totalPages > 1 && (
                <div className="mt-8 pt-8 border-t border-white/5 flex flex-col items-center">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        onPageChange={onPageChange}
                    />
                    <div className="text-center text-xs font-medium text-slate-500 mt-4 tracking-widest uppercase">
                        Showing {games?.length || 0} of {totalItems} games
                    </div>
                </div>
            )}
        </>
    );
}
"use client";
import { useState } from 'react';

// =========================================
// דפדוף עם עמודים (Pagination) 
// =========================================
// ההוק מקבל כפרופ את פונקציית שליפת הנתונים הספציפית
export function useGamesPagination(useQueryHook) {
    const [currentPage, setCurrentPage] = useState(1);
    
    // הפעלת ההוק שהתקבל מבחוץ
    const { data, isLoading, isFetching } = useQueryHook(currentPage);

    // חילוץ הנתונים
    const games = data?.games || data || [];
    const pagination = data?.pagination || {};
    const totalItems = pagination.totalItems || games.length;
    const totalPages = pagination.totalPages || 1;

    // פונקציית מעבר עמוד
    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // החזרת כל הנתונים בדיוק במבנה ש-GamesGrid מצפה לקבל
    return {
        games,
        isLoading,
        isFetching,
        totalItems,
        totalPages,
        currentPage,
        onPageChange: handlePageChange
    };
}

'use client'; // חובה ב-Next.js עבור שימוש ב-Hooks

import React from 'react';
import { Star } from 'lucide-react'; 
import { useUserRating } from '../../hooks/user/useUserRating';
import { useParams } from 'next/navigation';

export default function AverageStars() {
    const { Slug } = useParams();
    
    const { userRating, isLoading } = useUserRating(Slug);

    // ברירת מחדל לאובייקט הנתונים כדי למנוע שגיאות undefined
    const ratingStats = userRating?.stats || { average: 0, count: 0 };

    // ==========================================
    // עיצוב מצב טעינה (Skeleton Loader)
    // ==========================================
    if (isLoading) {
        return (
            <div className="bg-[#161b22] p-6 rounded-3xl border border-gray-800 mb-4 animate-pulse">
                <div className="flex flex-col items-center gap-4 py-4">
                    {/* מדמה את המספר הגדול */}
                    <div className="h-14 w-20 bg-gray-700/50 rounded-xl" />
                    {/* מדמה את שורת הכוכבים */}
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-5 h-5 bg-gray-700/50 rounded-full" />
                        ))}
                    </div>
                    {/* מדמה את טקסט הספירה */}
                    <div className="h-4 w-32 bg-gray-700/30 rounded-md" />
                </div>
            </div>
        );
    }

    // ==========================================
    // התצוגה המרכזית
    // ==========================================
    return (
        <div className="bg-gradient-to-br from-[#1c2128] to-[#0d1117] p-6 rounded-3xl border border-gray-800 shadow-xl mb-4">
            <div className="flex items-center justify-center flex-col gap-2 py-4">
                
                {/* הציון הממוצע - הגדלתי מעט את הפונט ונתתי לו צבע לבן נקי */}
                <div className="relative">
                    <span className="text-6xl font-black text-white tracking-tighter">
                        {ratingStats.average > 0 ? ratingStats.average : "0"}
                    </span>
                </div>

                {/* תצוגת הכוכבים - דינאמית לפי הממוצע */}
                <div className="flex gap-1.5 mt-1">
                    {[1, 2, 3, 4, 5].map(star => {
                        const isFull = star <= Math.round(ratingStats.average);
                        return (
                            <Star
                                key={star}
                                size={22}
                                className={`${
                                    isFull 
                                    ? 'fill-yellow-400 text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]' 
                                    : 'text-gray-700'
                                } transition-all duration-300`}
                            />
                        );
                    })}
                </div>

                {/* ספירת המצביעים */}
                <div className="mt-3 flex items-center gap-2">
                    <div className="h-[1px] w-8 bg-gray-800" />
                    <span className="text-gray-500 text-xs font-medium uppercase tracking-widest">
                        {ratingStats.count.toLocaleString()} Ratings
                    </span>
                    <div className="h-[1px] w-8 bg-gray-800" />
                </div>
            </div>
        </div>
    );
}
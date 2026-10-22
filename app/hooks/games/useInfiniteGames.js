"use client";

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../Context/AuthContext';

// =========================================
// Hook גנרי לטעינת רשימות משחקים עם דפדוף (Pagination) דפדוף ללא כפתורים
// =========================================
export const useInfiniteGames = (queryKeyPrefix, fetchFunction, page) => {
    const { user } = useAuth();

    return useQuery({
        // ככה כל עמוד נשמר ב-Cache בנפרד, ומעבר בין עמודים יהיה סופר מהיר
        queryKey: [queryKeyPrefix, user?.id, page],
        
        // הפועל המשתנה שמועבר כפרמטר, עכשיו מקבל את העמוד ישירות
        queryFn: () => fetchFunction(page),
        
        // מריץ את השאילתה רק כשהמשתמש מחובר
        enabled: !!user, 
        //  שומרת את הנתונים הישנים בזמן שהעמוד החדש נטען 
        // (מונע "קפיצות" של המסך והעלמות של הגריד בזמן מעבר עמוד)
        keepPreviousData: true, 
    });
};
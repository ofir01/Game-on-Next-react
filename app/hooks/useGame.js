"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gameService } from '../../services/client/gameService';
import { toast } from 'sonner';


export const useGameActions = () => {
    const queryClient = useQueryClient();

    //עדכון
    const updateGameMutation = useMutation({
        // 1. הפונקציה שקוראת ל-API (PUT)
        mutationFn: (data) => gameService.update(data),

        // 2. בזמן שהבקשה נשלחת 
        // onMutate: async (updatedGame) => { return { updatedGame }; },

        // 3. במידה והעדכון נכשל
        onError: (error) => { toast.error(`שגיאה בעדכון: ${error?.message}`); },

        // 4. במידה והעדכון הצליח
        onSuccess: () => { toast.success('המשחק עודכן בהצלחה במערכת'); },

        // 5. הסיום של הבקשה (בין אם הצליחה או נכשלה)
        // כאן אומרים לכל השאילתות שהנתונים שלהן כבר לא רלוונטיים
        onSettled: async () => { await queryClient.invalidateQueries(); },

    });

    //מחיקה
    const deleteGameMutation = useMutation({
        // 1. הפונקציה שקוראת ל-API למחיקה
        mutationFn: (gameId) => gameService.delete(gameId),
        // 2. במידה והמחיקה נכשלה
        onError: (error) => { toast.error(`שגיאה במחיקה: ${error?.message}`); },
        // 3. במידה והמחיקה הצליחה
        onSuccess: () => { toast.success('המשחק הוסר בהצלחה מהמערכת'); },
        // 4. ריענון השאילתות הרלוונטיות
        onSettled: async () => { await queryClient.invalidateQueries(); },

    });


    return {
        updateGame: updateGameMutation.mutate,
        deleteGame: deleteGameMutation.mutate,
        deleteIsPending: deleteGameMutation.isPending
    };

};



//עמוד פרטי המשחק
export const useGameSlug = (filters = {}) => {
    return useQuery({
        // המפתח כולל את הפילטרים - ברגע שהם משתנים, נשלחת בקשה חדשה
        queryKey: ['GameSlug', filters],
        queryFn: () => gameService.getGameSlug(filters),
        refetchOnWindowFocus: false, // מבטל שליחת בקשה כשחוזרים ללשונית/דפדפן
    });
};





//החיפוש
export const useGameSearch = (searchQuery) => {
    return useQuery({
        // המפתח הייחודי של השאילתה - משתנה בכל פעם ש-searchQuery משתנה
        queryKey: ['gameSearch', searchQuery],

        // הפונקציה שמבצעת את הקריאה בפועל
        queryFn: () => gameService.getGameById(searchQuery),

        // הגדרות חשובות לחוויית משתמש (UX) חלקה:

        // זמן שמירת הנתונים בזיכרון (Cache) לפני בקשה חוזרת
        //staleTime: 1000 * 60 * 5, // 5 דקות

        // שומר על התוצאות הקודמות על המסך בזמן שהתוצאות החדשות נטענות ברקע.
        // זה מונע מצב שהתפריט הנפתח נעלם ומופיע מחדש בכל הקלדת אות.
        // (הערה: אם אתה משתמש ב-React Query v5, המאפיין הוא placeholderData: keepPreviousData)
        keepPreviousData: true,
    });
};




//עמוד חיפוש מתקדם
export const useAdvancedGameSearch = (filters) => {
    return useQuery({
        // המפתח פה הוא מערך שכולל את *כל* הפילטרים. 
        // ברגע שאחד מהם (נניח page או sort) משתנה, React Query יזרוק בקשה חדשה לשרת
        queryKey: ['advancedGames', filters],

        queryFn: () => gameService.advancedSearch(filters),

        // UX קריטי לעמוד חיפוש: 
        // משאיר את המשחקים הקודמים על המסך (ולא מעלים אותם למצב "טעינה") 
        // בזמן שהמשחקים של העמוד הבא או הפילטר החדש נטענים ברקע.
        keepPreviousData: true,
    });
};



//עמוד הבית
export const useHomeData = () => {
    return useQuery({
        queryKey: ['homeGames'],

        // כל הנתונים של עמוד הבית מגיעים מכאן במקום fetch ידני בתוך הקומפוננטה
        queryFn: () => gameService.getHomeSections(),

        // אם השליפה נכשלת, העמוד יקבל undefined ויציג מבנה ריק במקום לקרוס
        retry: 1,
        staleTime: 1000 * 60 * 5, // נתוני עמוד בית נשמרים ל-5 דקות
    });
};




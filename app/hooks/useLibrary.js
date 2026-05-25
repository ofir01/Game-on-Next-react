"use client";
import { useQuery, useMutation, useQueryClient,useInfiniteQuery } from '@tanstack/react-query';
import { useAuth } from '../Context/AuthContext';
import { libraryService } from '../../services/client/libraryService';

export const useLibrary = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth(); // שליפת נתוני המשתמש כדי לדעת למי לשייך את המידע

    // 1. שליפת הספרייה האישית (GET)
    const { data: library = {}, isLoading } = useQuery({
        // המפתח כולל את ה-userId כדי למנוע ערבוב נתונים בין משתמשים שונים במחשב אחד
        queryKey: ['userLibrary', user?.id],
        queryFn: () => libraryService.getLibrary(),// ללא פרמטרים נוספים, נקבל את המפה הקטנה והמהירה   
        //queryFn: libraryService.getLibrary,// עם הפרמטר includeGames=true נקבל את רשימת המשחקים המלאה עם כל הפרטים (למשתמשים עם הרבה משחקים זה יכול להיות איטי יותר)
        // הבקשה תתבצע רק אם המשתמש מחובר
        enabled: !!user,
        // הנתונים ייחשבו "טריים" למשך 30 דקות (חוסך בקשות HTTP מיותרות)
        staleTime: 1000 * 60 * 30,
    });

    // 2. עדכון נתונים (מועדפים/דירוג) עם מנגנון עדכון אופטימי
    const mutation = useMutation({
        mutationFn: libraryService.toggleGameStatus,

        // שלב א': מתבצע מיד עם הלחיצה (לפני שהשרת ענה)
        onMutate: async (newUpdate) => {
            // ביטול שאילתות קיימות במידע הספציפי הזה כדי למנוע דריסת נתונים
            await queryClient.cancelQueries({ queryKey: ['userLibrary', user?.id] });

            // שמירת המצב הנוכחי למקרה שהעדכון ייכשל ונצטרך לשחזר (Rollback)
            const previousLibrary = queryClient.getQueryData(['userLibrary', user?.id]);

            // עדכון המטמון באופן מיידי בזיכרון של הדפדפן
            queryClient.setQueryData(['userLibrary', user?.id], (old) => ({
                ...old,
                [newUpdate.gameId]: {
                    ...(old?.[newUpdate.gameId] || {}), // שמירה על ערכים קיימים
                    ...newUpdate, // הזרקת הערכים החדשים (למשל הלב האדום)
                },
            }));

            // החזרת המצב הקודם ל-Context של המוטציה
            return { previousLibrary };
        },

        // שלב ב': במקרה של שגיאה בשרת
        onError: (error, newUpdate, context) => {
            // החזרת המצב לקדמותו (למשל ביטול צביעת הלב)
            if (context?.previousLibrary) {
                queryClient.setQueryData(['userLibrary', user?.id], context.previousLibrary);
            }
        },

        // שלב ג': בסיום הפעולה (הצלחה או כישלון)
        onSettled: () => {
            // 1. מרענן את המפה (בשביל הלבבות בכל האתר)
            queryClient.invalidateQueries({ queryKey: ['userLibrary', user?.id] });

            // 2. מרענן גם את נתוני המועדפים המלאים (בשביל דף המועדפים)
            queryClient.invalidateQueries({ queryKey: ['favoriteGamesData', user?.id] });
        },
    });

    // הפונקציות והערכים שיהיו זמינים לשימוש בקומפוננטות
    return {
        library, // האובייקט המלא של המועדפים
        isLoading, // האם הנתונים בטעינה ראשונית
        // פונקציית עזר לבדיקה אם משחק מועדף
        isFavorite: (id) => !!library[id]?.isFavorite,
        // פונקציית עזר לשליפת הדירוג
        getRating: (id) => library[id]?.rating || 0,
        // פונקציית עזר לשליפת הסטטוס (Backlog, Playing וכו')
        getStatus: (id) => library[id]?.status || 'Backlog',
        // הפונקציה לביצוע השינוי בפועל
        updateGame: mutation.mutate,
    };
};





export const useFavoriteGames = () => {
    const { user } = useAuth();

    return useInfiniteQuery({
        queryKey: ['favoriteGamesData', user?.id], //  מפתח שונה כדי שלא יתערבב עם המפה הרגילה 
        queryFn: ({ pageParam = 1 }) => libraryService.getLibrary(true, pageParam),
        enabled: !!user,
        getNextPageParam: (lastPage, allPages) => {
            // אם יש עוד דפים, נחזיר את מספר העמוד הבא
            return lastPage.hasNextPage ? allPages.length + 1 : undefined;
        },
        initialPageParam: 1,
    });
};
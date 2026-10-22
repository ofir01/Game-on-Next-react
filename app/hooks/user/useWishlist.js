"use client";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../Context/AuthContext';
import { wishlistService } from '../../../services/client/wishlistService'; 
import { useInfiniteGames } from '../games/useInfiniteGames';


// =========================================
// 1. Hook לניהול רשימת המשאלות של המשתמש (הוספה/הסרה, בדיקה אם קיים)
// =========================================
export const useWishlist = () => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    // 1. שליפת מפת רשימת המשאלות (GET)
    // מחזיר אובייקט במבנה של { [gameId]: { isInWishlist: true } } לגישה מהירה ב-O(1)
    const { data: wishlist = {}, isLoading } = useQuery({
        queryKey: ['userWishlist', user?.id],
        queryFn: () => wishlistService.getWishlist(),
        enabled: !!user,
        staleTime: 1000 * 60 * 30, // 30 דקות של שקט מהשרת
    });

    // 2. הוספה/הסרה (Toggle) עם עדכון אופטימי מטורף
    const mutation = useMutation({
        mutationFn: (gameId) => wishlistService.toggleWishlist(gameId),

        onMutate: async (gameId) => {
            // ביטול שאילתות רצות כדי שלא ידרסו את העדכון האופטימי
            await queryClient.cancelQueries({ queryKey: ['userWishlist', user?.id] });

            // שמירת המצב הנוכחי לגיבוי (במקרה של שגיאה)
            const previousWishlist = queryClient.getQueryData(['userWishlist', user?.id]);

            // עדכון המטמון באופן מיידי
            queryClient.setQueryData(['userWishlist', user?.id], (old = {}) => {
                const isCurrentlyIn = !!old[gameId];
                
                // אם המשחק קיים - נסיר אותו, אם לא - נוסיף
                const newWishlist = { ...old };
                if (isCurrentlyIn) {
                    delete newWishlist[gameId];
                } else {
                    newWishlist[gameId] = { isInWishlist: true, addedAt: new Date().toISOString() };
                }
                return newWishlist;
            });

            return { previousWishlist };
        },

        // במקרה של שגיאה בשרת - החזרת המצב לקדמותו
        onError: (err, gameId, context) => {
            if (context?.previousWishlist) {
                queryClient.setQueryData(['userWishlist', user?.id], context.previousWishlist);
            }
        },

        // בסיום - רענון נתונים מהשרת לוודא סנכרון מושלם
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['userWishlist', user?.id] });
            queryClient.invalidateQueries({ queryKey: ['wishlistGamesData', user?.id] });
        },
    });

    return {
        wishlist,
        isLoading,
        // פונקציית עזר לבדיקה האם המשחק ברשימת המשאלות
        isInWishlist: (gameId) => !!wishlist[gameId],
        // הפונקציה לביצוע השינוי (Add/Remove)
        toggleWishlist: mutation.mutate,
        isToggling: mutation.isLoading
    };
};


//=========================================
// 2. Hook לשליפת רשימת המשאלות המלאה (עבור דף רשימת המשאלות)
// * כולל תמיכה ב-Infinite Scroll (טעינה אינסופית)
//=========================================
export const useWishlistGames = (page = 1) => {
    return useInfiniteGames('wishlistGamesData', (pageParam) => wishlistService.getWishlistGames(pageParam),page);
};
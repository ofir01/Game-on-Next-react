"use client";

import { useMutation, useQuery, useQueryClient,keepPreviousData } from '@tanstack/react-query';
import { PurchaseGame } from '../../../services/client/PurchaseGame';
import { useInfiniteGames } from './useInfiniteGames';


// =========================================
// 1. Hook לביצוע רכישת משחק
// =========================================
export const usePurchaseGame = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (data) => PurchaseGame.create(data),

        // variables מכיל בדיוק את האובייקט שנשלח מ-purchaseGame בקומפוננטה
        onSuccess: (response, variables) => {
            // זה יגרום ל-React Query לרענן אוטומטית רק את הכפתור שמאזין למשחק הזה!
            queryClient.invalidateQueries({ queryKey: ['PurchaseGame', variables.gameId] });
            queryClient.invalidateQueries({ queryKey: ['user-PurchaseGame'] });
        },
    });

    return {
        purchaseGame: mutation.mutate, // הפונקציה שמפעילה את הרכישה
        isPurchasing: mutation.isPending, // מחזיר true בזמן שהבקשה נשלחת לשרת
        isSuccess: mutation.isSuccess, // מחזיר true אם הרכישה הצליחה
        isError: mutation.isError,
        error: mutation.error
    };
};

// =========================================
// 2. Hook לשליפת סטטוס תשלום על משחק (האם המשתמש כבר קנה)
// =========================================
export const useGetPaymentStatus = (gameId, isPaid, isReleased, isAvailable, user) => {
    return useQuery({
        queryKey: ['PurchaseGame', gameId],
        queryFn: () => PurchaseGame.get(gameId),
        // ה-Hook ירוץ לשרת *רק* אם קיים מזהה משחק והמשחק זמין לרכישה ושוחרר והמשתמש מחובר(כדי למנוע קריאות מיותרות לשרת)
        enabled: !!gameId && isPaid && !!user && isReleased && isAvailable,

    });
};



// =========================================
// 3. Hook לשליפת רשימת המשחקים שהמשתמש קנה (הספרייה שלו)
// * כולל תמיכה ב-Infinite Scroll (טעינה אינסופית)
// =========================================
export const usePurchasedGames = (page = 1) => {
    return useInfiniteGames('purchasedGamesData', (pageParam) =>  PurchaseGame.getUserPurchasedGames(pageParam), page);
};












// =========================================
// 4. Hook לשליפת כל הרכישות למסך מנהל (כולל סינונים ועימוד)
// ה-API אמור להחזיר אובייקט עם: { purchases, totalPages, totalItems, stats }
// =========================================
export const useAdminPurchases = (filters, page) => {
    return useQuery({
        // ה-queryKey כולל את כל הפילטרים והעמוד. ברגע שאחד מהם משתנה, React Query ימשוך נתונים חדשים אוטומטית
        queryKey: ['adminPurchases', filters, page],
        queryFn: () => PurchaseGame.getAllPurchases({ ...filters, page }),
        
        // שומר על הנתונים הישנים בזמן מעבר עמוד כדי למנוע הבהוב של המסך 
        //keepPreviousData: true, 
        placeholderData: keepPreviousData, // התחביר החדש למניעת הבהובים במעבר עמוד!
    });
};

// =========================================
// 5. Hook לביצוע זיכוי למשתמש
// =========================================
export const useAdminRefundPurchase = () => {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (purchaseId) => PurchaseGame.refundPurchase(purchaseId),

        onSuccess: () => {
            // ברגע שהזיכוי מצליח, אנחנו אומרים ל-React Query לרענן את טבלת המנהל
            // זה יעדכן אוטומטית את הסטטוס ל"זוכה" וירענן את כרטיסיות הסטטיסטיקה למעלה!
            queryClient.invalidateQueries({ queryKey: ['adminPurchases'] });
            
            // כדאי גם לרענן את הרכישות של המשתמשים כדי שאם המשתמש המזוכה מחובר, המשחק יעלם לו
            queryClient.invalidateQueries({ queryKey: ['user-PurchaseGame'] });
        },
    });

    return {
        refundPurchase: mutation.mutateAsync, // נשתמש ב-mutateAsync כדי שנוכל לחכות לתוצאה בקומפוננטה (עם await)
        isRefunding: mutation.isPending,      // מחזיר true בזמן שהזיכוי נשלח לשרת
        isSuccess: mutation.isSuccess,
        error: mutation.error
    };
};
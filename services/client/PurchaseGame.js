import { api } from '../../lib/api-client';

export const PurchaseGame = {
    // ביצוע רכישת משחק
    create: (data) => api.post(`/api/payments/process`, data),
    // שליפת סטטוס תשלום עבור משחק מסוים למשתמש
    get: (gameId) => api.get(`/api/payments/process?gameId=${gameId}`),
    // שליפת רשימת המשחקים שהמשתמש רכש (הספרייה) עם תמיכה בעמודים
    getUserPurchasedGames: (page = 1) => api.get(`/api/user/process?page=${page}`),

    // שליפת כל הרכישות/קבלות עם פילטרים ועמודים (למסך מנהל)
    // הפונקציה מקבלת אובייקט עם כל הפילטרים האפשריים, כולל page, limit, transactionId, username, gameName, startDate, endDate
    getAllPurchases: (params) => {
        // מנקים ערכים ריקים כדי שה-URL יהיה נקי
        const cleanParams = Object.fromEntries(
            Object.entries(params).filter(([_, value]) => value != null && value !== '')
        );

        // בונים את ה-Query String (למשל: page=1&username=dan)
        const queryString = new URLSearchParams(cleanParams).toString();

        // מעבירים את הנתיב המלא יחד עם הפרמטרים
        return api.get(`/api/admin/purchases?${queryString}`);
    },

    // 2. ביצוע זיכוי רכישה לפי מזהה
    refundPurchase: (purchaseId) => api.delete(`/api/admin/purchases/${purchaseId}`),
};
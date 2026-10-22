import { api } from '../../lib/api-client';

export const wishlistService = {
    /**
     * שליפת רשימת המשאלות.
     * בדומה ל-Library:
     * - ללא פרמטרים: יחזיר "מפה" מהירה של IDs לבדיקת סטטוס (O(1)).
     * - עם includeGames: יחזיר את נתוני המשחקים המלאים עבור דף ה-Wishlist.
     */
    getWishlist: (includeGames = false, page = 1) =>
        api.get(`/api/user/wishlist?page=${page}${includeGames ? '&includeGames=true' : ''}`),

    /**
     * הוספה או הסרה של משחק מרשימת המשאלות (Toggle).
     * @param {string} gameId - מזהה המשחק.
     * השרת יזהה אם המשחק כבר קיים ויבצע את הפעולה ההפוכה.
     */
    toggleWishlist: (gameId) =>
        api.post(`/api/user/wishlist`, { gameId }),

    /**
     * פונקציית עזר למשיכת המשחקים המלאים (עבור ה-Infinite Query ב-Hook).
     */
    getWishlistGames: (page = 1) => api.get(`/api/user/wishlist?includeGames=true&page=${page}`),
};
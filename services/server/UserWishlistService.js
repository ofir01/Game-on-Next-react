
const db = require('../../db/models');

import { fetchPaginatedGames } from './gameQueries';







/**
 * UserWishlistService
 * אחראי על רשימת המשאלות של המשתמש - משחקים שהוא מצפה להם או רוצה לקנות
 */
export const UserWishlistService = {

    // 1. שליפת רשימת המשחקים המלאה (עבור דף הווישליסט)
    getWishlist: async (userId, page, limit, offset) => {
        return fetchPaginatedGames({
            queryOptions: {
                include: [{
                    model: db.Wishlist,
                    as: 'wishlists',
                    where: { userId },
                    attributes: [],
                    required: true
                }]
            },
            page, limit, offset
        });
    },

    // 2. שליפת מפת הווישליסט (לשימוש ב-Hook בכל האתר)
    getMap: async (userId) => {
        const wishlistItems = await db.Wishlist.findAll({
            where: { userId },
            attributes: ['gameId'],
            raw: true
        });

        const wishlistMap = {};
        wishlistItems.forEach(item => {
            wishlistMap[item.gameId] = {
                isInWishlist: true
            };
        });
        return wishlistMap;
    },

    // 3. ביצוע Toggle (הוספה/הסרה)
    toggle: async (userId, gameId) => {
        // מחפשים אם המשחק כבר נמצא בווישליסט
        const existing = await db.Wishlist.findOne({
            where: { userId, gameId }
        });

        if (existing) {
            // אם קיים - מסירים
            await existing.destroy();
            return { gameId, isInWishlist: false };
        } else {
            // אם לא קיים - יוצרים
            await db.Wishlist.create({
                userId,
                gameId
            });
            return { gameId, isInWishlist: true };
        }
    }
};
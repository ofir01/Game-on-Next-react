
const db = require('../../db/models');
const { Op } = require('sequelize');

import { formatGameCard } from '../../utils/gameCard';
import {  getHardQuery } from './gameQueries';

/**
 * UserWishlistService
 * אחראי על רשימת המשאלות של המשתמש - משחקים שהוא מצפה להם או רוצה לקנות
 */
export const UserWishlistService = {

    // 1. שליפת רשימת המשחקים המלאה (עבור דף הווישליסט)
    get: async (userId, limit = 12, offset = 0) => {
        // שלב א': שליפת ה-IDs של המשחקים בווישליסט קודם
        // זה פותר את בעיית ה-Association וגם יותר מהיר בביצועים
        const wishlistEntries = await db.Wishlist.findAll({
            where: { userId },
            attributes: ['gameId'],
            raw: true
        });

        const gameIds = wishlistEntries.map(entry => entry.gameId);

        if (gameIds.length === 0) {
            return { games: [], totalItems: 0, hasNextPage: false };
        }

        // שלב ב': שליפת המשחקים עצמם לפי ה-IDs
        const { count, rows } = await db.Games.findAndCountAll({
            ...getHardQuery(),
            where: {
                id: { [Op.in]: gameIds }
            },
            limit: parseInt(limit),
            offset: parseInt(offset),
            distinct: true,
            // אם אתה רוצה למיין לפי מתי זה נוסף לווישליסט, 
            // כרגע נשתמש במיון רגיל כדי לוודא שזה עובד
            order: [['createdAt', 'DESC']]
        });

        return {
            games: rows.map(formatGameCard),
            totalItems: count,
            hasNextPage: offset + rows.length < count
        };
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
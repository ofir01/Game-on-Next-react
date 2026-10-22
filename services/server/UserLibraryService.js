
const db = require('../../db/models');
import { fetchPaginatedGames } from './gameQueries';

/**
 * UserLibraryService
 * אחראי על האזור האישי של המשתמש: מועדפים, דירוגים שנתן, משאלות (Wishlist בעתיד)
 */
export const UserLibraryService = {
    // שליפת רשימת המשחקים המועדפים של המשתמש עם תמיכה בדף וגבול פריטים
    getFavorites: async (userId, page, limit, offset) => {
        return fetchPaginatedGames({
            queryOptions: {
                include: [{
                    model: db.UserGame,
                    as: 'userStatus',
                    where: { userId, isFavorite: true },
                    attributes: [],
                    required: true
                }]
            },
            page, limit, offset
        });
    },

    // שליפת מפת הספרייה של המשתמש (רזה, רק סטטוס ודירוג לכל משחק)
    getMap: async (userId) => {
        const userGames = await db.UserGame.findAll({
            where: { userId },
            attributes: ['gameId', 'isFavorite', 'rating', 'status'],
            raw: true
        });

        const libraryMap = {};
        userGames.forEach(item => {
            libraryMap[item.gameId] = {
                isFavorite: item.isFavorite,
                rating: item.rating,
                status: item.status
            };
        });
        return libraryMap;
    },

    // עדכון סטטוס או דירוג של משחק בספרייה של המשתמש
    update: async (userId, { gameId, isFavorite, rating }) => {
        const [userGame, created] = await db.UserGame.findOrCreate({
            where: { userId, gameId },
            defaults: {
                isFavorite: isFavorite || false,
                rating: rating || null
            }
        });

        if (!created) {
            if (isFavorite !== undefined) userGame.isFavorite = isFavorite;
            if (rating !== undefined) userGame.rating = rating;
            await userGame.save();
        }

        return {
            gameId,
            isFavorite: userGame.isFavorite,
            rating: userGame.rating
        };
    }
};
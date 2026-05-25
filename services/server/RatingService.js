
const db = require('../../db/models');
import { getAvgRatingLiteral, getTotalReviewsLiteral } from './gameQueries';

// פונקציית עזר פרטית לפרמוט התשובה (במקום reviewToNestedComments)
const formatRatingResponse = (userRatingObj, gameData) => {
    return {
        userRating: userRatingObj?.rating || 0,
        stats: {
            average: parseFloat(gameData.avgRating || 0).toFixed(1),
            count: parseInt(gameData.totalReviews || 0)
        }
    };
}


export const RatingService = {
    // שליפת נתוני משחק ודירוג אישי של משתמש
    get: async (slug, userId) => {
        const game = await db.Games.findOne({
            where: { title: slug },
            attributes: {
                include: [getAvgRatingLiteral(), getTotalReviewsLiteral()]
            },
            raw: true
        });

        if (!game) return { error: 'NOT_FOUND' };

        let userRating = { rating: 0 };
        if (userId) {
            userRating = await db.UserGame.findOne({
                where: { gameId: game.id, userId: userId },
                attributes: ['rating'],
                raw: true
            }) || { rating: 0 };
        }

        return {
            success: true,
            data: formatRatingResponse(userRating, game)
        };
    },

    // עדכון או יצירת דירוג חדש
    update: async (slug, userId, newRatingValue) => {
        const user = await db.User.findByPk(userId);
        if (!user) return { error: 'USER_NOT_FOUND' };
        const game = await db.Games.findOne({ where: { title: slug } });
        if (!game) return { error: 'NOT_FOUND' };

        // ביצוע ה-Upsert
        const [ratingRecord] = await db.UserGame.upsert({
            userId: userId,
            gameId: game.id,
            rating: newRatingValue,
        });

        // שליפה מחדש של הנתונים המעודכנים (ממוצע וספירה)
        const updatedGame = await db.Games.findOne({
            where: { id: game.id },
            attributes: {
                include: [getAvgRatingLiteral(), getTotalReviewsLiteral()]
            },
            raw: true
        });

        return {
            success: true,
            data: formatRatingResponse(ratingRecord, updatedGame)
        };
    }
};
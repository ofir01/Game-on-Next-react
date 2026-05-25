import { NextResponse } from 'next/server';
import { GameService } from '../../../../services/server/GameService';



export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const sections = searchParams.get('sections')?.split(',') || ['carousel', 'trending', 'topRated'];

        const CarouselLimit = 5;
        const TrendingLimit = 8;
        const TopRatedLimit = 8;
        const CategoryLimit = 5;
        const UpcomingLimit = 4;
        // מיפוי בין הבקשה לפונקציה ב-Service
        const serviceMap = {
           carousel: () => GameService.getCarouselGames(CarouselLimit),
            trending: () => GameService.getTrendingGames(TrendingLimit),
            topRated: () => GameService.getTopRatedGames(TopRatedLimit),
            stats: () => GameService.getHomeStats(),
            categories: () => GameService.getCategoryHighlights(CategoryLimit),
            upcoming: () => GameService.getUpcomingGames(UpcomingLimit),
        };

        const response = {};

        // הרצה מקבילית של כל השאילתות שנתבקשו
        await Promise.all(
            sections.map(async (key) => {
                if (serviceMap[key]) {
                    // כאן אנחנו מפעילים את הפונקציה ומחכים לה (await)
                    response[key] = await serviceMap[key]();
                }
            })
        );

        return NextResponse.json(response);

    } catch (error) {
        console.error('Dynamic Home API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}










/*import { NextResponse } from 'next/server';
import { getAvgRatingLiteral, getCommonInclude } from '../../../../public/utils/game-queries';
const db = require('../../../../models');

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const sections = searchParams.get('sections')?.split(',') || ['carousel', 'trending', 'topRated'];



       

        const queryMap = {
            // 1. משחקים לקרוסלה (5 אחרונים)
            carousel: () => db.Games.findAll({
                limit: 5,
                attributes: { include: [getAvgRatingLiteral()] },
                include: getCommonInclude(),
                order: [['updatedAt', 'DESC']],
                distinct: true
            }),

            // 2. משחקים טרנדיים (לפי כמות משחקים)
            trending: () => db.Games.findAll({
                limit: 8,
                attributes: { include: [getAvgRatingLiteral()] },
                include: getCommonInclude(),
                order: [[{ model: db.GamePlayStats, as: 'stats' }, 'playCount', 'DESC']],
                distinct: true
            }),

            // 3. הכי מדורגים (לפי ממוצע הדירוגים)
            topRated: () => db.Games.findAll({
                limit: 8,
                attributes: { include: [getAvgRatingLiteral()] },
                include: getCommonInclude(),
                // מיון לפי ה-alias שיצרנו ב-literal
                order: [[db.sequelize.literal('avgRating DESC')]],
                distinct: true
            }),



        };

        // הרצת השאילתות שנבחרו
        const requestedQueries = sections.map(key => {
            if (queryMap[key]) {
                return queryMap[key]().then(data => ({ key, data }));
            }
            return Promise.resolve({ key, data: [] });
        });

        const resultsArray = await Promise.all(requestedQueries);

        // בניית התשובה הסופית
        const response = resultsArray.reduce((acc, { key, data }) => {
            acc[key] = data;
            return acc;
        }, {});

        return NextResponse.json(response);

    } catch (error) {
        console.error('Dynamic Home API Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            details: error.message
        }, { status: 500 });
    }
}
    */

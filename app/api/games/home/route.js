import { NextResponse } from 'next/server';
import { GameService } from '../../../../services/server/GameService';

//  הסקשנים שהעמוד צריך מהשרת כדי לבנות את כל הבית ממקור אחד.
export async function GET(req) {
    try {

        const TrendingLimit = 6;
        const TopRatedLimit = 3;
        const CategoryLimit = 5;
        const UpcomingLimit = 4;
        // מיפוי פשוט בין שם הסקשן לבין השאילתה שמביאה אותו מה-DB
        const serviceMap = {
            trending: () => GameService.getTrendingGames(TrendingLimit),
            topRated: () => GameService.getTopRatedGames(TopRatedLimit),
            stats: () => GameService.getHomeStats(), // סטטיסטיקות כלליות של הפלטפורמה
            categories: () => GameService.getCategoryHighlights(CategoryLimit),// מביא קטגוריות עם משחקים מובילים בכל קטגוריה
            upcoming: () => GameService.getUpcomingGames(UpcomingLimit),// משחקים שצפויים לצאת בקרוב, עם תאריך השקה קרוב
        };

        const response = Object.fromEntries(
            await Promise.all(
                Object.entries(serviceMap).map(async ([key, fn]) => {
                    return [key, await fn()];
                })
            )
        );


        return NextResponse.json(response);

    } catch (error) {
        console.error('Dynamic Home API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}





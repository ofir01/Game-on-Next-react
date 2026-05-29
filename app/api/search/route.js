
import { NextResponse } from 'next/server';
import { GameService } from '../../../services/server/GameService';


//הפעולה של ה-API שמטפלת בבקשות חיפוש למשחקים וקטגוריות
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q') || '';
        const limit = 4;
        // מצב 1: חיפוש ריק
        if (!q.trim()) {
            const popularGames = await GameService.getTrendingGames(limit); // שליפת 4 המשחקים הפופולריים ביותר
            return NextResponse.json({
                games: popularGames,
                categories: []
            }, { status: 200 });
        }


        // מצב 2: יש טקסט בחיפוש 
        // אופטימיזציה: מריצים את שתי השאילתות במקביל (במקום לחכות שאחת תסתיים ואז להתחיל את השנייה)
        const [searchGames, searchCategories] = await Promise.all([
            GameService.searchGames(q, limit),
            GameService.searchCategories(q, limit)
        ]);

        return NextResponse.json({
            games: searchGames,
            categories: searchCategories
        }, { status: 200 });

    } catch (error) {
        console.error("Search API Error:", error);
        return NextResponse.json({ error: "Failed to perform search" }, { status: 500 });
    }
}


















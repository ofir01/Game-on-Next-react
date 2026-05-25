import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { UserLibraryService } from '../../../../services/server/UserLibraryService';

// GET: שליפת נתוני ספרייה
export async function GET(req) {
    try {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const includeGames = searchParams.get('includeGames') === 'true';

        const page = parseInt(searchParams.get('page')) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;

        if (includeGames) {
            const result = await UserLibraryService.get(userId, limit, offset);
            return NextResponse.json(result);
        }

        // קורא לפונקציה החדשה (המפה הרזה)
        const libraryMap = await UserLibraryService.getMap(userId);
        return NextResponse.json(libraryMap);

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: עדכון נתוני ספרייה (לב/דירוג)
export async function POST(req) {
    try {
        const headerList = await headers();
        const userId = headerList.get('x-user-id');
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        const body = await req.json();

        // הפעלת הלוגיקה דרך ה-Service
        const result = await UserLibraryService.update(userId, body);

        return NextResponse.json({
            message: "Success",
            data: result
        });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}






/*
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
const db = require('../../../../models');
import { getFavoritesQuery } from '../../../../public/utils/game-queries';

// נתיב API לקבלת ספריית המשחקים של המשתמש
export async function GET(req) {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });


    const { searchParams } = new URL(req.url);
    const includeGames = searchParams.get('includeGames') === 'true';
    console.log("Received GET request for library with includeGames:", searchParams);
    try {
        if (includeGames) {
            // שליפה לעמוד המועדפים - משחקים מלאים עם הדירוגים והקטגוריות
            const games = await db.Games.findAll(getFavoritesQuery(userId));
            return NextResponse.json(games);
        }

        // שליפה רגילה לכל האתר - המפה הקטנה והמהירה (Map)
        const userGames = await db.UserGame.findAll({
            where: { userId },
            attributes: ['gameId', 'isFavorite', 'rating', 'status']
        });

        const libraryMap = {};
        userGames.forEach(item => {
            libraryMap[item.gameId] = {
                isFavorite: item.isFavorite,
                rating: item.rating,
                status: item.status
            };
        });

        return NextResponse.json(libraryMap);
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}







// נתיב API לעדכון או הוספת משחק לספריית המשתמש
export async function POST(req) {

    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    const { gameId, isFavorite, rating } = await req.json();
    //console.log("Received POST data:", { userId, gameId, isFavorite, rating });

    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        // מציאת השורה או יצירתה אם לא קיימת
        const [userGame, created] = await db.UserGame.findOrCreate({
            where: { userId, gameId },
            defaults: { isFavorite: isFavorite || false, rating: rating || null }
        });

        // אם השורה כבר הייתה קיימת, אנחנו מעדכנים רק את מה שנשלח
        if (!created) {
            if (isFavorite !== undefined) userGame.isFavorite = isFavorite;
            if (rating !== undefined) userGame.rating = rating;
            await userGame.save();
        }

        return NextResponse.json({
            message: "Success",
            data: { gameId, isFavorite: userGame.isFavorite, rating: userGame.rating }
        });
    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}*/
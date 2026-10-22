import { NextResponse } from 'next/server';
import { UserLibraryService } from '../../../../services/server/UserLibraryService';
import { getUserId } from '../../../../utils/verification';
import { parsePagination } from '../../../../utils/parsePagination';

// GET: שליפת נתוני ספרייה
export async function GET(req) {
    try {
        const userId = await getUserId(req);

        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

        // ניתוח פרמטרי דף (Pagination) מתוך הבקשה
        const { page, limit, offset, includeGames } = await parsePagination(req);

        if (includeGames) {
            const result = await UserLibraryService.getFavorites(userId, page, limit, offset);
            return NextResponse.json(result);
        }

        // קורא לפונקציה החדשה (המפה הרזה)
        const libraryMap = await UserLibraryService.getMap(userId);
        return NextResponse.json(libraryMap, { status: 200 });

    } catch (error) {
        return NextResponse.json({ message: error.message }, { status: 500 });
    }
}

// POST: עדכון נתוני ספרייה (לב/דירוג)
export async function POST(req) {
    try {
        const userId = await getUserId(req);
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



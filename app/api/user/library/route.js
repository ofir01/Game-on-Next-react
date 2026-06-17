import { NextResponse } from 'next/server';
import { UserLibraryService } from '../../../../services/server/UserLibraryService';
import { getUserId } from '../../../../utils/verification';

// GET: שליפת נתוני ספרייה
export async function GET(req) {
    try {
        const userId = await getUserId();

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
        const userId = await getUserId();
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



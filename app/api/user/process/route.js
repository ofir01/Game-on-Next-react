import { NextResponse } from 'next/server';
import { PurchaseService } from '../../../../services/server/PurchaseService';
import { getUserId } from '../../../../utils/verification';
import { parsePagination } from '../../../../utils/parsePagination';


// =========================================
// 1. טיפול ב-GET לשליפת כל המשחקים שהמשתמש רכש
// =========================================
export async function GET(req) {
    try {
        // 1. אימות משתמש מתוך ההדרים (Headers)
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });


        const { page, limit, offset } = await parsePagination(req);

        // 2. שליפת נתוני המשחק מה-DB
        const games = await PurchaseService.getPurchased(userId, page, limit, offset);
        return NextResponse.json(games, { status: 200 });

    } catch (error) {
        console.error("Error fetching game payment details:", error);

        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
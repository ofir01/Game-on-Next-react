import { NextResponse } from 'next/server';
import { UserWishlistService } from '../../../../services/server/UserWishlistService';
import { getUserId } from '../../../../utils/verification';
import { parsePagination } from '../../../../utils/parsePagination';
/**
 * GET /api/user/wishlist
 * מחזיר או מפה (Map) או רשימת משחקים מלאה
 */
export async function GET(req) {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {
        // ניתוח פרמטרי דף (Pagination) מתוך הבקשה
        const { page, limit, offset, includeGames } = await parsePagination(req);

        if (includeGames) {
            // קריאה לשירות לקבלת רשימת המשחקים המלאה (עבור דף Wishlist)
            const result = await UserWishlistService.getWishlist(userId, page, limit, offset);
            return NextResponse.json(result);
        }

        // קריאה לשירות לקבלת המפה המהירה (עבור ה-Hook הכללי)
        const wishlistMap = await UserWishlistService.getMap(userId);
        return NextResponse.json(wishlistMap, { status: 200 });

    } catch (error) {
        console.error("[WISHLIST_GET_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}

/**
 * POST /api/user/wishlist
 * מבצע Toggle (הוספה/הסרה)
 */
export async function POST(req) {
    const userId = await getUserId(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });


    try {

        const body = await req.json();
        const { gameId } = body;

        if (!gameId) {
            return NextResponse.json({ error: "gameId is required" }, { status: 400 });
        }

        // הפעלה של פונקציית ה-Toggle מהשירות
        const result = await UserWishlistService.toggle(userId, gameId);

        return NextResponse.json(result);

    } catch (error) {
        console.error("[WISHLIST_POST_ERROR]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}



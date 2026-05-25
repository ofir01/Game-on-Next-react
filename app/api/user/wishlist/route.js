import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { UserWishlistService } from '../../../../services/server/UserWishlistService';

/**
 * GET /api/user/wishlist
 * מחזיר או מפה (Map) או רשימת משחקים מלאה
 */
export async function GET(req) {
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    try {


        const { searchParams } = new URL(req.url);
        const includeGames = searchParams.get('includeGames') === 'true';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;

        if (includeGames) {
            // קריאה לשירות לקבלת רשימת המשחקים המלאה (עבור דף Wishlist)
            const result = await UserWishlistService.get(userId, limit, offset);
            return NextResponse.json(result);
        }

        // קריאה לשירות לקבלת המפה המהירה (עבור ה-Hook הכללי)
        const wishlistMap = await UserWishlistService.getMap(userId);
        return NextResponse.json(wishlistMap);

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
    const headerList = await headers();
    const userId = headerList.get('x-user-id');
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



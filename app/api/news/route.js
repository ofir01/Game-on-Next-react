import { NextResponse } from 'next/server';
import { NewsService } from '../../../services/server/NewsService';

// קבלת כל הידיעות עם אפשרות לפג'ינציה
export async function POST(req) {
    try {
        const body = await req.json().catch(() => ({}));

        const page = parseInt(body.page) || 1;
        const limit = parseInt(body.limit) || 5;

        // קריאה לשירות
        const result = await NewsService.get({ page, limit });

        // החזרת הנתונים בפורמט עשיר יותר שכולל מידע על העמודים
        return NextResponse.json({
            news: result.news,
            pagination: {
                currentPage: page,
                totalPages: result.totalPages,
                totalItems: result.totalItems
            }
        }, { status: 200 });

    } catch (error) {
        console.error("[NEWS_FETCH_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import { logActivity } from '../../../../utils/logActivity';
import { NewsService } from '../../../../services/server/NewsService';

// שירות ניוז - כולל יצירה, עדכון ומחיקה
export async function POST(req) {
    try {
        const body = await req.json();

        // ולידציה - בדיקה שכל שדות החובה קיימים בבקשה
        if (!body.title) {
            return NextResponse.json({ message: "Missing title" }, { status: 400 });
        }

        // ביצוע היצירה דרך השירות
        const newNews = await NewsService.create(body);

        // רישום הפעולה במערכת הלוגים
        const log = await logActivity({
            req,
            action: 'CREATE',
            targetType: 'News',
            targetId: newNews.id
        });

        if (log) {
            return NextResponse.json({ message: log }, { status: 400 });
        }

        return NextResponse.json(
            { message: "News created successfully", news: newNews },
            { status: 201 }
        );

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
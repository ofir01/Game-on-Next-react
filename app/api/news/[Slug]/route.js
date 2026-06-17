import { NextResponse } from 'next/server';
import { NewsService } from '../../../../services/server/NewsService';

export async function GET(req, { params }) {
    try {
        const resolvedParams = await params;
        const slug =  resolvedParams.Slug; // מקבל את המחרוזת מה-URL

        if (!slug) {
            return NextResponse.json({ error: "חסר מזהה כתבה" }, { status: 400 });
        }

        const article = await NewsService.getBySlug(slug);

        if (!article) {
            return NextResponse.json({ error: "הכתבה לא נמצאה" }, { status: 404 });
        }

        return NextResponse.json(article, { status: 200 });

    } catch (error) {
        console.error("[SINGLE_NEWS_FETCH_ERROR]", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import { RatingService } from '../../../../../services/server/RatingService';


export async function GET(req, { params }) {
    try {
        const { Slug } = await params;
        const userId = req.headers.get('x-user-id');

        const result = await RatingService.get(Slug, userId);

        if (result.error) {return NextResponse.json({ error: result.error }, { status: 404 });}

        // מחזירים 200 (OK) עבור שליפה מוצלחת
        return NextResponse.json(result.data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { Slug } = await params;
        const { rating } = await req.json();
        const userId = req.headers.get('x-user-id');

        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const result = await RatingService.update(Slug, userId, rating);

        if (result.error) {return NextResponse.json({ error: result.error }, { status: 404 });}

        // מחזירים 201 (Created) כי נוצר/עודכן משאב
        return NextResponse.json(result.data, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
import { NextResponse } from 'next/server';
import { RatingService } from '../../../../../services/server/RatingService';
import {getUserId} from '../../../../../utils/verification.js';

// GET: שליפת דירוג משחק
export async function GET(req, { params }) {
    try {
        const { Slug } = await params;
        const userId = await getUserId(req);

        const result = await RatingService.get(Slug, userId);

        if (result.error) {return NextResponse.json({ error: result.error }, { status: 404 });}

        // מחזירים 200 (OK) עבור שליפה מוצלחת
        return NextResponse.json(result.data, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: עדכון דירוג משחק
export async function POST(req, { params }) {
    try {
        const { Slug } = await params;
        const { rating } = await req.json();
        const userId = await getUserId(req);

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
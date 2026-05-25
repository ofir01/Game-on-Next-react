import { NextResponse } from 'next/server';
import { CategoryService } from '../../../../services/server/CategoryService';


// POST - הוספה
export async function POST(req) {
    try {
        const body = await req.json();

        const category = await CategoryService.add(body.name);
        //הקטגוריה כבר קיימת
        if (!category) {
            return NextResponse.json({ message: "The category already exists" }, { status: 409 });
        }

        return NextResponse.json(category, { status: 200 });
    } catch (error) {
        console.error('Failed to add Category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}


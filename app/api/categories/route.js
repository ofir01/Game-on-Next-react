import { NextResponse } from 'next/server';
import { CategoryService } from '../../../services/server/CategoryService';

// GET - שליפה + חיפוש 
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const q = searchParams.get('q');

        const categories = await CategoryService.getAll(q);

        return NextResponse.json(categories, { status: 200 });
    } catch (error) {
        console.error('Failed to fetch categories:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

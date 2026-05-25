
import { NextResponse } from 'next/server';
import { logActivity } from '../../../../utils/logActivity.js';
import { GameService } from '../../../../services/server/GameService.js';


// יצירת משחק חדש עם קטגוריות
export async function POST(req) {
    try {
        const body = await req.json();
        const { selectedCategories, ...gameFields } = body;

        console.log('Received game creation request with data:', gameFields, 'and categories:', selectedCategories);
        // 1. בדיקת תקינות בסיסית (Validation)
        if (!gameFields.title || !selectedCategories || selectedCategories.length === 0) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 2. קריאה ל-Service לביצוע היצירה
        const newGame = await GameService.create(gameFields, selectedCategories);

        // 3. רישום לוג פעילות
        const log_Activity = await logActivity({ req, action: 'CREATE', targetType: 'Games', targetId: newGame.id });

        if (log_Activity) {
            return NextResponse.json({ message: log_Activity }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Game created successfully',
            id: newGame.id
        }, { status: 201 });

    } catch (error) {
        console.error('SERVER ERROR:', error);
        return NextResponse.json({
            error: error.message || 'Internal Server Error'
        }, { status: 500 });
    }
}










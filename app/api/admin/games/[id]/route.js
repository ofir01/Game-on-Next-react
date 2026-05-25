// app/api/games/[id]/route.js
import { NextResponse } from 'next/server';
import { logActivity } from '../../../../../utils/logActivity';
import { GameService } from '../../../../../services/server/GameService';


//עדכון פרטי משחק
// app/api/games/[id]/route.js
export async function PUT(req, { params }) {
    try {
        const { id } = await params;
        const body = await req.json();

        // קריאה ללוגיקה העסקית
        const result = await GameService.update(id, body);

        if (result.error) {
            return NextResponse.json({ message: result.error }, { status: 404 });
        }

        // לוגים - נשארים בשרת כי הם דורשים את אובייקט ה-req
        const log_Activity = await logActivity({ req, action: 'UPDATE', targetType: 'Game', targetId: id });
        if (log_Activity) {
            return NextResponse.json({ message: log_Activity }, { status: 400 });
        }

        return NextResponse.json({ message: "Updated successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


// מחיקת משחק וקטגוריות מקושרות
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        // 1. קריאה ללוגיקה העסקית ב-Service
        const isDeleted = await GameService.delete(id);

        // 2. טיפול במקרה שהמשחק לא קיים
        if (!isDeleted) {
            return NextResponse.json({ message: "Game not found" }, { status: 404 });
        }

        // 3. רישום פעילות (Log) - קורה בשרת כי הוא צריך את אובייקט ה-req
        const log_Activity = await logActivity({ req, action: 'DELETE', targetType: 'Game', targetId: id });

        // טיפול בשגיאת לוג 
        if (log_Activity) { 
            return NextResponse.json({ message: log_Activity }, { status: 400 }); 
        }

        // 4. תשובה מוצלחת
        return NextResponse.json({ message: "Game and its relations deleted successfully" },{ status: 200 });

    } catch (error) {
        console.error(`Error deleting game ${id}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
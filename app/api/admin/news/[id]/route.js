import { NextResponse } from 'next/server';
import { logActivity } from '../../../../../utils/logActivity';
import { NewsService } from '../../../../../services/server/NewsService';


// עדכון ידיעה קיימת
export async function PUT(req, { params }) {
    try {
        // 1. חילוץ נתונים
        const { id } = await params;
        const body = await req.json();

        // 2. ולידציות (שומר הסף)
        if (!id) {
            return NextResponse.json({ message: "No ID provided" }, { status: 400 });
        }
        if (!body || Object.keys(body).length === 0) {
            return NextResponse.json({ message: "Missing update data" }, { status: 400 });
        }

        // 3. קריאה ל-Service לביצוע העדכון
        const updatedRows = await NewsService.update(id, body);

        if (updatedRows === 0) {
            return NextResponse.json({ message: "News not found" }, { status: 404 });
        }

        // 4. רישום לוג פעילות
        const log_Activity = await logActivity({
            req,
            action: 'UPDATE',
            targetType: 'News',
            targetId: id
        });

        if (log_Activity) {
            return NextResponse.json({ message: log_Activity }, { status: 400 });
        }

        // 5. תשובה מוצלחת
        return NextResponse.json({ message: "News updated successfully" });

    } catch (error) {
        console.error("Update Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// מחיקת ידיעה קיימת
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        // בדיקת קיום מזהה לפני ביצוע פעולה
        if (!id) {
            return NextResponse.json({ message: "No ID provided for deletion" }, { status: 400 });
        }

        // ביצוע המחיקה דרך ה-Service
        const deletedCount = await NewsService.delete(id);

        // החזרת שגיאה במידה והרשומה לא קיימת בבסיס הנתונים
        if (deletedCount === 0) {
            return NextResponse.json({ message: "News not found" }, { status: 404 });
        }

        // תיעוד פעולת המחיקה בלוגים
        const log = await logActivity({ req, action: 'DELETE', targetType: 'News', targetId: id });
        if (log) {
            return NextResponse.json({ message: log }, { status: 400 });
        }

        return NextResponse.json({ message: "Deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


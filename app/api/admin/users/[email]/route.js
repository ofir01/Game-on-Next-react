import { NextResponse } from 'next/server';
import { logActivity } from '../../../../../utils/logActivity';

import { UserService } from '../../../../../services/server/UserService';

//מחיקת משתמש וקטגוריות מקושרות
export async function DELETE(req, { params }) {
    try {
        // שליפת האימייל מהפרמטרים של הכתובת
        const { email } = await params;

        if (!email) {
            return NextResponse.json({ error: "Email is required" }, { status: 400 });
        }

        // ביצוע המחיקה דרך ה-Service
        const deletedCount = await UserService.delete(email);

        // טיפול במקרה שהמשתמש לא נמצא בבסיס הנתונים
        if (deletedCount === 0) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        // תיעוד פעולת המחיקה בלוגים של המערכת
        const log = await logActivity({
            req,
            action: 'DELETE',
            targetType: 'User',
            targetId: email
        });

        if (log) {
            return NextResponse.json({ message: log }, { status: 400 });
        }

        return NextResponse.json({ message: "User deleted successfully" });

    } catch (error) {
        console.error(`Error deleting user ${email}:`, error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}


//עדכון תפקיד חדש
export async function PUT(req, { params }) {
    try {
        const { email } = await params;
        const { role } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }

        // קריאה ל-Service לביצוע העדכון והבדיקות
        const result = await UserService.updateRole(email, role);

        // טיפול בשגיאות לוגיות שחזרו מה-Service
        if (result.error === 'NOT_FOUND') {
            return NextResponse.json({ message: 'משתמש לא נמצא במערכת' }, { status: 404 });
        }

        if (result.error === 'FORBIDDEN') {
            return NextResponse.json({ message: 'forbidden' }, { status: 400 });
        }

        // רישום פעילות לוג
        const log = await logActivity({
            req,
            action: 'UPDATE',
            targetType: 'User',
            targetId: email
        });

        if (log) {
            return NextResponse.json({ message: log }, { status: 400 });
        }

        return NextResponse.json({
            message: 'ההרשאות ניתנו בהצלחה',
            user: result.user
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
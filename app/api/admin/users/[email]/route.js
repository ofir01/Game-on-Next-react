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
        let { role } = await req.json();

        if (!email) {
            return NextResponse.json({ message: 'Email is required' }, { status: 400 });
        }
        // הגדרת תפקיד ברירת מחדל אם לא סופק
        role = role || 'USER';


        // בדיקה אם התפקיד שהוזן הוא תפקיד חוקי
        if (['ADMIN'].includes(role)) {
            return NextResponse.json({ message: 'Invalid role specified' }, { status: 400 });
        }

        // קריאה ל-Service לביצוע העדכון והבדיקות
        const result = await UserService.updateRole(email, role);

        // טיפול במקרה של שגיאה מה-Service
        if (result.error) {
            return NextResponse.json({ message: result.error }, { status: 400 });
        }

        // רישום פעילות לוג
        const log = await logActivity({
            req,
            action: 'UPDATE',
            targetType: role,
            targetId: email
        });

        if (log) {
            return NextResponse.json({ message: log }, { status: 400 });
        }

        return NextResponse.json({
            message: 'Permissions updated successfully',
            user: result.user
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
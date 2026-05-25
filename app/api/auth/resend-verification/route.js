import { NextResponse } from 'next/server';
import { AuthService } from '../../../../services/server/AuthService.js';


// API Route לטיפול בבקשות שליחה מחדש של מייל אימות
export async function POST(req) {
    try {
        const { email } = await req.json();

        // בדיקה בסיסית שהוזן אימייל
        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' }, 
                { status: 400 }
            );
        }

        // קריאה לפונקציה שכתבת ב-AuthService
        const result = await AuthService.resendVerification(email);

        if (result.error) {
            // טיפול בשגיאות לוגיות (משתמש לא נמצא או כבר מאומת)
            return NextResponse.json({ error: result.error }, { status: result.status });
        }

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error("Route error:", error);
        return NextResponse.json(
            { error: 'Internal Server Error' }, 
            { status: 500 }
        );
    }
}
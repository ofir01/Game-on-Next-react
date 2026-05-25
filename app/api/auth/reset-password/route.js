import { NextResponse } from 'next/server';
import { AuthService } from '../../../../services/server/AuthService.js';


// API Route לטיפול בבקשות איפוס סיסמה
export async function POST(req) {
    try {
        const body = await req.json();
        const { token, newPassword } = body;

        // 1. וולידציה של הנתונים שהתקבלו
        if (!token) {
            return NextResponse.json({
                error: 'TOKEN_REQUIRED',
                message: 'חסר מזהה איפוס (טוקן)'
            }, { status: 400 });
        }

        if (!newPassword || newPassword.length < 6) {
            return NextResponse.json({
                error: 'INVALID_PASSWORD',
                message: 'הסיסמה חייבת להכיל לפחות 6 תווים'
            }, { status: 400 });
        }

        // 2. קריאה לשירות שיצרנו
        const result = await AuthService.resetPassword(token, newPassword);

        // 3. טיפול בשגיאות מהשירות
        if (result.error) {
            return NextResponse.json({
                error: result.error,
                message: result.error
            }, { status: 400 });
        }
    

        // 4. החזרת תשובה חיובית
        return NextResponse.json({
            success: true,
            message: 'הסיסמה שונתה בהצלחה! כעת תוכל להתחבר עם הסיסמה החדשה.'
        }, { status: 200 });

    } catch (error) {
        console.error('Reset Password API Error:', error);
        return NextResponse.json({
            error: 'SERVER_ERROR',
            message: 'שגיאת שרת פנימית'
        }, { status: 500 });
    }
}
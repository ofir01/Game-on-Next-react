import { NextResponse } from 'next/server';
import { AuthService } from '../../../../services/server/AuthService.js';



// API Route לטיפול בבקשות איפוס סיסמה
export async function POST(req) {
    try {
        const body = await req.json();
        const { email } = body;

        // 1. וולידציה בסיסית
        if (!email) {
            return NextResponse.json({
                error: 'EMAIL_REQUIRED',
                message: 'חובה להזין כתובת אימייל'
            }, { status: 400 });
        }

        // 2. קריאה לשירות שיצרנו
        const result = await AuthService.forgotPassword(email);

        // 3. טיפול בשגיאות
        if (result.error === 'USER_NOT_FOUND') {
            // טיפ אבטחה: במערכות מחמירות, גם אם המשתמש לא קיים מחזירים "הצלחה" 
            // כדי שהאקרים לא יוכלו לגלות אילו אימיילים רשומים למערכת (Account Enumeration).
            // אבל לצורכי נוחות ופיתוח, נחזיר שגיאה ברורה למשתמש:
            return NextResponse.json({
                error: 'USER_NOT_FOUND',
                message: 'לא מצאנו חשבון המשויך לכתובת האימייל הזו'
            }, { status: 404 });
        }

        if (result.error) {
            return NextResponse.json({
                error: result.error,
                message: 'אירעה שגיאה בשליחת המייל, אנא נסה שוב מאוחר יותר'
            }, { status: 400 });
        }

        // 4. החזרת תשובה חיובית
        return NextResponse.json({
            success: true,
            message: 'קישור לאיפוס סיסמה נשלח לאימייל שלך (תקף לשעה אחת)'
        }, { status: 200 });

    } catch (error) {
        console.error('Forgot Password API Error:', error);
        return NextResponse.json({
            error: 'SERVER_ERROR',
            message: 'שגיאת שרת פנימית'
        }, { status: 500 });
    }
}
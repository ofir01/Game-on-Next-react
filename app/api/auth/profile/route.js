import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { validateInput } from "../../../../utils/verification.js";
import { AuthService } from '../../../../services/server/AuthService.js';
import {getUserId} from '../../../../utils/verification.js';


// אימות טוקן ה-JWT
const verifyUserToken = async (token) => {
    if (!token || token.startsWith('guest_')) return null;
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return null;
    }
}

// שליפת פרופיל המשתמש על בסיס הטוקן שבקוקי
export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;

        // 1. פענוח ראשוני של הטוקן כדי לקבל את ה-ID
        const decoded = await verifyUserToken(token);

        // אם אין טוקן או שהוא לא תקף
        if (!decoded || !decoded.id) {
            return NextResponse.json({ user: null }, { status: 200 });
        }

        
        const getProfileResult = await AuthService.getProfile(decoded.id);

        // אם המשתמש לא נמצא ב-DB, ננקה את העוגייה
        if (!getProfileResult) {
            const newGuestId = `guest_${crypto.randomUUID()}`;
            cookieStore.set('auth_token', newGuestId, {
                httpOnly: true,
                path: '/',
                maxAge: 60 * 60 * 24,
            });
        }
        return NextResponse.json({ user: getProfileResult }, { status: 200 });

    } catch (error) {
        console.error("Profile fetch error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}





// עדכון פרופיל משתמש כולל בדיקות אבטחה
export async function PUT(req) {
    try {
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ message: "לא מורשה - יש להתחבר למערכת" }, { status: 401 });
        }

        const body = await req.json();
        const { email, newPassword } = body;

        // ולידציית קלט בסיסית לפני פנייה ל-Service
        if (email) {
            const emailError = validateInput({ email });
            if (emailError) return NextResponse.json({ message: emailError }, { status: 400 });
        }
        if (newPassword) {
            const passError = validateInput({ password: newPassword });
            if (passError) return NextResponse.json({ message: passError }, { status: 400 });
        }

        const result = await AuthService.update(userId, body);

        // ניהול שגיאות לוגיות
        if (result.error) return NextResponse.json({ message: result.error }, { status: 404 });

        const statusMessage = result.emailChanged
            ? "הפרופיל עודכן בהצלחה. שלחנו קישור אימות לאימייל החדש."
            : "הפרופיל עודכן בהצלחה!";

        return NextResponse.json({ message: statusMessage, user: result.userData }, { status: 200 });

    } catch (error) {
        console.error("Update Profile Error:", error.message);
        return NextResponse.json({ error: "שגיאת שרת פנימית" }, { status: 500 });
    }
}
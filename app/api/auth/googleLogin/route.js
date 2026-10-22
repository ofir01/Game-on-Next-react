import { NextResponse } from "next/server";
import { AuthService } from "../../../../services/server/AuthService.js";

// שירות האימות - כאן מתבצעת הלוגיקה של אימות המשתמש עם גוגל
export async function POST(req) {
    try {
        const { accessToken } =await req.json();

        if (!accessToken) {
            return NextResponse.json({ error: 'לא סופק טוקן של גוגל' }, { status: 400 });
        }

        // 1. פנייה לגוגל כדי למשוך את פרטי המשתמש בעזרת הטוקן
        const googleResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!googleResponse.ok) {
            return NextResponse.json({ error: 'טוקן לא תקין או פג תוקף' }, { status: 401 });
        }

        const googleUser = await googleResponse.json();
        const { email, name, picture, sub: googleId } = googleUser;

        // 2. קריאה לשירות ההתחברות
        const result = await AuthService.googleLogin({ email, name, picture, googleId });



        // טיפול בשגיאות לוגיות
        if (result.error) {
            return NextResponse.json({ message: result.error }, { status: 409 });
        }

        return NextResponse.json(
            { message: "User logged in successfully", user: result.user },
            { status: 200 }
        );

    } catch (error) {
        console.error("GOOGLE LOGIN ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}


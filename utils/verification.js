
// פונקציה לאימות קלט של אימייל וסיסמה
export function validateInput(data) {
    const { email, password } = data;

    // בדיקת אימייל (רק אם הוא נשלח)
    if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) return "Invalid email format";
    }

    // בדיקת סיסמה (רק אם היא נשלחה)
    if (password !== undefined) {
        if (password.length < 6) return "Password must be at least 6 characters";
    }

    return null; // הכל תקין
}


/*
import { NextResponse } from "next/server";

export default function verification(email, password) {
    if (!email || !password) {
        return NextResponse.json(
            { message: "Email and password are required" },
            { status: 400 }
        );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json(
            { message: "Invalid email format" },
            { status: 400 }
        );
    }

    if (password.length < 6) {
        return NextResponse.json(
            { message: "Password must be at least 6 characters" },
            { status: 400 }
        );
    }

    return null; // אם הכל תקין, מחזירים null
}


*/

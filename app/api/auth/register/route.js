import { NextResponse } from "next/server";
import { validateInput } from "../../../../utils/verification.js";
import { AuthService } from "../../../../services/server/AuthService.js";

// שירות האימות - כאן מתבצעת הלוגיקה של אימות המשתמש
export async function POST(req) {
    try {
        const body = await req.json();
        const { name, email, password, initialGames } = body;

        // ולידציה בסיסית של הקלט
        if (email) {
            const emailError = validateInput({ email });
            if (emailError) return NextResponse.json({ message: emailError }, { status: 400 });
        }
        if (password) {
            const passError = validateInput({ password });
            if (passError) return NextResponse.json({ message: passError }, { status: 400 });
        }
        if (!name) {
            return NextResponse.json({ message: "Name is required" }, { status: 400 });
        }

        // קריאה לשירות הרישום
        const result = await AuthService.register({ name, email, password, initialGames });

        // טיפול בשגיאות לוגיות
        if (result.error) {
            return NextResponse.json({ message: result.error }, { status: 409 });
        }

        return NextResponse.json(
            { message: "User created successfully", user: result.user },
            { status: 201 }
        );

    } catch (error) {
        console.error("REGISTER ERROR:", error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}
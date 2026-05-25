import { NextResponse } from "next/server";
import { validateInput } from "../../../../utils/verification.js";
import { AuthService } from "../../../../services/server/AuthService.js";


// שירות האימות - כאן מתבצעת הלוגיקה של אימות המשתמש
export async function POST(req) {
  try {
    const body = await req.json();
    const { email, password } = body;

    // --- אימות קלט (ולידציה) ---
    const emailError = validateInput({ email });
    if (emailError) return NextResponse.json({ message: emailError }, { status: 400 });

    const passError = validateInput({ password });
    if (passError) return NextResponse.json({ message: passError }, { status: 400 });

    // --- קריאה ל-Service ---
    const result = await AuthService.login(email, password);

    // --- טיפול בשגיאות מה-Service ---
    if (result.error) {
      return NextResponse.json({ message: result.error }, { status: 404 });
    }

    // --- הצלחה ---
    return NextResponse.json(
      { message: "User logged in successfully", user: result.user },
      { status: 200 }
    );

  } catch (error) {
    console.error("LOGIN API ERROR:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

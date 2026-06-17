import { headers } from 'next/headers';

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


//פונקציה לאימות המשתמש
export async function getUserId() {
    const headerList = await headers();
    return headerList.get('x-user-id');
}
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const cookieStore = await cookies();
    // הדרך הקצרה והמודרנית ב-Next.js
    //cookieStore.delete('auth_token');


    // בתוך ה-API של ה-Logout
    const newGuestId = `guest_${crypto.randomUUID()}`;

    cookieStore.set('auth_token', newGuestId, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
    });
    // מחיקת הקוקי על ידי הגדרת תאריך תפוגה לעבר
    /* cookieStore.set('auth_token', '', {
       httpOnly: true,
       secure: process.env.NODE_ENV === 'production',
       expires: new Date(0), // 1 בינואר 1970 - גורם למחיקה מיידית
       path: '/',
     });*/

    return NextResponse.json({ message: "התנתקת בהצלחה" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "שגיאה בתהליך הניתוק" }, { status: 500 });
  }
}
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

// פונקציה ליצירת סשן (טוקן וקוקי) עבור משתמש
export async function createSession(user) {
  const datal = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    isVerified: user.isVerified,
  }
  // 1. יצירת הטוקן
  const token = jwt.sign(
    datal,
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

  // 2. הגדרת הקוקי
  // שים לב: השימוש באותו שם ('auth_token') דורס את מזהה האורח מהמידלוואיר
  const cookieStore = await cookies();
  cookieStore.set('auth_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 1, // יום אחד בשניות
    path: '/',
    sameSite: 'lax', // חשוב כדי שהסוקט יוכל לקרוא את העוגיה בחיבור
  });

  // 3. החזרת נתוני המשתמש ה"בטוחים"
  return datal;
}
import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const requestHeaders = new Headers(request.headers);

  // 1. פענוח הטוקן ובדיקת סטטוס אימות
  if (token && !token.startsWith('guest_')) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jwtVerify(token, secret);

      // הזרקת פרטי המשתמש ל-Headers (כולל סטטוס אימות)
      requestHeaders.set('x-user-id', String(payload.id));
      requestHeaders.set('x-user-role', payload.role);
      requestHeaders.set('x-user-verified', String(payload.isVerified)); // חשוב!

      // --- הגנה על נתיבי אדמין ---
      if (pathname.startsWith('/api/admin') && payload.role !== 'ADMIN') {
        return NextResponse.json({ message: 'גישה מוגבלת למנהלים' }, { status: 403 });
      }

      // --- הגנה על דף הדאשבורד (חסימת משתמשים לא מאומתים) ---
      if (pathname.startsWith('/dashboard')) {
        if (payload.isVerified === false) {
          // הפניה לדף בית עם פרמטר שמציג הודעה, או לדף ייעודי
          return NextResponse.redirect(new URL('/?error=VERIFICATION_REQUIRED', request.url));
        }
      }

    } catch (err) {
      // טוקן לא תקין או פג תוקף - מנקים ומחזירים לדף הבית
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  } else {
    // 2. אם אין טוקן והוא מנסה להיכנס לדאשבורד - חסימה
    if (pathname.startsWith('/dashboard')) {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 3. טיפול ב-Guest ID (למשתמשים חדשים לגמרי)
  let response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  if (!token) {
    const guestId = `guest_${crypto.randomUUID()}`;
    response.cookies.set('auth_token', guestId, {
      httpOnly: true,
      path: '/',
      maxAge: 60 * 60 * 24,
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
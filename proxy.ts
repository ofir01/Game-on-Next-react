import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

export async function proxy(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('auth_token')?.value;

  const requestHeaders = new Headers(request.headers);

  // 1. הגנה מפני Header Spoofing: מחיקת Headers רגישים שמגיעים מהלקוח
  requestHeaders.delete('x-user-id');
  requestHeaders.delete('x-user-role');
  requestHeaders.delete('x-user-verified');

  let isAuthenticated = false;
  let payload: any = null;

  // 2. פענוח ואימות הטוקן
  if (token && !token.startsWith('guest_')) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const verification = await jwtVerify(token, secret);
      payload = verification.payload;
      isAuthenticated = true;

      // הזרקת פרטי המשתמש המאומת ל-Headers (הם נקיים ובטוחים עכשיו)
      requestHeaders.set('x-user-id', String(payload.id));
      requestHeaders.set('x-user-role', String(payload.role));
      requestHeaders.set('x-user-verified', String(payload.isVerified));

    } catch (err) {
      // טוקן לא תקין או פג תוקף - מנקים ומחזירים לדף הבית (או 401 עבור API)
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      }
      const response = NextResponse.redirect(new URL('/', request.url));
      response.cookies.delete('auth_token');
      return response;
    }
  }

  // 3. הגנה קשיחה על נתיבי אדמין (חלה תמיד, גם על אורחים או חסרי טוקן)
  if (pathname.startsWith('/api/admin') || pathname.startsWith('/admin')) {
    if (!isAuthenticated || payload?.role !== 'ADMIN') {
      if (pathname.startsWith('/api/')) {
        return NextResponse.json({ message: 'גישה מוגבלת למנהלים' }, { status: 403 });
      }
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  // 4. הגנה על דף הדאשבורד (חסימת משתמשים לא מאומתים או אורחים)
  if (pathname.startsWith('/dashboard')) {
    if (!isAuthenticated || payload?.isVerified === false) {
      return NextResponse.redirect(new URL('/?error=VERIFICATION_REQUIRED', request.url));
    }
  }

  // 5. טיפול ב-Guest ID למשתמשים חדשים לגמרי
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
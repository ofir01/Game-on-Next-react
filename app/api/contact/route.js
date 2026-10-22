// app/api/contact/route.js
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { contactService } from '../../../services/server/ContactMessage';
import { UserService } from '../../../services/server/UserService';
import { getUserId } from '../../../utils/verification';


export async function POST(req) {
    try {
        const body = await req.json();
        const { fullName, email, subject, message, _honeypot } = body;

        // 1. הגנה מבוטים
        if (_honeypot) {
            return NextResponse.json({ message: "Success" }, { status: 200 });
        }

        // 2. ולידציה של שדות חובה
        if (!fullName || !email || !message) {
            return NextResponse.json({ error: 'Please fill in all required fields' }, { status: 400 });
        }

        // 3. חילוץ נתונים טכניים (כולל המפתח האישי של המשתמש)
        const headerList = await headers();
        const ip = headerList.get('x-forwarded-for')?.split(',')[0] || '0.0.0.0';//כתובת ה-IP של המשתמש
        const userAgent = headerList.get('user-agent') || 'unknown';//פרטי המחשב
        const customUserId = await getUserId(req); // מפתח ייחודי שמגיע מהלקוח 

        // 4. בדיקה בשרת: האם המשתמש קיים במסד הנתונים?
        const user = await UserService.verifyUserExists(customUserId);
        
        if (!user) {
            return NextResponse.json({
                error: 'user_not_found',
            }, { status: 401 }); // 401 = Unauthorized
        }

        console.log("Received Contact Message:", ip, userAgent, customUserId, { fullName, email, subject, message });


        // 5. שמירת הנתונים (רק לאחר שהבדיקה עברה)
        await contactService.saveMessage(
            { fullName, email, subject, message },
            { userIp: ip, userAgent, userId: user.id }
        );

        return NextResponse.json({
            success: true,
            message: 'your_message_has_been_received'
        }, { status: 201 });

    } catch (error) {
        console.error("Route Error:", error);
        return NextResponse.json({ error: 'An error occurred while processing your request' }, { status: 500 });
    }
}
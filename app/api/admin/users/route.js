import { NextResponse } from 'next/server';
import { UserService } from '../../../../services/server/UserService';

// שליפת משתמשים בעלי תפקיד
export async function GET() {
    try {
        const users = await UserService.getStaffUsers();
        return NextResponse.json(users, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// שליחת הודעות
export async function POST(req) {
    try {
        const body = await req.json();
        const { email, customMessage, type, sendToAll } = body;

        // בדיקה בסיסית לפני פנייה ל-Service
        if (!sendToAll && !email) {
            return NextResponse.json({ message: "Email is required for single user message" }, { status: 400 });
        }

        const result = await UserService.sendMessages({ email, customMessage, type, sendToAll });

        // טיפול בשגיאות שחזרו מה-Service
        if (result.error === 'NO_USERS') {
            return NextResponse.json({ message: 'No users found to send to.' }, { status: 404 });
        }
        if (result.error === 'NOT_FOUND') {
            return NextResponse.json({ message: 'User not found' }, { status: 404 });
        }

        const successMessage = result.count 
            ? `Broadcast sent successfully to ${result.count} users.` 
            : 'Message sent successfully';

        return NextResponse.json({ message: successMessage, details: result.details || null }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
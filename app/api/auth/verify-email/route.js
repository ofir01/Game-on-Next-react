import { NextResponse } from 'next/server';
import { AuthService } from "../../../../services/server/AuthService.js";


export async function POST(req) {
    try {
        const { token } = await req.json();

        if (!token) {
            return NextResponse.json({ error: 'TOKEN_REQUIRED' }, { status: 400 });
        }
        const result = await AuthService.verifyToken(token);
        console.log('Verification result:', result);
        if (result.error) {
            return NextResponse.json({ error: result.error }, { status: 400 });
        }
        return NextResponse.json({ success: true, message: 'Email verified successfully' }, { status: 200 });

    } catch (error) {
        console.error('Verify Email Error:', error);
        return NextResponse.json({ error: 'SERVER_ERROR', message: 'Internal server error' }, { status: 500 });
    }
}
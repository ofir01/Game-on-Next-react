import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { gameSessionService } from '../../../services/server/gameSessionService';

const getUserId = async () => {
    const headerList = await headers();
    return headerList.get('x-user-id');
};

const jsonError = (error) => {
    console.error('Game session API error:', error);

    return NextResponse.json(
        { message: error.message || 'Internal server error' },
        { status: error.status || 500 }
    );
};

export async function GET(req) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const gameId = searchParams.get('gameId');
        const session = await gameSessionService.getActive(userId, gameId);

        return NextResponse.json({ data: session });
    } catch (error) {
        return jsonError(error);
    }
}

export async function POST(req) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const session = body.event
            ? await gameSessionService.handleEvent(userId, body)
            : await gameSessionService.start(userId, body);

        return NextResponse.json({
            message: body.event ? 'Game event accepted' : 'Game session started',
            data: session,
        }, { status: body.event === 'STARTED' || !body.event ? 201 : 200 });
    } catch (error) {
        return jsonError(error);
    }
}

export async function PUT(req) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const session = body.event
            ? await gameSessionService.handleEvent(userId, body)
            : await gameSessionService.update(userId, body);

        return NextResponse.json({
            message: 'Game session updated',
            data: session,
        });
    } catch (error) {
        return jsonError(error);
    }
}

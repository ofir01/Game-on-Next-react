import { NextResponse } from 'next/server';
import { getUserId } from '../../../utils/verification';
import { gameSessionService } from '../../../services/server/GameSessionService';
import { GameService } from '../../../services/server/GameService';


const jsonError = (error) => {
    console.error('Game session API error:', error);

    return NextResponse.json(
        { message: error.message || 'Internal server error' },
        { status: error.status || 500 }
    );
};

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('gameId');
        const gameId = await GameService.getGameById(id);
        if (!gameId) {
            return NextResponse.json({ message: 'gameId is required' }, { status: 400 });
        }

        if (searchParams.get('view') === 'top-winners') {
            const winners = await gameSessionService.getTopWinners({
                gameId: gameId.id,
                limit: searchParams.get('limit'),
            });

            return NextResponse.json({ data: winners });
        }

        return NextResponse.json({ message: 'Unsupported game session view' }, { status: 400 });
    } catch (error) {
        return jsonError(error);
    }
}

// טיפול ב-POST ליצירת סשן חדש או שליחת אירוע
export async function POST(req) {
    try {
        const userId = await getUserId(req);
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

// טיפול ב-PUT לעדכון סטטוס סשן או שליחת אירוע
export async function PUT(req) {
    try {
        const userId = await getUserId(req);
        if (!userId) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

        const body = await req.json();
        const session = body.status === 'abandoned'
            ? await gameSessionService.abandon(userId, body)
            : await gameSessionService.finish(userId, body);

        return NextResponse.json({
            message: 'Game session updated',
            data: session,
        });
    } catch (error) {
        return jsonError(error);
    }
}

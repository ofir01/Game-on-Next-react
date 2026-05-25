import { NextResponse } from 'next/server';
import { CommentService } from '../../../../../services/server/commentService';
import { GameService } from '../../../../../services/server/GameService';





export async function GET(req, { params }) {
    try {
        const { Slug } = await params;
        const { searchParams } = new URL(req.url);
        const gameId = await GameService.getGameId(Slug);
        
        if (!gameId) return NextResponse.json({ error: "Game not found" }, { status: 404 });

        const page = parseInt(searchParams.get('page')) || 1;
        const ratingFilter = searchParams.get('rating');
        const limit = 5;

        const { rows, count, stats } = await CommentService.getCommentsByGame(gameId, { page, limit, ratingFilter });

        return NextResponse.json({
            comments: rows,
            stats,
            pagination: { total: count, totalPages: Math.ceil(count / limit), currentPage: page }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req, { params }) {
    try {
        const { Slug } = await params;
        const body = await req.json();
        const userId = req.headers.get('x-user-id');
        const gameId = await GameService.getGameId(Slug);

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!gameId) return NextResponse.json({ error: "Game not found" }, { status: 404 });

        const result = await CommentService.create({ 
            userId, 
            gameId, 
            content: body.content || body, 
            parentId: body.parentId 
        });

        if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

        return NextResponse.json(result.comment, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        const { Slug } = await params;
        const body = await req.json();
        const userId = req.headers.get('x-user-id');

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const result = await CommentService.update(body.commentId, userId, body.content);

        if (result.error) return NextResponse.json({ error: result.error }, { status: 404 });

        return NextResponse.json(result.comment);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const userId = req.headers.get('x-user-id');

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const result = await CommentService.delete(id, userId);

        if (result.error) return NextResponse.json({ error: result.error }, { status: 404 });

        return NextResponse.json({ message: "Comment deleted successfully" });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

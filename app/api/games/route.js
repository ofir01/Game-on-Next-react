
import { NextResponse } from 'next/server';
import { GameService } from '../../../services/server/GameService';
export async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);

        // נירמול פרמטרים
        const params = {
            page: Math.max(1, parseInt(searchParams.get('page') || '1')),
            query: searchParams.get('q') || '',
            categories: searchParams.get('categories'),
            sort: searchParams.get('sort') || 'rating',
            type: searchParams.get('type'),
            limit: 7
        };

        const result = await GameService.searchGames(params);

        return NextResponse.json({
            games: result.games,
            pagination: {
                currentPage: params.page,
                totalPages: result.totalPages,
                totalItems: result.totalItems,
                itemsPerPage: params.limit,
                hasNextPage: params.page < result.totalPages,
                hasPrevPage: params.page > 1
            }
        }, { status: 200 });

    } catch (error) {
        return NextResponse.json(
            { error: 'Internal Server Error', details: error.message },
            { status: 500 }
        );
    }
}
import { NextResponse } from 'next/server';
import { GameService } from '../../../../services/server/GameService'; // נתיב לקובץ ה-services


export async function GET(req, { params }) {
    try {
        const { Slug } = await params;

        // 1. שליפת מידע המשחק
        const gameData = await GameService.getGameBySlug(Slug);

        if (!gameData) {
            return NextResponse.json({ message: "Game not found" }, { status: 404 });
        }

        // 2. שליפת משחקים דומים (באמצעות ה-IDs שחזרו מהשלב הראשון)
        const similarGames = await GameService.getSimilarGames(
            gameData.id, 
            gameData.categoryIds
        );

        // 3. איחוד הנתונים לתשובה אחת
        return NextResponse.json({
            ...gameData,
            similarGames
        });

    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
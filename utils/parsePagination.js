


/// =========================================
// 1. פונקציה לניתוח פרמטרי דף (Pagination) מתוך הבקשה
// =========================================
export async function parsePagination(req) {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = 12;
    const offset = (page - 1) * limit || 0;
    const includeGames = searchParams.get('includeGames') === 'true';

    return { page, limit, offset, includeGames };
}

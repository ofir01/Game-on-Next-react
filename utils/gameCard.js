

// פונקציה שמנרמלת את הנתונים למבנה אחיד ושטוח
export const formatGameCard = (game) => {
    // וידוא שאנחנו עובדים עם אובייקט נקי (מטפל גם ב-raw: true וגם ב-Sequelize instances)
    const g = typeof game.get === 'function' ? game.get({ plain: true }) : game;


    return {
        id: g.id,
        title: g.title,
        description: g.description || "",
        imageUrl: g.imageUrl,
        gameUrl: g.gameUrl || `/games/${g.id}`,
        // טיפול במחירים
        price: g.price ? g.price <= 0 ? 'Free' : parseFloat(g.price) : null,
        status: g.status || 'Unknown',
        finalPrice: g.finalPrice !== undefined ? parseFloat(g.finalPrice) : parseFloat(g.price || 0),
        isOnSale: g.isOnSale || false,
        discountPercentage: g.discountPercentage || 0,
        // שליפת הנתונים הפנימיים החוצה (Flattening)
        playCount: g.stats?.playCount || g['stats.playCount'] || 0,
        avgRating: g.avgRating ? parseFloat(g.avgRating).toFixed(1) : "0.0",
        categories: g.categories ? g.categories.map(cat => cat.name) : [],
        categoryIds: g.categories ? g.categories.map(cat => cat.id) : [],
        // תאריכים
        releaseDate: g.releaseDate || null,
        updatedAt: g.updatedAt || null
    };
};


const db = require('../../db/models');
import { formatGameCard } from '../../utils/gameCard';

/**
 * מחזיר הגדרת SQL Literal לחישוב ממוצע דירוגים לכל משחק.
 * שימושי בתוך ה-attributes של findAll.
 * מחזיר: [Sequelize.literal, 'avgRating']
 */
// שימוש ב-Literal עבור הממוצע - פותר את בעיית ה-Group By והצמצום של הנתונים

export const getAvgRatingLiteral = () => [
    db.sequelize.literal(`(
        SELECT AVG(rating)
        FROM user_games AS ug
        WHERE ug."gameId" = "Games".id
    )`),
    "avgrating"
];


// שימוש ב-Literal עבור ספירת המועדפים - פותר את בעיית ה-Group By והצמצום של הנתונים
export const getFavoriteCountLiteral = () => [
    db.sequelize.literal(`(
                SELECT COUNT(*)
                FROM user_games AS ug
                WHERE ug."gameId" = "Games".id
                AND ug."isFavorite" = true
            )`),
    "favoriteCount"
];

// שימוש ב-Literal עבור ספירת כמות הביקורות (דירוגים) - פותר את בעיית ה-Group By והצמצום של הנתונים
export const getTotalReviewsLiteral = () => [
    db.sequelize.literal(`(
                    SELECT COUNT(*)
      FROM user_games AS ug
      WHERE ug."gameId" = "Games".id AND ug.rating > 0
    )`),
    "totalReviews"
];




// פונקציה שמחזירה את ה-Include המשותף לכל השאילתות שצריכות את הקטגוריות והסטטיסטיקות
export const getCommonInclude = () => [
    {
        model: db.Category,
        as: 'categories',
        attributes: ['id', 'name'],
        through: { attributes: [] }
    },
    {
        model: db.GamePlayStats,
        as: 'stats',
        attributes: ['playCount']
    }
];


// פונקציה שמחזירה את ה-Query המלא עבור שליפת משחקים מועדפים של משתמש ספציפי
export const getFavoritesQuery = (userId) => ({
    attributes: {
        include: [getAvgRatingLiteral()]
    },
    include: [
        ...getCommonInclude(),
        {
            model: db.UserGame,
            as: 'userStatus',
            where: { userId, isFavorite: true },
            attributes: [] // סינון בלבד ללא החזרת נתוני טבלת הקשר
        }
    ],
    distinct: true
});




/**
 * מחזיר אובייקט מלא לשאילתות שדורשות חישוב דירוג וקטגוריות (כרטיס משחק מלא)
 */
export const getHardQuery = () => ({
    attributes: { include: [getAvgRatingLiteral()] },
    // קורא לפונקציה מחדש כדי לקבל עותק חדש ונקי בכל פעם!
    include: getCommonInclude(),
    distinct: true
});



// פונקציית עזר להחזרת תשובה ריקה 
// פונקציית עזר להחזרת תשובה ריקה (חוסך קוד)
export const getEmptyPagination = (page) => ({
    games: [],
    pagination: {
        totalItems: 0,
        totalPages: 1,
        currentPage: page,
        hasNextPage: false
    }
});


// פונקציה גנרית המקבלת את התנאים, מבצעת את השליפה ומסדרת את הפגינציה
export const fetchPaginatedGames = async ({ queryOptions = {}, page, limit, offset, order }) => {
    const hardQuery = getHardQuery();

    const { count, rows } = await db.Games.findAndCountAll({
        ...hardQuery,
        ...queryOptions,
        include: [
            ...(hardQuery.include || []),
            ...(queryOptions.include || [])
        ],
        limit,
        offset,
        distinct: true,
        order: order || queryOptions.order || [['createdAt', 'DESC']]
    });

    const totalPages = Math.ceil(count / limit) || 1;

    return {
        games: rows.map(formatGameCard),
        pagination: {
            totalItems: count,
            totalPages,
            currentPage: page,
            hasNextPage: offset + rows.length < count
        }
    };
};





























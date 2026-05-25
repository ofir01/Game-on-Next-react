
const db = require('../../db/models');
import { Op } from 'sequelize';
import { formatGameCard } from '../../utils/gameCard';
import { getFavoriteCountLiteral, getAvgRatingLiteral, getCommonInclude, getHardQuery } from './gameQueries';


/**
 * מחזיר אובייקט נקי ובסיסי לשאילתות רזות (למשל חיפוש מהיר או קרוסלה)
 */
const getBaseQuery = () => ({
    attributes: ['id', 'title', 'imageUrl', 'price'],
    order: [['updatedAt', 'DESC']],
    distinct: true
});



//הוספה/עדכון/מחיקה - של משחק
export const GameService = {
    // יצירת משחק חדש כולל חיבור לקטגוריות - כל התהליך בתוך טרנזקציה
    create: async (gameData, categoryIds) => {
        // מריצים את כל התהליך בתוך טרנזקציה
        return await db.sequelize.transaction(async (t) => {

            // 1. יצירת המשחק
            const newGame = await db.Games.create(gameData, { transaction: t });

            // 2. חיבור הקטגוריות (טבלת מעבר)
            if (categoryIds && categoryIds.length > 0) {
                await newGame.setCategories(categoryIds, { transaction: t });
            }

            return newGame;
        });
    },

    // עדכון משחק כולל קטגוריות - מחולק לשני שלבים: עדכון בסיסי ואז עדכון הקטגוריות
    update: async (id, body) => {
        const { selectedCategoryIds, updatedAt, categories, ...gameData } = body;

        // 1. עדכון בסיסי
        const [updatedRows] = await db.Games.update(gameData, {
            where: { id: id }
        });

        if (updatedRows === 0) return { error: "GAME_NOT_FOUND" };

        // 2. עדכון קטגוריות
        const game = await db.Games.findByPk(id);
        if (selectedCategoryIds && Array.isArray(selectedCategoryIds)) {
            await game.setCategories(selectedCategoryIds);
        }

        return { success: true };
    },
    // מחיקת משחק - פשוט מבצע מחיקה לפי ID
    delete: async (id) => {
        const deletedCount = await db.Games.destroy({
            where: { id: id }
        });

        // מחזירים true אם נמחק, false אם לא נמצא
        return deletedCount > 0;
    },

    // שליפת ID של משחק לפי Slug (כותרת) - שימושי ליצירת קישורים או בדיקות
    getGameId: async (slug) => {
        const game = await db.Games.findOne({ where: { title: slug } });
        return game ? game.id : null;
    },



    /**************************************************************
העמוד שמציג פרטי המשחק המלאים,,רייטנג, תמונות, קטגוריות ומשחקים דומים
    ***********************************************************/
    // שליפת משחק לפי Slug כולל סטטיסטיקות, תמונות וקטגוריות
    getGameBySlug: async (slug) => {
        const game = await db.Games.findOne({
            where: { title: slug },
            attributes: {
                include: [getFavoriteCountLiteral()] // הוספת ספירת לייקים
            },
            include: [
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
                },
                {
                    model: db.GameImages,
                    as: 'images',
                    attributes: ['url']
                },
            ]
        });

        if (!game) return null;

        const gameData = formatGameCard(game);

        return {
            ...gameData,
            screenshots: game.images?.map(i => i.url) || [],
            likeCount: parseInt(game.get('favoriteCount') || 0)
        };
    },

    // שליפת משחקים דומים על בסיס קטגוריות - מחזיר משחקים אקראיים מאותה קטגוריה (לא כולל המשחק הנוכחי)
    getSimilarGames: async (gameId, categoryIds, limit = 4) => {
        if (!categoryIds || categoryIds.length === 0) return [];

        const similarGames = await db.Games.findAll({
            where: {
                id: { [Op.ne]: gameId }
            },
            include: [{
                model: db.Category,
                as: 'categories',
                where: { id: { [Op.in]: categoryIds } },
                attributes: [],
                through: { attributes: [] }
            }],
            limit: limit,
            order: db.sequelize.literal('RAND()'),
        });

        // שימוש בפורמט הקיים שלך לכרטיסי משחק
        return similarGames.map(formatGameCard);
    },



    /***********************************************************
     * אחראי על כל מנועי החיפוש והסינונים המהירים
        ***********************************************************/
    // חיפוש מהיר - מחזיר משחקים שמתחילים באותיות שהוקלדו (לשימוש ב-autocomplete)
    searchGames: async (searchTerm, limit = 4) => {
        const games = await db.Games.findAll({
            ...getBaseQuery(),
            where: { title: { [Op.startsWith]: searchTerm } },
            limit: limit
        });
        return games.map(formatGameCard);
    },
    //חיפוש מהיר - חיפוש קטגוריות שמתחילות באותיות שהוקלדו (לשימוש ב-autocomplete)
    searchCategories: async (searchTerm, limit = 3) => {
        return await db.Category.findAll({
            where: { name: { [Op.startsWith]: searchTerm } },
            limit: limit,
            include: [{
                model: db.Games,
                as: 'games',
                attributes: [],
                through: { attributes: [] }
            }],
            attributes: [
                'id',
                'name',
                [db.sequelize.fn('COUNT', db.sequelize.col(`games.id`)), 'gamesCount']
            ],
            group: ['Category.id', 'Category.name'],
            subQuery: false,
            raw: true
        });
    },



    /***********************************************************
    העמוד שמציג את החיפוש מתקדם
       ***********************************************************/
    // חיפוש מתקדם - מחזיר משחקים לפי כל הקריטריונים שהמשתמש בחר (שם, קטגוריות, מיון, טווח מחיר)
    getAdvancedSearch: async ({ q, categories, sort, page, limit, minPrice, maxPrice }) => {
        const offset = (page - 1) * limit;
        let whereClause = {};

        if (q && q.trim()) {
            whereClause.title = { [Op.startsWith]: q };
        }

        // לוגיקה של מחיר סופי
        const effectivePriceQuery = `
            CASE 
                WHEN discountPercentage > 0 AND (discountUntil IS NULL OR discountUntil > NOW()) 
                THEN price * (1.0 - (discountPercentage / 100.0)) 
                ELSE price 
            END
        `;

        if (minPrice || maxPrice) {
            const priceConditions = [];
            if (minPrice) {
                priceConditions.push(db.sequelize.where(db.sequelize.literal(effectivePriceQuery), { [Op.gte]: parseFloat(minPrice) }));
            }
            if (maxPrice) {
                priceConditions.push(db.sequelize.where(db.sequelize.literal(effectivePriceQuery), { [Op.lte]: parseFloat(maxPrice) }));
            }
            whereClause[Op.and] = priceConditions;
        }

        let includeArray = getCommonInclude();

        if (categories && categories.length > 0) {
            const catInclude = includeArray.find(i => i.as === 'categories');
            if (catInclude) {
                catInclude.where = { name: { [Op.in]: categories } };
                catInclude.required = true;
            }
        }

        // --- שלב 1: ספירה מדויקת ---
        const totalItems = await db.Games.count({
            where: whereClause,
            include: includeArray,
            distinct: true,
            col: 'id'
        });

        // --- שלב 2: שליפת הנתונים ---
        let order = [['createdAt', 'DESC']];
        if (sort === 'popular') {
            order = [[{ model: db.GamePlayStats, as: 'stats' }, 'playCount', 'DESC']];
        } else if (sort === 'rating') {
            order = [[db.sequelize.literal('avgRating DESC')]];
        }

        const rows = await db.Games.findAll({
            where: whereClause,
            include: includeArray,
            attributes: { include: [getAvgRatingLiteral()] },
            order: order,
            limit: limit,
            offset: offset,
            // השילוב הקריטי:
            subQuery: true
        });

        return {
            games: rows.map(formatGameCard),
            totalItems: totalItems
        };
    },



    /***********************************************************
 * אחראי על שליפת משחקים לתצוגה הכללית בחנות (קרוסלה, טרנדים, מדורגים)
        ***********************************************************/

    getCarouselGames: async (limit) => {
        const games = await db.Games.findAll({
            ...getHardQuery(),
            limit: limit,
            order: [['updatedAt', 'DESC']],
        });
        return games.map(formatGameCard);
    },

    getTrendingGames: async (limit) => {
        const games = await db.Games.findAll({
            ...getHardQuery(),
            limit: limit,
            // שימוש במילון כדי למנוע טעויות הקלדה ולשנות בקלות בעתיד
            order: [[{ model: db.GamePlayStats, as: 'stats' }, 'playCount', 'DESC']]
        });
        return games.map(formatGameCard);
    },

    getTopRatedGames: async (limit) => {
        const games = await db.Games.findAll({
            ...getHardQuery(),
            limit: limit,
            order: [[db.sequelize.literal('avgRating DESC')]]
        });
        return games.map(formatGameCard);
    },

    getHomeStats: async () => {
        const [gamesCount, usersCount, categoriesCount, upcomingCount] = await Promise.all([
            db.Games.count(),
            db.User.count(),
            db.Category.count(),
            db.Games.count({
                where: {
                    [Op.or]: [
                        { status: 'COMING SOON' },
                        { releaseDate: { [Op.gt]: new Date() } }
                    ]
                }
            })
        ]);

        return {
            gamesCount,
            usersCount,
            categoriesCount,
            upcomingCount
        };
    },

    getCategoryHighlights: async (limit = 5) => {
        return await db.Category.findAll({
            attributes: [
                'id',
                'name',
                [db.sequelize.fn('COUNT', db.sequelize.col('games.id')), 'gamesCount']
            ],
            include: [{
                model: db.Games,
                as: 'games',
                attributes: [],
                through: { attributes: [] }
            }],
            group: ['Category.id', 'Category.name'],
            order: [[db.sequelize.literal('gamesCount'), 'DESC'], ['name', 'ASC']],
            limit,
            subQuery: false,
            raw: true
        });
    },

    getUpcomingGames: async (limit = 4) => {
        const games = await db.Games.findAll({
            ...getHardQuery(),
            where: {
                [Op.or]: [
                    { status: 'COMING SOON' },
                    { releaseDate: { [Op.gt]: new Date() } }
                ]
            },
            limit,
            order: [
                ['releaseDate', 'ASC'],
                ['updatedAt', 'DESC']
            ]
        });

        return games.map(formatGameCard);
    },



    // פונקציה שמחזירה את ה-Include המשותף לכל השאילתות שצריכות את הקטגוריות והסטטיסטיקות
 /*searchGames: async ({ page = 1, query = '', categories = '', sort = 'rating', type = null, limit = 4 }) => {
        const offset = (page - 1) * limit;

        // 1. בניית תנאי הסינון (Where)
        const whereCondition = {};
        if (query.trim()) {
            whereCondition.title = { [Op.like]: `%${query.trim()}%` };
        }
        if (type) {
            whereCondition.gameType = type;
        }

        // 2. בניית ה-Includes (הכל מוגדר עם attributes ריק כדי למנוע כפילויות!)
        const includeOptions = [
            {
                model: db.UserGame,
                as: 'userStatus',
                attributes: [], // לא שולפים נתונים, רק משתמשים לחישוב ממוצע
                duplicating: false
            },
            {
                model: db.GamePlayStats,
                as: 'stats',
                attributes: [], // מונע שגיאות SQL, אבל עדיין מאפשר מיון
                duplicating: false
            }
        ];

        const categoryInclude = {
            model: db.Category,
            as: 'categories',
            attributes: [], // קריטי: מונע שכפול של משחקים שיש להם כמה קטגוריות
            through: { attributes: [] },
            duplicating: false
        };

        if (categories) {
            const categoriesList = categories.split(',').filter(Boolean);
            if (categoriesList.length > 0) {
                categoryInclude.where = { name: { [Op.in]: categoriesList } };
                categoryInclude.required = true;
            }
        }
        includeOptions.push(categoryInclude);

        // 3. בניית המיון (Order)
        let orderClause = [];
        switch (sort) {
            case 'new':
                orderClause = [['updatedAt', 'DESC']];
                break;
            case 'popular':
                // מכיוון שלא שלפנו את stats גלוי, ממיינים ישירות לפי העמודה ב-Join
                orderClause = [[db.sequelize.col('stats.playCount'), 'DESC']];
                break;
            case 'rating':
            default:
                orderClause = [[db.sequelize.literal('avgRating'), 'DESC']];
                break;
        }

        // 4. ביצוע השאילתה
        const { count, rows } = await db.Games.findAndCountAll({
            attributes: [
                'id', 'title', 'description', 'imageUrl', 'gameUrl', 'updatedAt', 'price', 'status',
                // הוספתי COALESCE כדי שאם אין דירוגים זה יחזיר 0 ולא שגיאה/Null
                [db.sequelize.fn('COALESCE', db.sequelize.fn('AVG', db.sequelize.col('userStatus.rating')), 0), 'avgRating'],
                [db.sequelize.fn('COUNT', db.sequelize.col('userStatus.rating')), 'totalReviews']
            ],
            where: whereCondition,
            include: includeOptions,
            limit: limit,
            offset: offset,
            order: orderClause,
            // הפתרון המושלם: מקבצים *רק* לפי המשחק, אין יותר כפילויות
            group: ['Games.id'],
            subQuery: false,
            distinct: true
        });

        // ספירת סך הכל (בגלל ש-group הופך את count למערך)
        const totalItems = Array.isArray(count) ? count.length : count;

        return {
            games: rows,
            totalItems,
            totalPages: Math.ceil(totalItems / limit) || 1
        };
    }

*/


};

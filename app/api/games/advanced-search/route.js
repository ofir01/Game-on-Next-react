import { NextResponse } from 'next/server';
import { GameService } from '../../../../services/server/GameService';

// API של החיפוש המתקדם - מקבל פרמטרים שונים ומחזיר משחקים מתאימים עם מידע עליהם (כולל דירוג ממוצע, קטגוריות וכו')
export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const params = {
            q: searchParams.get('q') || '',
            categories: searchParams.get('categories') ? searchParams.get('categories').split(',') : [],
            sort: searchParams.get('sort') || 'new',
            page: parseInt(searchParams.get('page')) || 1,
            limit: 12,
            minPrice: searchParams.get('minPrice') || null,
            maxPrice: searchParams.get('maxPrice') || null
        };

        const { games, totalItems } = await GameService.getAdvancedSearch(params);

        return NextResponse.json({
            games: games,
            pagination: {
                totalItems,
                currentPage: params.page,
                totalPages: Math.ceil(totalItems / params.limit),
                itemsPerPage: params.limit
            }
        });

    } catch (error) {
        console.error("Advanced Search API Error:", error);
        return NextResponse.json({
            error: "Failed to perform advanced search",
            details: error.message
        }, { status: 500 });
    }
}












/*
import { NextResponse } from 'next/server';
const db = require('../../../../models');
import { getAvgRatingLiteral } from '../../../../public/utils/game-queries';

const { Op } = require('sequelize');

export async function GET(req) {
    try {
        const { searchParams } = new URL(req.url);

        const q = searchParams.get('q') || '';
        const categories = searchParams.get('categories') ? searchParams.get('categories').split(',') : [];
        const sort = searchParams.get('sort') || 'rating';
        const page = parseInt(searchParams.get('page')) || 1;
        const limit = 12;
        const offset = (page - 1) * limit;

        // 1. הגדרת בסיס ה-Include
        // הוספנו את UserGames (ודא שהשם במודל הוא אכן UserGame או כפי שהגדרת ב-Association)
        let includeArray = [];

        // 2. טיפול בסינון קטגוריות
        if (categories.length > 0) {
            includeArray.push({
                model: db.Category,
                as: 'categories',
                where: { name: { [Op.in]: categories } },
                through: { attributes: [] },
                required: true
            });
        }

        // 3. בניית סדר המיון (Order) וטיפול בטבלאות רלוונטיות
        let orderArray = [];

        if (sort === 'popular') {
            includeArray.push({
                model: db.GamePlayStats,
                as: 'stats',
                attributes: ['playCount'],
                required: false
            });
            orderArray.push([{ model: db.GamePlayStats, as: 'stats' }, 'playCount', 'DESC']);
        } else if (sort === 'new') {
            orderArray.push(['createdAt', 'DESC']);
        } else {
            // מיון לפי rating שנמצא ב-UserGame
            includeArray.push({
                model: db.UserGame, // הטבלה שבה נמצא ה-rating
                as: 'userStatus',    // ודא שזה ה-Alias המוגדר ב-belongsTo/hasMany
                attributes: ['rating'],
                required: false
            });
            // שינוי המיון שיצביע לטבלה המקושרת
            orderArray.push([{ model: db.UserGame, as: 'userStatus' }, 'rating', 'DESC']);
        }

        // 4. הרצת השאילתה
        const { count, rows: games } = await db.Games.findAndCountAll({
            where: q.trim() ? { title: { [Op.startsWith]: q } } : {},
            include: includeArray,
            order: orderArray,
            limit: limit,
            offset: offset,
            distinct: true,
            // subQuery: false, // עכשיו אפשר להחזיר ל-true אם אין מיון לפי טבלה מקושרת, אבל בוא נשאיר כרגע
            attributes: [
                'id',
                'title',
                'imageUrl',
                'updatedAt',
                'price',
                'status',
                getAvgRatingLiteral(),// שימוש ב-Subquery כדי לחשב ממוצע בלי לשבור את השאילתה המרכזית
            ]
        });

        return NextResponse.json({
            games: games,
            pagination: {
                totalItems: count,
                currentPage: page,
                totalPages: Math.ceil(count / limit),
                itemsPerPage: limit
            }
        }, { status: 200 });

    } catch (error) {
        console.error("Advanced Search API Error:", error);
        return NextResponse.json({
            error: "Failed to perform advanced search",
            message: error.message
        }, { status: 500 });
    }
}


*/
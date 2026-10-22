const db = require('../../db/models');
import { Op } from 'sequelize';
import { fetchPaginatedGames } from './gameQueries';

export const PurchaseService = {
    // יצירת רכישה חדשה
    create: async ({ userId, gameId, pricePaid, transactionId }) => {
        return await db.Purchases.create({
            userId,
            gameId,
            pricePaid,
            transactionId
        });
    },

    // שליפת סטטוס תשלום עבור משחק מסוים למשתמש
    get: async (userId, gameId) => {
        return await db.Purchases.findOne({
            where: { userId, gameId, status: 'completed' } // רק רכישות שהושלמו
        });
    },

    // שליפת רשימת המשחקים שהמשתמש רכש (הספרייה) עם תמיכה בעמודים
    getPurchased: async (userId, page, limit, offset) => {
        return fetchPaginatedGames({
            queryOptions: {
                include: [{
                    model: db.Purchases,
                    as: 'gamePurchases',
                    where: {
                        userId,
                        status: 'completed' // רק רכישות שהושלמו 
                    },
                    attributes: [],
                    required: true
                }]
            },
            page, limit, offset
        });
    },

    //עדכון שבוצע החזר
    updateRefunded: async ({ id, status }) => {
        return await db.Purchases.update({ status }, { where: { id } })
    },

    //עדכון שהושלמה הרכישה
    updateCompleted: async ({ id, status }) => {
        return await db.Purchases.update({ status }, { where: { id } })
    },


    //שליפת כל הרכישות/קבלות עם פילטרים ועמודים (למסך מנהל)
    searchAndGetStats: async ({ page, transactionId, username, gameName, startDate, endDate, limit, offset }) => {
        // 1. בניית תנאי החיפוש (Where Clauses) לטבלת הרכישות
        const purchaseWhere = {};
        if (transactionId) {
            purchaseWhere.transactionId = transactionId;
        }

        // סינון לפי טווח תאריכים
        if (startDate && endDate) {
            purchaseWhere.createdAt = { [Op.between]: [startDate, endDate] };
        } else if (startDate) {
            purchaseWhere.createdAt = { [Op.gte]: startDate };
        }

        // בניית תנאי חיפוש לטבלת משתמשים
        const userWhere = {};
        if (username) {
            userWhere.name = { [Op.like]: `%${username}%` };
        }

        // בניית תנאי חיפוש לטבלת משחקים
        const gameWhere = {};
        if (gameName) {
            gameWhere.title = { [Op.like]: `%${gameName}%` };
        }

        // ההגדרות של ה-Includes (חיבור טבלאות)
        const includes = [
            {
                model: db.User,
                as: 'user',
                where: Object.keys(userWhere).length ? userWhere : undefined,
                attributes: ['id', 'name']
            },
            {
                model: db.Games,
                as: 'game',
                where: Object.keys(gameWhere).length ? gameWhere : undefined,
                attributes: ['id', 'title']
            }
        ];

        // 2+3. הרצת השאילתות במקביל לשיפור ביצועים מקסימלי! (Promise.all)
        const [paginatedData, statsAggregation] = await Promise.all([
            // שאילתה ראשונה: שליפת הנתונים לעמוד הנוכחי
            db.Purchases.findAndCountAll({
                where: purchaseWhere,
                include: includes,
                limit,
                offset,
                order: [['createdAt', 'DESC']],
                distinct: true, // חובה ב-Sequelize כשמשתמשים ב-include כדי שה-count לא יזייף
                
            }),

            // שאילתה שנייה: חישוב סטטיסטיקות על כל התוצאות
            db.Purchases.findAll({
                where: purchaseWhere,
                include: includes.map(inc => ({ ...inc, attributes: [] })), // מסירים שדות מיותרים כי אנחנו רק צריכים את החיבור
                attributes: [
                    'status',
                    [db.sequelize.fn('COUNT', db.sequelize.col('purchases.id')), 'count'],
                    [db.sequelize.fn('SUM', db.sequelize.col('purchases.pricePaid')), 'totalAmount']
                ],
                group: ['purchases.status'],
                raw: true // מחזיר JSON נקי ומהיר
            })
        ]);

        const { rows: purchases, count: totalItems } = paginatedData;

        // 4. עיבוד הנתונים הסטטיסטיים לתבנית נוחה
        const statistics = {
            totalSoldGames: 0,
            totalSoldAmount: 0,
            totalRefundedGames: 0,
            totalRefundedAmount: 0
        };

        statsAggregation.forEach(stat => {
            const count = parseInt(stat.count, 10) || 0;
            const amount = parseFloat(stat.totalAmount) || 0;

            if (stat.status === 'completed') {
                statistics.totalSoldGames += count;//משחקים שנמכרו
                statistics.totalSoldAmount += amount;//סכום שהתקבל על המשחקים שנמכרו
            } else if (stat.status === 'refunded') {
                statistics.totalRefundedGames += count;//משחקים שהוחזרו
                statistics.totalRefundedAmount += amount;//סכום שהוחזר על המשחקים שהוחזרו
            }
        });

        // 5. החזרת התשובה הסופית
        return {
            data: purchases, // רשימת הרכישות של העמוד הנוכחי
            pagination: {
                totalItems,
                totalPages: Math.ceil(totalItems / limit),
                currentPage: page,
                itemsPerPage: limit
            },
            statistics // הסטטיסטיקות המדויקות על פני כל העמודים
        };
    },

    // ביצוע זיכוי רכישה לפי מזהה
    refundPurchase: async (purchaseId) => {
        // קודם כל נעדכן את הסטטוס ל-"refunded" בטבלת הרכישות
        const [updatedRows] = await db.Purchases.update(
            { status: 'refunded', refundedAt: new Date() },
            { where: { id: purchaseId } }
        );
        return updatedRows > 0; // מחזיר true אם הצלחנו לעדכן לפחות שורה אחת, אחרת false
    }




};
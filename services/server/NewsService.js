const db = require('../../db/models');

export const NewsService = {
    // הוספת ידיעה חדשה
    create: async (newsData) => {
        // אנחנו שולפים ומכניסים רק את השדות שהגדרנו, כדי למנוע בעיות אבטחה (Mass Assignment)
        return await db.News.create({
            title: newsData.title,
            excerpt: newsData.excerpt, // שונה מ-content
            category: newsData.category || 'Update', // עם גיבוי לערך ברירת מחדל
            image: newsData.image || null,
            isHot: newsData.isHot || false
        });
    },

    // שליפת רשימת הידיעות עם תמיכה בדף וגבול פריטים (נשאר ללא שינוי)
    get: async ({ page = 1, limit = 5 }) => {
        const offset = (page - 1) * limit;

        const { count, rows } = await db.News.findAndCountAll({
            order: [['createdAt', 'DESC']],
            limit: limit,
            offset: offset,
            raw: true,
        });

        return {
            news: rows,
            totalItems: count,
            totalPages: Math.ceil(count / limit)
        };
    },

    // עדכון ידיעה קיימת
    update: async (id, updateData) => {
        // מומלץ לסנן כאן את הנתונים כדי לוודא שמעדכנים רק שדות קיימים
        const safeData = {
            title: updateData.title,
            excerpt: updateData.excerpt,
            category: updateData.category,
            image: updateData.image,
            isHot: updateData.isHot
        };

        // מחיקת שדות undefined כדי שה-ORM לא ינסה לדרוס אותם סתם
        Object.keys(safeData).forEach(key => safeData[key] === undefined && delete safeData[key]);

        const [updatedRows] = await db.News.update(safeData, {
            where: { id }
        });

        return updatedRows;
    },

    // מחיקת ידיעה מהמערכת לפי מזהה (נשאר ללא שינוי)
    delete: async (id) => {
        return await db.News.destroy({
            where: { id }
        });
    },

    //שליפה בודדת של כתבה
    getBySlug: async (id) => {
        return await db.News.findOne({
            where: {
                id: id
            },
            raw: true
        });
    }, 
};
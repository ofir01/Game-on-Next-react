
const db = require('../../db/models');




//חדשות
export const NewsService = {
    //הוספת ידיעה חדשה
    create: async (newsData) => {
        return await db.News.create({
            title: newsData.title,
            content: newsData.content,
            // כאן יכנסו שדות נוספים במידה וקיימים (image, category וכו')
        });
    },

    //שליפת רשימת הידיעות עם תמיכה בדף וגבול פריטים
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
    //עדכון ידיעה קיימת
    update: async (id, updateData) => {
        const [updatedRows] = await db.News.update(updateData, {
            where: { id }
        });

        // מחזירים את מספר השורות שהושפעו
        return updatedRows;
    },

    // מחיקת ידיעה מהמערכת לפי מזהה
    delete: async (id) => {
        return await db.News.destroy({
            where: { id }
        });
    }
};
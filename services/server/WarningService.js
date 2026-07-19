
const db = require('../../db/models');

export const WarningService = {
    // שליפת תגובות עם פגינציה, סטטיסטיקות ופילטרים
    getWarningCount: async (userId) => {
        const warningCount = await db.Warning.count({
            where: { userId }
        });
        return warningCount;
    },

    // יצירת אזהרה חדשה
    create: async ({ userId,adminId, reason }) => {

        await db.Warning.create({
            userId,   // המשתמש שכתב את התגובה
            adminId,  // האדמין שמחוקק את האזהרה
            reason    // הסיבה שהוזנה בחלון הקופץ
        });


        return { success: true };

    },

};
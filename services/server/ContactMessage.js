// services/contactService.js
import db from '../../db/models';

export const contactService = {
    // פונקציה לשמירת ההודעה
    saveMessage: async (formData, technicalData) => {
        try {
            return await db.ContactMessage.create({
                fullName: formData.fullName,
                email: formData.email,
                subject: formData.subject,
                message: formData.message,
                userIp: technicalData.userIp,
                userAgent: technicalData.userAgent,
                userId: technicalData.userId, // ה-ID שקיבלנו מהבדיקה בשרת
                status: 'NEW'
            });
        } catch (error) {
            console.error("Database Save Error:", error);
            throw new Error("שגיאה בשמירת הנתונים במסד הנתונים");
        }
    }
};



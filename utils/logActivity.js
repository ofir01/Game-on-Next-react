const db = require('../db/models');

// פונקציה לרישום פעילות משתמש
export const logActivity = async ({ req, action, targetType, targetId }) => {
    try {
        // חילוץ ה-IP של המשתמש מהבקשה
        let ip = req.headers.get('x-forwarded-for') || req.ip || "unknown";
        if (ip.includes(',')) {
            ip = ip.split(',')[0].trim();
        }

        const userId = req.headers.get('x-user-id');
        if (!userId) { return `[AuditLog] Action ${action} performed by unauthenticated user/guest.`; }


        await db.ActivityLog.create({
            userId,
            action,
            targetType,
            targetId: String(targetId),
            ipAddress: ip
        });


        return null; // הכל תקין
    } catch (error) {
        // אנחנו לא רוצים שהאפליקציה תקרוס אם הלוג נכשל
        return "Critical: Failed to write audit log: " + error.message;
    }
};
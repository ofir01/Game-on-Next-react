import { sendMessage } from '../../utils/messages';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
const db = require('../../db/models');
const { Op } = require('sequelize');


// פונקציית עזר פנימית לפיצול מערך לקבוצות (Batching)
const chunkArray = (array, size) => {
    const chunked = [];
    let index = 0;
    while (index < array.length) {
        chunked.push(array.slice(index, size + index));
        index += size;
    }
    return chunked;
};


//משתמשים
export const UserService = {
    // פונקציה לבדיקת קיום משתמש
    verifyUserExists: async (userId) => {
        if (!userId || userId === 'unknown') return null;
        return await db.User.findByPk(userId);
    },

    // שליפת כל המשתמשים שהם עם תפקיד,אבל לא מנהל ראשי
    getStaffUsers: async () => {
        return await db.User.findAll({
            where: {
                role: {
                    [Op.notIn]: ['USER', 'ADMIN']
                }
            },
            attributes: ['id', 'name', 'email', 'role', 'createdAt']
        });
    },

    // שליחת הודעות למשתמש יחיד או לכל המשתמשים
    sendMessages: async ({ email, customMessage, type, sendToAll }) => {
        // תרחיש א': שליחה לכולם (Broadcast)
        if (sendToAll) {
            const allUsers = await db.User.findAll({ attributes: ['email'] });

            if (!allUsers || allUsers.length === 0) return { error: 'NO_USERS' };

            const emailsBatch = await Promise.all(
                allUsers.map(user => sendMessage(type, user, customMessage))
            );

            const batches = chunkArray(emailsBatch, 100);
            const results = await Promise.all(
                batches.map(batch => resend.batch.send(batch))
            );

            return { success: true, count: allUsers.length, details: results };
        }

        // תרחיש ב': שליחה למשתמש יחיד
        const user = await db.User.findOne({ where: { email } });
        if (!user) return { error: 'NOT_FOUND' };

        const emailData = await sendMessage(type, user, customMessage);
        await resend.emails.send(emailData);

        return { success: true };
    },
    // עדכון תפקיד חדש
    updateRole: async (email, newRole) => {
        // 1. מציאת המשתמש
        const targetUser = await db.User.findOne({ where: { email } });

        if (!targetUser) {
            return { error: 'NOT_FOUND' };
        }

        // 2. הגנה על חשבונות מנהל - מניעת שינוי תפקיד ל-ADMIN קיים
        if (targetUser.role === 'ADMIN') {
            return { error: 'FORBIDDEN' };
        }

        // 3. ביצוע העדכון
        targetUser.role = newRole;
        await targetUser.save();

        // החזרת אובייקט משתמש נקי ללא מידע רגיש
        return {
            success: true,
            user: {
                id: targetUser.id,
                name: targetUser.name,
                email: targetUser.email,
                role: targetUser.role
            }
        };
    },
    // מחיקת משתמש וקטגוריות מקושרות
    delete: async (email) => {
        return await db.User.destroy({
            where: { email: email }
        });
    },
    getUserById: async (userId) => {
        return await db.User.findByPk(userId) || null;
    }
};
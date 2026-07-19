const db = require('../../db/models');
import { Op } from 'sequelize';
import bcrypt from "bcryptjs";
import { createSession } from "../../utils/Session";
import { sendMessage } from '../../utils/messages';
import { Resend } from 'resend';
import crypto from 'crypto';

const resend = new Resend(process.env.RESEND_API_KEY);

export const AuthService = {
    // ==========================================
    // 1. עדכון פרופיל משתמש + התראות אבטחה
    // ==========================================
    update: async (userId, updateFields) => {
        const { name, email, currentPassword, newPassword } = updateFields;

        const user = await db.User.findByPk(userId);
        if (!user) return { error: 'NOT_FOUND' };
        if (user.isBanned) return { error: 'USER_BANNED' };


        const isEmailChanged = email && email !== user.email;
        const isPasswordChanging = newPassword && newPassword.trim() !== '';

        // אימות סיסמה נוכחית לשינויים רגישים
        if (isEmailChanged || isPasswordChanging) {
            if (!currentPassword) return { error: 'MISSING_PASSWORD' };
            const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
            if (!isPasswordValid) return { error: 'INVALID_PASSWORD' };
        }

        const updateData = {};
        if (name) updateData.name = name;

        // טיפול בשינוי אימייל (מצב Pending)
        if (isEmailChanged) {
            const emailExists = await db.User.findOne({ where: { email } });
            if (emailExists) return { error: 'EMAIL_EXISTS' };

            updateData.pendingEmail = email;
            updateData.emailToken = crypto.randomBytes(32).toString('hex');
            updateData.emailTokenExpires = new Date(Date.now() + 2 * 60 * 60 * 1000);

            try {
                // א. שליחת מייל אימות לכתובת החדשה (אישור השינוי)
                // שים לב: אנחנו שולחים לאותו נתיב של אימות רגיל!
                const verifyLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${updateData.emailToken}`;
                const confirmData = await sendMessage("Confirm_Email", {
                    user: { ...user.toJSON(), name: name || user.name, email },
                    link: verifyLink
                });
                await resend.emails.send({ ...confirmData, to: email });

                // ב. שליחת התראת אבטחה לכתובת הישנה (הנוכחית)
                const securityData = await sendMessage("Security_Notice", {
                    user,
                    message: `התקבלה בקשה לשינוי כתובת האימייל בחשבונך לכתובת החדשה: ${email}. אם לא ביצעת פעולה זו, פנה לתמיכה מיד או אפס את סיסמתך.`
                });
                await resend.emails.send({ ...securityData, to: user.email });
            } catch (err) {
                console.error("Email change notifications failed:", err);
            }
        }

        // טיפול בשינוי סיסמה
        if (isPasswordChanging) {
            updateData.password = await bcrypt.hash(newPassword, 10);
            try {
                const pwdNotify = await sendMessage("Security_Notice", {
                    user,
                    message: "הסיסמה בחשבונך עודכנה בהצלחה. אם לא ביצעת פעולה זו, אנא אפס את סיסמתך מיד."
                });
                await resend.emails.send({ ...pwdNotify, to: user.email });
            } catch (err) {
                console.error("Password change notification failed:", err);
            }
        }

        // ביצוע העדכון בפועל במסד הנתונים
        const [updatedRows] = await db.User.update(updateData, { where: { id: userId } });
        if (updatedRows === 0) return { error: 'NO_CHANGES' };

        // יצירת Session חדש עם הנתונים המעודכנים (המשתמש נשאר מחובר עם המייל הישן בינתיים)
        const updatedUser = await db.User.findByPk(userId);
        const userData = await createSession(updatedUser);

        return {
            success: true,
            userData,
            emailChangePending: isEmailChanged
        };
    },

    // ==========================================
    // 2. פונקציית אימות אוניברסלית (Universal Verify)
    // ==========================================
    verifyToken: async (token) => {
        // א. בדיקה אם זה טוקן של החלפת אימייל (Pending Email)
        let user = await db.User.findOne({
            where: {
                emailToken: token,
                emailTokenExpires: { [Op.gt]: new Date() }
            }
        });

        if (user) {
            // מבצעים את ההחלפה בפועל ומנקים את הטוקנים של ההחלפה
            await user.update({
                email: user.pendingEmail,
                pendingEmail: null,
                emailToken: null,
                emailTokenExpires: null,
                isVerified: true // ליתר ביטחון
            });
            return { success: true, type: 'EMAIL_CHANGED' };
        }

        // ב. אם זה לא טוקן החלפה, בדיקה אם זה טוקן של הרשמה חדשה
        user = await db.User.findOne({
            where: {
                verificationToken: token,
                tokenExpires: { [Op.gt]: new Date() }
            }
        });

        if (user) {
            // מאשרים את המשתמש החדש ומנקים את טוקן ההרשמה
            await user.update({
                isVerified: true,
                verificationToken: null,
                tokenExpires: null
            });
            return { success: true, type: 'ACCOUNT_VERIFIED' };
        }

        // ג. אם לא מצאנו את הטוקן באף אחת מהעמודות, או שפג תוקפו
        return { error: 'INVALID_TOKEN' };
    },

    // ==========================================
    // 3. רישום משתמש חדש
    // ==========================================
    register: async ({ name, email, password, initialGames }) => {
        const existingUser = await db.User.findOne({ where: { email } });
        if (existingUser) return { error: 'EMAIL_EXISTS' };
        if (existingUser.isBanned) return { error: 'USER_BANNED' };

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUserResult = await db.sequelize.transaction(async (t) => {
            const newUser = await db.User.create({
                name,
                email,
                password: hashedPassword,
                role: 'USER',
                isVerified: false,
                verificationToken: crypto.randomBytes(32).toString('hex'),
                tokenExpires: new Date(Date.now() + 2 * 60 * 60 * 1000)
            }, { transaction: t });

            if (initialGames && Array.isArray(initialGames) && initialGames.length > 0) {
                const gamesToInsert = initialGames.map(game => ({
                    userId: newUser.id,
                    gameId: game.gameId,
                    status: game.status || 'Backlog',
                    rating: game.rating || null,
                    isFavorite: game.isFavorite || false
                }));
                await db.UserGame.bulkCreate(gamesToInsert, { transaction: t });
            }
            return newUser;
        });

        const userData = await createSession(newUserResult);

        try {
            const verificationLink = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${newUserResult.verificationToken}`;
            const emailData = await sendMessage("Welcome", {
                user: newUserResult,
                link: verificationLink
            });
            await resend.emails.send(emailData);
        } catch (emailError) {
            console.error("Welcome email failed to send:", emailError);
        }

        return { success: true, user: userData };
    },

    // ==========================================
    // 4. התחברות משתמש קיים
    // ==========================================
    login: async (email, password) => {
        const user = await db.User.findOne({ where: { email } });
        if (!user) return { error: 'USER_NOT_FOUND' };
        if (user.isBanned) return { error: 'USER_BANNED' };


        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return { error: 'INVALID_CREDENTIALS' };

        const userData = await createSession(user);
        return { success: true, user: userData };
    },

    // ==========================================
    // 5. בקשה לאיפוס סיסמה (שכחתי סיסמה)
    // ==========================================
    forgotPassword: async (email) => {
        const user = await db.User.findOne({ where: { email } });
        if (!user) return { error: 'USER_NOT_FOUND' };

        const token = crypto.randomBytes(32).toString('hex');
        const expires = new Date(Date.now() + 60 * 60 * 1000);

        await user.update({
            resetPasswordToken: token,
            resetPasswordExpires: expires
        });

        const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${token}`;

        try {
            const emailData = await sendMessage("ResetPassword", { user, link: resetLink });
            await resend.emails.send(emailData);
        } catch (emailError) {
            console.error("Forgot password email failed to send:", emailError);
            return { error: 'EMAIL_SEND_FAILED' };
        }

        return { success: true };
    },

    // ==========================================
    // 6. איפוס סיסמה בפועל
    // ==========================================
    resetPassword: async (token, newPassword) => {
        const user = await db.User.findOne({
            where: {
                resetPasswordToken: token,
                resetPasswordExpires: { [Op.gt]: new Date() }
            }
        });

        if (!user) return { error: 'INVALID_OR_EXPIRED_TOKEN' };

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await user.update({
            password: hashedPassword,
            resetPasswordToken: null,
            resetPasswordExpires: null
        });

        return { success: true };
    },

    // ==========================================
    // 7. שליחה חוזרת של מייל אימות (הרשמה)
    // ==========================================
    resendVerification: async (email) => {
        const user = await db.User.findOne({ where: { email, isVerified: false } });
        if (!user) return { error: 'USER_NOT_FOUND_OR_ALREADY_VERIFIED', status: 404 };

        const newToken = crypto.randomBytes(32).toString('hex');
        await user.update({
            verificationToken: newToken,
            tokenExpires: new Date(Date.now() + 2 * 60 * 60 * 1000)
        });

        const link = `${process.env.NEXT_PUBLIC_BASE_URL}/verify-email?token=${newToken}`;

        try {
            const emailData = await sendMessage("Welcome", { user, link });
            await resend.emails.send(emailData);
        } catch (emailError) {
            console.error("Resend verification email failed:", emailError);
            return { error: 'EMAIL_SEND_FAILED', status: 500 };
        }

        return { success: true };
    },
    getProfile: async (userId) => {
        const user = await db.User.findByPk(userId);
        if (!user) return null;
        if (user.isBanned) return null;
        return await createSession(user);
    }
};
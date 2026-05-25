import { api } from '../../lib/api-client';

export const authService = {
    // --- ניהול פרופיל ואימות (User) ---

    // קבלת נתוני המשתמש המחובר
    getProfile: () => api.get('/api/auth/profile'),

    // התחברות עם אימייל וסיסמה
    login: (data) => api.post('/api/auth/login', data),

    // הרשמה עם שם, אימייל וסיסמה
    register: (data) => api.post('/api/auth/register', data),

    // יציאה מהמערכת (ניקוי Session/Cookies)
    logout: () => api.post('/api/auth/logout'),

    // עדכון פרופיל (שם, אימייל, סיסמה נוכחית וחדשה)
    updateUser: (data) => api.put(`/api/auth/profile`, data),

    // אימות אימייל באמצעות הטוקן מהמייל
    verifyEmail: (token) => api.post('/api/auth/verify-email', { token }),

    // שליחה חוזרת של מייל אימות למשתמשים שלא אימתו
    resendVerification: (email) => api.post('/api/auth/resend-verification', { email }),

    // --- שכחתי סיסמה ---

    // שלב 1: בקשת קישור לאיפוס (שליחת מייל)
    forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),

    // שלב 2: הזנת סיסמה חדשה עם הטוקן שהתקבל
    resetPassword: (token, newPassword) => api.post('/api/auth/reset-password', { token, newPassword }),


    // --- ניהול מערכת (Admin Only) ---

    // שליחת הודעה למשתמשים
    sendMessage: (payload) => api.post('/api/admin/users', payload),

    // קבלת רשימת המשתמשים עם התפקיד שלהם 
    getUsersRole: () => api.get('/api/admin/users'),

    // מחיקת משתמש לפי אימייל
    deleteUser: (userEmail) => api.delete(`/api/admin/users/${userEmail}`),

    // עדכון תפקיד של משתמש 
    updateUserRole: (email, role) => api.put(`/api/admin/users/${email}`, { role }),
};
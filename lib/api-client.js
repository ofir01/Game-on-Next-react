// lib/api-client.js
import { toast } from 'sonner';

async function request(url, method, body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };

    if (body) options.body = JSON.stringify(body);

    try {
        const response = await fetch(`${url}`, options);

        // 1. חילוץ המידע מהתגובה (גם אם זו שגיאה)
        const data = await response.json().catch(() => ({}));

        // 2. טיפול בשגיאות (סטטוסים שהם לא 2xx)
        if (!response.ok) {
            // כאן הקסם: אנחנו מחפשים .error כי ככה הגדרנו ב-Next.js
            const errorMessage = data.error || data.message || `HTTP Error: ${response.status}`;

            // הצגת הטוסט ישירות מכאן תעבוד על כל ה-Hooks!
            toast.error(errorMessage);

            // זריקת השגיאה כדי ש-React Query ידע שהפעולה נכשלה
            throw new Error(errorMessage);
        }

        // 3. במקרה של 204 No Content
        if (response.status === 204) return true;
        
        return data;
    } catch (error) {
        // אם זו שגיאת רשת (שרת למטה למשל) ולא שגיאת HTTP שחזרה מה-API
        if (error.status === "Failed to fetch") {
            toast.error("Network error: Server is unreachable");
        }

        console.error(`API Error [${method}] ${url}:`, error.message);
        throw error;
    }
}

export const api = {
    get: (url) => request(url, 'GET'),
    post: (url, body) => request(url, 'POST', body),
    put: (url, body) => request(url, 'PUT', body),
    delete: (url) => request(url, 'DELETE'),
};
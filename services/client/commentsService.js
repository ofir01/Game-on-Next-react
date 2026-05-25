import { api } from '../../lib/api-client';

export const commentsService = {
    // הוספנו את הפרמטר rating (ברירת מחדל null)
    get: async (Slug, page = 1, rating = null, limit = 10) => {
        // בונים את הכתובת הבסיסית
        let url = `/api/games/${Slug}/comments?page=${page}&limit=${limit}`;

        // אם הועבר דירוג, מצמידים אותו ל-URL
        if (rating !== null && rating !== undefined) {
            url += `&rating=${rating}`;
        }

        return api.get(url);
    },

    create: (Slug, commentData) => api.post(`/api/games/${Slug}/comments`, commentData),

    // שינוי קטן כאן: ב-Hook שלך השתמשת ב-postReply, וודא שהשם תואם למה שה-Hook קורא לו
    postReply: (Slug, data) => api.post(`/api/games/${Slug}/comments`, data),
    edit: (Slug, data) => api.put(`/api/games/${Slug}/comments`, data),
    delete: (Slug, id) => api.delete(`/api/games/${Slug}/comments?id=${id}`),
};
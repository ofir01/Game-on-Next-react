import { api } from '../../lib/api-client';

export const UserRatingService = {
    // שליפת הדירוג של המשתמש הנוכחי למשחק ספציפי
    getUserRating: (Slug) => api.get(`/api/games/${Slug}/rating`),

    // עדכון או יצירה של דירוג (Upsert)
    updateRating: (Slug, rating) => api.post(`/api/games/${Slug}/rating`, { rating }),
};
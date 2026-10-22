import { api } from '../../lib/api-client';

export const libraryService = {
    // אם לא נשלח כלום, זה פשוט יביא את המפה הרגילה
    getLibrary: (includeGames = false, page = 1) => api.get(`/api/user/library?page=${page}${includeGames ? '&includeGames=true' : ''}`),
    toggleGameStatus: (data) => api.post(`/api/user/library`, data),
};


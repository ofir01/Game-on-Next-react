// services/gameService.js
import { api } from '../../lib/api-client';


export const gameService = {
    // שליפת כל המשחקים עם פילטרים
    advancedSearch: (filters) => {
        const params = new URLSearchParams();

        if (filters.q) params.append('q', filters.q);
        if (filters.categories) params.append('categories', filters.categories);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.page) params.append('page', filters.page);
        if (filters.minPrice) params.append('minPrice', filters.minPrice);
        if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

        return api.get(`/api/games/advanced-search?${params.toString()}`);
    },

    getGameById: (searchQuery) => api.get(`/api/search?q=${encodeURIComponent(searchQuery)}`),

    // שליפת פרטי משחק לפי סלאג (כולל פירוק הסלאג ל-ID)
    getGameSlug: (Slug) => api.get(`/api/games/${Slug}`),

    // שליפת כל הנתונים שהעמוד הראשי צריך, לפי רשימת סקשנים מה-hook
    getHomeSections: () => api.get(`/api/games/home`),



    
    //-- ניהול משחקים (רק למנהלים) ---

    // יצירת משחק חדש (ניהול)
    create: (data) => api.post('/api/admin/games', data),

    // עדכון משחק (ניהול)
    update: (data) => api.put(`/api/admin/games/${data.id}`, data),

    // מחיקת משחק (ניהול)
    delete: (id) => api.delete(`/api/admin/games/${id}`),
};

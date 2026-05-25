import { api } from '../../lib/api-client';


export const CategoriesService = {

    // הוספת קטגוריה חדשה
    createCategory: (name) => api.post('/api/admin/categories', name),

    // מחיקת קטגוריה
    deleteCategory: (id) => api.delete(`/api/admin/categories/${id}`),

    // עדכון קטגוריה קיימת
    updateCategory: (id, name) => api.put(`/api/admin/categories/${id}`, name),

    // חיפוש קטגוריה או שליפת כל הקטגוריות
    getCategories: (query = '') => api.get(`/api/categories?q=${query}`),
};



import { api } from '../../lib/api-client';

export const newsService = {
    get: (filters = {}) => api.post(`/api/news`, filters),
    getBySlug: (Slug) => api.get(`/api/news/${Slug}`),
    create: (data) => api.post(`/api/admin/news`, data),
    update: (id, data) => api.put(`/api/admin/news/${id}`, data),
    delete: (id) => api.delete(`/api/admin/news/${id}`),
};
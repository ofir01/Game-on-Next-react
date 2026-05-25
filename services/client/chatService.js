import { api } from '../../lib/api-client';

export const chatService = {
    getAnswer: (data) => api.post(`/api/chat`, data),
    confirmAction: (confirmAction) => api.post(`/api/chat`, { confirmAction }),
};


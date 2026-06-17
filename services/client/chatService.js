import { api } from '../../lib/api-client';

export const chatService = {
    getAnswer: (data) => api.post(`/api/chat`, data),
    submitFormAction: (formAction) => api.post(`/api/chat`, { formAction }),
    confirmAction: (confirmAction) => api.post(`/api/chat`, { confirmAction }),
};


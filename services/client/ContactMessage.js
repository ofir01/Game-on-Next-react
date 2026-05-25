import { api } from '../../lib/api-client';

export const contactMessageService = {
    create: (messageData) => api.post('/api/contact', messageData),
};
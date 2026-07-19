import { api } from '../../lib/api-client';

export const chatService = {
    submitFormAction: (formAction) => api.post(`/api/chat`, { formAction }),
    confirmAction: (confirmAction) => api.post(`/api/chat`, { confirmAction }),

    // פונקציה חדשה שמחזירה את ה-Stream הגולמי ישירות לקומפוננטה
    getAnswer: async (data) => {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            //  לשלוף שגיאה , או לזרוק שגיאה
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP Error: ${response.status}`);
        }
        // מחזיר את ה-body הגולמי (ReadableStream) מבלי לבצע .json()
        return response.body;
    },
};


import { api } from '../../lib/api-client';

const endpoint = '/api/game-session';

export const sendGameSessionEvent = ({ gameId, event, data = {}, result, sessionId }) => api.post(endpoint, {
    gameId,
    event,
    data,
    result,
    sessionId,
});

const updateSession = (sessionId, status, data = {}) => api.put(endpoint, {
    sessionId,
    status,
    ...data,
});

export const gameSessionService = {
    sendEvent: sendGameSessionEvent,

    getActive: (gameId) => {
        const query = gameId ? `?gameId=${encodeURIComponent(gameId)}` : '';
        return api.get(`${endpoint}${query}`);
    },

    start: (gameId) => api.post(endpoint, { gameId }),

    heartbeat: (sessionId, data = {}) => updateSession(sessionId, 'playing', data),

    pause: (sessionId, data = {}) => updateSession(sessionId, 'paused', data),

    resume: (sessionId, data = {}) => updateSession(sessionId, 'playing', data),

    finish: (sessionId, data = {}) => updateSession(sessionId, 'finished', data),

    abandon: (sessionId, data = {}) => updateSession(sessionId, 'abandoned', data),

    abandonOnUnload: (sessionId, data = {}) => {
        if (!sessionId || typeof navigator === 'undefined' || !navigator.sendBeacon) {
            return false;
        }

        const payload = JSON.stringify({
            sessionId,
            status: 'abandoned',
            ...data,
        });

        return navigator.sendBeacon(
            endpoint,
            new Blob([payload], { type: 'application/json' })
        );
    },
};

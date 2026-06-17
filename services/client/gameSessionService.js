import { api } from '../../lib/api-client';

const endpoint = '/api/game-session';

export const gameSessionService = {
    sendEvent: ({ gameId, event, data = {}, result, sessionId }) =>
        api.post(endpoint, { gameId, event, data, result, sessionId }),

    start: (gameId) =>
        api.post(endpoint, { gameId }),

    finish: (sessionId, { gameId, data = {}, result } = {}) =>
        api.put(endpoint, { sessionId, gameId, status: 'finished', data, result }),

    abandon: (sessionId, { gameId } = {}) =>
        api.put(endpoint, { sessionId, gameId, status: 'abandoned' }),

    getTopWinners: ({ gameId, limit = 3 } = {}) => {
        const params = new URLSearchParams({ view: 'top-winners' });
        if (gameId) params.set('gameId', gameId);
        if (limit) params.set('limit', limit);

        return api.get(`${endpoint}?${params.toString()}`);
    },
};

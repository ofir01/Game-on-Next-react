(function () {
    const ENDPOINT = '/api/game-session';
    const IDENTITY_STORAGE_KEY = 'game-session:identity';

    const toPositiveInt = (value) => {
        const number = Number(value);
        return Number.isInteger(number) && number > 0 ? number : null;
    };

    const readStoredGameId = () => {
        try {
            const identity = JSON.parse(window.sessionStorage.getItem(IDENTITY_STORAGE_KEY) || '{}');
            return toPositiveInt(identity.gameId);
        } catch {
            return null;
        }
    };

    const getGameId = (explicitGameId) => {
        const safeExplicitGameId = toPositiveInt(explicitGameId);
        if (safeExplicitGameId) return safeExplicitGameId;

        const params = new URLSearchParams(window.location.search);
        return toPositiveInt(params.get('gameId')) || readStoredGameId();
    };

    const getSessionStorageKey = (gameId) => `game-session:${gameId}:session-id`;

    const request = async (method, payload) => {
        const response = await fetch(ENDPOINT, {
            method,
            headers: { 'Content-Type': 'application/json' },
            credentials: 'same-origin',
            body: JSON.stringify(payload),
        });

        const body = await response.json().catch(() => ({}));
        if (!response.ok) {
            throw new Error(body.message || 'Game session request failed');
        }

        return body.data;
    };

    const normalizeResult = (result) => {
        if (!result) return undefined;
        const value = String(result).toLowerCase();

        if (['win', 'won', 'success'].includes(value)) return 'won';
        if (['loss', 'lose', 'lost', 'fail', 'failed'].includes(value)) return 'lost';

        return value;
    };

    const createActions = ({ gameId, getData, autoStart = true } = {}) => {
        const safeGameId = getGameId(gameId);
        let sessionId = safeGameId
            ? toPositiveInt(window.sessionStorage.getItem(getSessionStorageKey(safeGameId)))
            : null;
        let closing = false;

        const readData = (extraData) => ({
            ...(typeof getData === 'function' ? getData() || {} : {}),
            ...(extraData || {}),
        });

        const start = async () => {
            if (!safeGameId) return null;
            if (sessionId) return { id: sessionId, gameId: safeGameId };
            closing = false;

            const session = await request('POST', {
                gameId: safeGameId,
                event: 'STARTED',
            });

            sessionId = session?.id || null;
            if (sessionId) {
                window.sessionStorage.setItem(getSessionStorageKey(safeGameId), String(sessionId));
            }

            return session;
        };

        const finish = async (result, data) => {
            if (!safeGameId || closing) return null;
            closing = true;

            const session = await request('POST', {
                gameId: safeGameId,
                sessionId,
                event: 'FINISHED',
                result: normalizeResult(result),
                data: readData(data),
            });

            window.sessionStorage.removeItem(getSessionStorageKey(safeGameId));
            sessionId = null;
            return session;
        };

        const abandon = async () => {
            if (!safeGameId || !sessionId || closing) return null;
            closing = true;

            const session = await request('POST', {
                gameId: safeGameId,
                sessionId,
                event: 'ABORTED',
            });

            window.sessionStorage.removeItem(getSessionStorageKey(safeGameId));
            sessionId = null;
            return session;
        };

        const tracker = {
            start,
            finish,
            abandon,
            isClosing: () => closing,
            getSessionId: () => sessionId,
            __isGameSessionTracker: true,
        };

        window.gameSessionActions = tracker;
        if (autoStart) {
            setTimeout(() => tracker.start().catch(() => null), 0);
        }

        return tracker;
    };

    window.GameSessionEvents = { createActions };
})();

let gameSessionActions;

async function finishGameSession(result) {
    if (gameSessionActions?.isClosing()) return null;

    return gameSessionActions
        ? gameSessionActions.finish(result)
        : null;
}

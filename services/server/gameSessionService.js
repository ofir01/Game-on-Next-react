import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const db = require('../../db/models');

const ACTIVE_STATUSES = ['started', 'playing', 'paused'];
const STALE_CANDIDATE_STATUSES = ['started', 'playing'];
const TERMINAL_STATUSES = ['finished', 'abandoned'];
const SESSION_STATUSES = [...ACTIVE_STATUSES, ...TERMINAL_STATUSES];
const SESSION_RESULTS = ['won', 'lost'];
const GAME_EVENTS = ['STARTED', 'FINISHED', 'ABORTED', 'PAUSED', 'RESUMED'];

const USER_GAME_STATUS_BY_SESSION_STATUS = {
    started: 'Playing',
    playing: 'Playing',
    paused: 'Playing',
    finished: 'Completed',
    abandoned: 'Dropped',
};

const HEARTBEAT_TIMEOUT_MS = 2 * 60 * 1000;

const toPositiveInt = (value, fieldName) => {
    const number = Number(value);
    if (!Number.isInteger(number) || number <= 0) {
        const error = new Error(`${fieldName} must be a positive integer`);
        error.status = 400;
        throw error;
    }
    return number;
};

const assertSessionResult = (result) => {
    if (result === undefined || result === null) return undefined;

    const normalizedResult = String(result).toLowerCase();
    const resultMap = {
        win: 'won',
        won: 'won',
        success: 'won',
        loss: 'lost',
        lose: 'lost',
        lost: 'lost',
        fail: 'lost',
        failed: 'lost',
    };
    const safeResult = resultMap[normalizedResult];

    if (!safeResult || !SESSION_RESULTS.includes(safeResult)) {
        const error = new Error(`result must be one of: ${SESSION_RESULTS.join(', ')}`);
        error.status = 400;
        throw error;
    }

    return safeResult;
};

const assertGameEvent = (event) => {
    const safeEvent = String(event || '').toUpperCase();

    if (!GAME_EVENTS.includes(safeEvent)) {
        const error = new Error(`event must be one of: ${GAME_EVENTS.join(', ')}`);
        error.status = 400;
        throw error;
    }

    return safeEvent;
};

const assertEventData = (data) => {
    if (data === undefined || data === null) return null;

    if (Array.isArray(data) || typeof data !== 'object') {
        const error = new Error('data must be an object');
        error.status = 400;
        throw error;
    }

    return data;
};

const serializeSession = (session) => {
    const plain = session?.get ? session.get({ plain: true }) : session;
    if (!plain) return null;

    return {
        id: plain.id,
        userId: plain.userId,
        gameId: plain.gameId,
        status: plain.status,
        data: plain.data,
        result: plain.result,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
        durationSeconds: plain.durationSeconds,
    };
};

const assertSessionStatus = (status) => {
    if (!SESSION_STATUSES.includes(status)) {
        const error = new Error(`status must be one of: ${SESSION_STATUSES.join(', ')}`);
        error.status = 400;
        throw error;
    }
};

const touchUserGame = async (userId, gameId, sessionStatus, transaction) => {
    const userGameStatus = USER_GAME_STATUS_BY_SESSION_STATUS[sessionStatus];
    if (!userGameStatus) return;

    const [userGame, created] = await db.UserGame.findOrCreate({
        where: { userId, gameId },
        defaults: {
            status: userGameStatus,
            isFavorite: false,
            rating: null,
        },
        transaction,
    });

    if (sessionStatus === 'abandoned' && userGame.status === 'Completed') {
        return;
    }

    if (!created && userGame.status !== userGameStatus) {
        userGame.status = userGameStatus;
        await userGame.save({ transaction });
    }
};

const incrementPlayStats = async (gameId, transaction) => {
    const [stats] = await db.GamePlayStats.findOrCreate({
        where: { gameId },
        defaults: {
            playCount: 0,
            lastPlay: new Date(),
        },
        transaction,
    });

    await stats.increment('playCount', { by: 1, transaction });
    stats.lastPlay = new Date();
    await stats.save({ transaction });
};

const isStaleSession = (session) => (
    STALE_CANDIDATE_STATUSES.includes(session.status)
    && session.updatedAt
    && new Date(session.updatedAt).getTime() < Date.now() - HEARTBEAT_TIMEOUT_MS
);

const isDeadlockError = (error) => (
    error?.original?.errno === 1213
    || error?.parent?.errno === 1213
    || error?.original?.code === 'ER_LOCK_DEADLOCK'
    || error?.parent?.code === 'ER_LOCK_DEADLOCK'
);

const withDeadlockRetry = async (operation, retries = 2) => {
    try {
        return await operation();
    } catch (error) {
        if (!isDeadlockError(error) || retries <= 0) throw error;

        await new Promise(resolve => setTimeout(resolve, 80));
        return withDeadlockRetry(operation, retries - 1);
    }
};

export const gameSessionService = {
    getActive: async (userId, gameId) => {
        const safeUserId = toPositiveInt(userId, 'userId');
        const where = {
            userId: safeUserId,
            status: ACTIVE_STATUSES,
        };

        if (gameId !== undefined && gameId !== null) {
            where.gameId = toPositiveInt(gameId, 'gameId');
        }

        const session = await db.GameSession.findOne({
            where,
            order: [['updatedAt', 'DESC']],
        });

        if (session && isStaleSession(session)) {
            await gameSessionService.update(safeUserId, {
                sessionId: session.id,
                status: 'abandoned',
            });
            return null;
        }

        return serializeSession(session);
    },

    start: async (userId, { gameId } = {}) => {
        const safeUserId = toPositiveInt(userId, 'userId');
        const safeGameId = toPositiveInt(gameId, 'gameId');

        return withDeadlockRetry(async () => {
            const game = await db.Games.findByPk(safeGameId);
            if (!game) {
                const error = new Error('Game not found');
                error.status = 404;
                throw error;
            }

            const activeSession = await db.GameSession.findOne({
                where: {
                    userId: safeUserId,
                    gameId: safeGameId,
                    status: ACTIVE_STATUSES,
                },
                order: [['updatedAt', 'DESC']],
            });

            if (activeSession && !isStaleSession(activeSession)) {
                if (activeSession.status === 'started') {
                    activeSession.status = 'playing';
                }

                await activeSession.save();
                return serializeSession(activeSession);
            }

            if (activeSession) {
                await db.GameSession.update(
                    {
                        status: 'abandoned',
                    },
                    {
                        where: { id: activeSession.id },
                    }
                );
            }

            await db.GameSession.update(
                {
                    status: 'abandoned',
                },
                {
                    where: {
                        userId: safeUserId,
                        gameId: safeGameId,
                        status: ACTIVE_STATUSES,
                    },
                }
            );

            const session = await db.GameSession.create({
                userId: safeUserId,
                gameId: safeGameId,
                status: 'started',
                data: null,
                result: null,
            });

            await touchUserGame(safeUserId, safeGameId, 'started');
            await incrementPlayStats(safeGameId);

            return serializeSession(session);
        });
    },

    update: async (userId, { sessionId, gameId, status = 'playing', data, result } = {}) => {
        const safeUserId = toPositiveInt(userId, 'userId');
        const safeSessionId = sessionId ? toPositiveInt(sessionId, 'sessionId') : null;
        const safeGameId = gameId ? toPositiveInt(gameId, 'gameId') : null;
        const safeData = assertEventData(data);
        const safeResult = assertSessionResult(result);

        assertSessionStatus(status);

        if (!safeSessionId && !safeGameId) {
            const error = new Error('sessionId or gameId is required');
            error.status = 400;
            throw error;
        }

        return db.sequelize.transaction(async (transaction) => {
            const where = safeSessionId
                ? { id: safeSessionId, userId: safeUserId }
                : { userId: safeUserId, gameId: safeGameId, status: ACTIVE_STATUSES };

            const session = await db.GameSession.findOne({
                where,
                order: [['updatedAt', 'DESC']],
                transaction,
                lock: true,
            });

            if (!session) {
                const error = new Error('Game session not found');
                error.status = 404;
                throw error;
            }

            if (TERMINAL_STATUSES.includes(session.status)) {
                return serializeSession(session);
            }

            session.status = status;

            if (safeData !== null) session.data = safeData;
            if (status === 'finished') {
                session.result = safeResult ?? session.result;
            }
            if (status === 'abandoned') {
                session.result = null;
            }

            await session.save({ transaction });
            await touchUserGame(safeUserId, session.gameId, status, transaction);

            return serializeSession(session);
        });
    },

    handleEvent: async (userId, { gameId, event, data, result, sessionId } = {}) => {
        const safeEvent = assertGameEvent(event);
        const safeData = assertEventData(data);

        if (safeEvent === 'STARTED') {
            const session = await gameSessionService.start(userId, { gameId });

            if (safeData) {
                return gameSessionService.update(userId, {
                    sessionId: session.id,
                    status: 'playing',
                    data: safeData,
                });
            }

            return session;
        }

        const statusByEvent = {
            FINISHED: 'finished',
            ABORTED: 'abandoned',
            PAUSED: 'paused',
            RESUMED: 'playing',
        };

        return gameSessionService.update(userId, {
            sessionId,
            gameId,
            status: statusByEvent[safeEvent],
            data: safeData,
            result,
        });
    },

    markStaleSessionsAsAbandoned: async (olderThanMs = HEARTBEAT_TIMEOUT_MS) => {
        const olderThan = new Date(Date.now() - olderThanMs);

        const [count] = await db.GameSession.update(
            {
                status: 'abandoned',
            },
            {
                where: {
                    status: STALE_CANDIDATE_STATUSES,
                    updatedAt: {
                        [db.Sequelize.Op.lt]: olderThan,
                    },
                },
            }
        );

        return { count };
    },
};

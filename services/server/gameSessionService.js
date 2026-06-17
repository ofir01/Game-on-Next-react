import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const db = require('../../db/models');

const SESSION_RESULTS = ['won', 'lost'];
const GAME_EVENTS = ['STARTED', 'FINISHED', 'ABORTED'];

const USER_GAME_STATUS_BY_SESSION_STATUS = {
    started: 'Playing',
    finished: 'Completed',
    abandoned: 'Dropped',
};

const toPositiveInt = (value, fieldName) => {
    const number = Number(value);

    if (!Number.isInteger(number) || number <= 0) {
        const error = new Error(`${fieldName} must be a positive integer`);
        error.status = 400;
        throw error;
    }

    return number;
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

const assertGameEvent = (event) => {
    const safeEvent = String(event || '').toUpperCase();

    if (!GAME_EVENTS.includes(safeEvent)) {
        const error = new Error(`event must be one of: ${GAME_EVENTS.join(', ')}`);
        error.status = 400;
        throw error;
    }

    return safeEvent;
};

const assertSessionResult = (result) => {
    if (result === undefined || result === null) return null;

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

const resolveGame = async (gameId, transaction) => {
    const safeGameId = toPositiveInt(gameId, 'gameId');
    const game = await db.Games.findByPk(safeGameId, { transaction });

    if (!game) {
        const error = new Error('Game not found');
        error.status = 404;
        throw error;
    }

    return game;
};

const getScore = (data) => {
    if (typeof data === 'number') return data;
    if (typeof data?.score === 'number') return data.score;

    const parsedScore = Number(data?.score);
    return Number.isFinite(parsedScore) ? parsedScore : null;
};

const serializeSession = (session) => {
    const plain = session?.get ? session.get({ plain: true }) : session;
    if (!plain) return null;

    return {
        id: plain.id,
        gameId: plain.gameId,
        status: plain.status,
        result: plain.result,
        data: plain.data,
        durationSeconds: plain.durationSeconds,
        createdAt: plain.createdAt,
        updatedAt: plain.updatedAt,
    };
};

const serializeHighScore = (highScore) => {
    const plain = highScore?.get ? highScore.get({ plain: true }) : highScore;
    if (!plain) return null;

    return {
       // id: plain.id,
       // gameId: plain.gameId,
        name: plain.user?.name || 'Player',
        score: plain.score,
        data: plain.data,
        updatedAt: plain.updatedAt,
    };
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

    if (sessionStatus === 'abandoned' && userGame.status === 'Completed') return;

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

const updateHighScore = async (userId, gameId, data, transaction) => {
    const score = getScore(data);
    if (score === null) return null;

    const [highScore, created] = await db.HighScore.findOrCreate({
        where: { userId, gameId },
        defaults: {
            score,
            data,
        },
        transaction,
        lock: true,
    });

    if (!created && score > highScore.score) {
        highScore.score = score;
        highScore.data = data;
        await highScore.save({ transaction });
    }

    return highScore;
};

export const gameSessionService = {
    getTopWinners: async ({ gameId, limit = 3 } = {}) => {
        const safeGameId = toPositiveInt(gameId, 'gameId');
        const safeLimit = Math.min(toPositiveInt(limit, 'limit'), 20);

        await resolveGame(safeGameId);

        const highScores = await db.HighScore.findAll({
            where: { gameId: safeGameId },
            include: [{
                model: db.User,
                as: 'user',
                attributes: ['name'],
            }],
            order: [['score', 'DESC'], ['updatedAt', 'ASC']],
            limit: safeLimit,
        });

        return highScores.map(serializeHighScore).filter(Boolean);
    },

    start: async (userId, { gameId } = {}) => {
        const safeUserId = toPositiveInt(userId, 'userId');

        return db.sequelize.transaction(async (transaction) => {
            const game = await resolveGame(gameId, transaction);

            const session = await db.GameSession.create({
                userId: safeUserId,
                gameId: game.id,
                status: 'started',
                data: null,
                result: null,
            }, { transaction });

            await touchUserGame(safeUserId, game.id, 'started', transaction);
            await incrementPlayStats(game.id, transaction);

            return serializeSession(session);
        });
    },

    finish: async (userId, { sessionId, gameId, data, result } = {}) => {
        const safeUserId = toPositiveInt(userId, 'userId');
        const safeData = assertEventData(data);
        const safeResult = assertSessionResult(result) || 'lost';

        return db.sequelize.transaction(async (transaction) => {
            const game = await resolveGame(gameId, transaction);
            let session = null;

            if (sessionId) {
                session = await db.GameSession.findOne({
                    where: {
                        id: toPositiveInt(sessionId, 'sessionId'),
                        userId: safeUserId,
                        gameId: game.id,
                    },
                    transaction,
                    lock: true,
                });
            }

            if (!session) {
                session = await db.GameSession.create({
                    userId: safeUserId,
                    gameId: game.id,
                    status: 'started',
                    data: null,
                    result: null,
                }, { transaction });
            }

            session.status = 'finished';
            session.result = safeResult;
            session.data = safeData;
            await session.save({ transaction });

            await touchUserGame(safeUserId, game.id, 'finished', transaction);

            if (safeResult === 'won') {
                await updateHighScore(safeUserId, game.id, safeData, transaction);
            }

            return serializeSession(session);
        });
    },

    abandon: async (userId, { sessionId, gameId } = {}) => {
        const safeUserId = toPositiveInt(userId, 'userId');

        return db.sequelize.transaction(async (transaction) => {
            const game = await resolveGame(gameId, transaction);
            const session = await db.GameSession.findOne({
                where: {
                    id: toPositiveInt(sessionId, 'sessionId'),
                    userId: safeUserId,
                    gameId: game.id,
                },
                transaction,
                lock: true,
            });

            if (!session) {
                const error = new Error('Game session not found');
                error.status = 404;
                throw error;
            }

            session.status = 'abandoned';
            session.result = null;
            await session.save({ transaction });

            await touchUserGame(safeUserId, game.id, 'abandoned', transaction);

            return serializeSession(session);
        });
    },

    handleEvent: async (userId, payload = {}) => {
        const safeEvent = assertGameEvent(payload.event);

        if (safeEvent === 'STARTED') {
            return gameSessionService.start(userId, payload);
        }

        if (safeEvent === 'FINISHED') {
            return gameSessionService.finish(userId, payload);
        }

        return gameSessionService.abandon(userId, payload);
    },
};

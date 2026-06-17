'use strict';

const HighScores = require('../data/highScores.json');

module.exports = {
    async up(queryInterface) {
        const rows = HighScores.map(score => ({
            id: score.id,
            userId: score.userId,
            gameId: score.gameId,
            score: score.score,
            data: score.data ? JSON.stringify(score.data) : null,
            createdAt: new Date(score.createdAt),
            updatedAt: new Date(score.updatedAt),
        }));

        await queryInterface.bulkInsert('high_scores', rows, {});
    },

    async down(queryInterface) {
        await queryInterface.bulkDelete('high_scores', null, {});
    },
};

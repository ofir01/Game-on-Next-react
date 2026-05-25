'use strict';

const TABLE_NAME = 'game_sessions';

module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable(TABLE_NAME);

        if (!table.data) {
            await queryInterface.addColumn(TABLE_NAME, 'data', {
                type: Sequelize.JSON,
                allowNull: true,
            });
        }

        if (table.score) {
            await queryInterface.removeColumn(TABLE_NAME, 'score');
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable(TABLE_NAME);

        if (!table.score) {
            await queryInterface.addColumn(TABLE_NAME, 'score', {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            });
        }

        if (table.data) {
            await queryInterface.removeColumn(TABLE_NAME, 'data');
        }
    },
};

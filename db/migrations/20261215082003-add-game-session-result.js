'use strict';

const TABLE_NAME = 'game_sessions';
const COLUMN_NAME = 'result';

module.exports = {
    async up(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable(TABLE_NAME);

        if (!table[COLUMN_NAME]) {
            await queryInterface.addColumn(TABLE_NAME, COLUMN_NAME, {
                type: Sequelize.ENUM('won', 'lost'),
                allowNull: true,
            });
        }
    },

    async down(queryInterface) {
        const table = await queryInterface.describeTable(TABLE_NAME);

        if (table[COLUMN_NAME]) {
            await queryInterface.removeColumn(TABLE_NAME, COLUMN_NAME);
        }
    },
};

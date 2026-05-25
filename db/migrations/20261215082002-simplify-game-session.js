'use strict';

const TABLE_NAME = 'game_sessions';
const REMOVED_COLUMNS = ['startedAt', 'finishedAt', 'lastHeartbeat', 'durationSeconds', 'metadata'];

module.exports = {
    async up(queryInterface) {
        const table = await queryInterface.describeTable(TABLE_NAME);

        if (table.startedAt) {
            await queryInterface.removeIndex(TABLE_NAME, ['startedAt']).catch(() => {});
        }

        for (const columnName of REMOVED_COLUMNS) {
            if (table[columnName]) {
                await queryInterface.removeColumn(TABLE_NAME, columnName);
            }
        }
    },

    async down(queryInterface, Sequelize) {
        const table = await queryInterface.describeTable(TABLE_NAME);

        if (!table.startedAt) {
            await queryInterface.addColumn(TABLE_NAME, 'startedAt', {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            });
        }

        if (!table.finishedAt) {
            await queryInterface.addColumn(TABLE_NAME, 'finishedAt', {
                type: Sequelize.DATE,
                allowNull: true,
            });
        }

        if (!table.lastHeartbeat) {
            await queryInterface.addColumn(TABLE_NAME, 'lastHeartbeat', {
                type: Sequelize.DATE,
                allowNull: true,
            });
        }

        if (!table.durationSeconds) {
            await queryInterface.addColumn(TABLE_NAME, 'durationSeconds', {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            });
        }

        if (!table.metadata) {
            await queryInterface.addColumn(TABLE_NAME, 'metadata', {
                type: Sequelize.JSON,
                allowNull: true,
            });
        }

        await queryInterface.addIndex(TABLE_NAME, ['startedAt']).catch(() => {});
    },
};

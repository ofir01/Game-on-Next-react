'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {

        await queryInterface.createTable('game_sessions', {

            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },

            userId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'users',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },

            gameId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'games',
                    key: 'id',
                },
                onDelete: 'CASCADE',
                onUpdate: 'CASCADE',
            },

            status: {
                type: Sequelize.ENUM(
                    'started',
                    'playing',
                    'paused',
                    'finished',
                    'abandoned'
                ),
                allowNull: false,
                defaultValue: 'started',
            },

            data: {
                type: Sequelize.JSON,
                allowNull: true,
            },

            result: {
                type: Sequelize.ENUM('won', 'lost'),
                allowNull: true,
            },

            createdAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },

            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },

        });

        // אינדקסים
        await queryInterface.addIndex('game_sessions', ['userId']);

        await queryInterface.addIndex('game_sessions', ['gameId']);

        await queryInterface.addIndex('game_sessions', ['status']);
    },

    async down(queryInterface, Sequelize) {

        await queryInterface.dropTable('game_sessions');

        // חשוב ל-PostgreSQL כדי למחוק ENUM
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_game_sessions_status";'
        );
    }
};

'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('high_scores', {
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

            score: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            data: {
                type: Sequelize.JSON,
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

        await queryInterface.addIndex('high_scores', ['userId', 'gameId'], {
            unique: true,
            name: 'high_scores_user_game_unique',
        });

        await queryInterface.addIndex('high_scores', ['gameId', 'score'], {
            name: 'high_scores_game_score_index',
        });
    },

    async down(queryInterface) {
        await queryInterface.dropTable('high_scores');
    },
};

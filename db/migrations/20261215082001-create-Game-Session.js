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

            // עמודות ייעודיות לטובת מיון ושליפה קלה של הטופ 3
            score: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            durationSeconds: {
                type: Sequelize.INTEGER,
                allowNull: false,
                defaultValue: 0,
            },

            result: {
                type: Sequelize.ENUM('won', 'lost'),
                allowNull: true,
            },

            // עמודה למידע נוסף שאינו דורש מיון או חיפוש אינטנסיבי
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

        // אינדקסים בסיסיים
        await queryInterface.addIndex('game_sessions', ['userId']);
        await queryInterface.addIndex('game_sessions', ['gameId']);
        await queryInterface.addIndex('game_sessions', ['status']);

        // אינדקס ייעודי וחשוב לשליפה מהירה של דירוג השחקנים 
        // מותאם לשליפת המנצחים, מהניקוד הגבוה לנמוך, והזמן מהנמוך לגבוה
        await queryInterface.addIndex('game_sessions', ['gameId', 'result', 'score', 'durationSeconds'], {
            name: 'game_sessions_leaderboard_index'
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('game_sessions');

        // מחיקת סוגי ה-ENUM כדי למנוע שגיאות ביצירה מחדש (חשוב ל-PostgreSQL)
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_game_sessions_status";'
        );
        await queryInterface.sequelize.query(
            'DROP TYPE IF EXISTS "enum_game_sessions_result";'
        );
    }
};
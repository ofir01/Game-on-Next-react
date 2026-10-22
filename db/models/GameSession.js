module.exports = (sequelize, DataTypes) => {
    const GameSession = sequelize.define('game_sessions', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },

        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },

        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'games',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },

        status: {
            type: DataTypes.ENUM(
                'started',
                'playing',
                'paused',
                'finished',
                'abandoned'
            ),
            allowNull: false,
            defaultValue: 'started',
        },

        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        // עמודה אמתית במסד הנתונים כדי לאפשר מיון מהיר ב-SQL
        durationSeconds: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        result: {
            type: DataTypes.ENUM('won', 'lost'),
            allowNull: true,
        },

        data: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    }, {
        timestamps: true,

        indexes: [
            {
                fields: ['userId'],
            },
            {
                fields: ['gameId'],
            },
            {
                fields: ['status'],
            },
            // אינדקס מורכב לשליפת 3 המובילים במהירות מרבית
            {
                name: 'game_sessions_leaderboard_index',
                fields: ['gameId', 'result', 'score', 'durationSeconds'],
            },
        ],
    });

    GameSession.associate = (models) => {
        GameSession.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });

        GameSession.belongsTo(models.Games, {
            foreignKey: 'gameId',
            as: 'game',
        });
    };

    return GameSession;
};
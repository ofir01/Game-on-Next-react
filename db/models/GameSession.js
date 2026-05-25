module.exports = (sequelize, DataTypes) => {

    const GameSession = sequelize.define('GameSession', {

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

        data: {
            type: DataTypes.JSON,
            allowNull: true,
        },

        result: {
            type: DataTypes.ENUM('won', 'lost'),
            allowNull: true,
        },

        durationSeconds: {
            type: DataTypes.VIRTUAL,
            get() {
                const createdAt = this.getDataValue('createdAt');
                const updatedAt = this.getDataValue('updatedAt');
                if (!createdAt || !updatedAt) return 0;

                return Math.max(
                    0,
                    Math.floor((new Date(updatedAt).getTime() - new Date(createdAt).getTime()) / 1000)
                );
            },
        },

    }, {
        tableName: 'game_sessions',
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
        ],
    });

    GameSession.associate = (models) => {

        // קשר למשתמש
        GameSession.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });

        // קשר למשחק
        GameSession.belongsTo(models.Games, {
            foreignKey: 'gameId',
            as: 'game',
        });

    };

    return GameSession;
};




module.exports = (sequelize, DataTypes) => {
    const HighScore = sequelize.define('HighScore', {
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

        score: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },

        data: {
            type: DataTypes.JSON,
            allowNull: true,
        },
    }, {
        tableName: 'high_scores',
        timestamps: true,
        indexes: [
            {
                unique: true,
                fields: ['userId', 'gameId'],
            },
            {
                fields: ['gameId', 'score'],
            },
        ],
    });

    HighScore.associate = (models) => {
        HighScore.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user',
        });

        HighScore.belongsTo(models.Games, {
            foreignKey: 'gameId',
            as: 'game',
        });
    };

    return HighScore;
};

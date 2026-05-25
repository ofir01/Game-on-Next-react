module.exports = (sequelize, DataTypes) => {
    const UserGame = sequelize.define('UserGame', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'games',
                key: 'id'
            }
        },
        status: {
            type: DataTypes.ENUM('Backlog', 'Playing', 'Completed', 'Dropped'),
            defaultValue: 'Backlog',
            allowNull: false
        },
        rating: {
            type: DataTypes.INTEGER,
            allowNull: true,
            validate: {
                min: 1,
                max: 5
            }
        },
        isFavorite: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false // שיניתי ל-false כי יש לו DefaultValue
        }
    }, {
        tableName: 'user_games',
        timestamps: true,
        //  האינדקס שמונע כפילויות ומאפשר ל-upsert לעבוד!
        indexes: [
            {
                unique: true,
                fields: ['userId', 'gameId']
            }
        ]
    });

    UserGame.associate = (models) => {
        // הקשר למשתמש
        UserGame.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user' 
        });
        // הקשר למשחק
        UserGame.belongsTo(models.Games, {
            foreignKey: 'gameId',
            as: 'game'
        });
    };

    return UserGame;
};
module.exports = (sequelize, DataTypes) => {
    const GamePlayStats = sequelize.define('GamePlayStats',{
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            gameId: {
                type: DataTypes.INTEGER,
                allowNull: false,
                unique: true,
            },
            playCount: {
                type: DataTypes.INTEGER,
                defaultValue: 0,
            },
            lastPlay: {
                type: DataTypes.DATE,
            },
        },
        {
            tableName: 'game_play_stats',
            timestamps: true,
        }
    )

    GamePlayStats.associate = (models) => {
        GamePlayStats.belongsTo(models.Games, {
            foreignKey: 'gameId', //מתייחס לעמודה שלנו שתיקשר למפתח הראשי ששם
            as: 'stats',
            onDelete: 'CASCADE',
        })
    }

    return GamePlayStats
}

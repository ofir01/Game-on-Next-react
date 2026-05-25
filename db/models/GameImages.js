module.exports = (sequelize, DataTypes) => {
    const GameImages = sequelize.define('GameImages', {
        gameId: {
            allowNull: false,
            type: DataTypes.INTEGER,
            field: 'game_id',
            primaryKey: true
        },
        url: {
            type: DataTypes.STRING,
            allowNull: false,
            primaryKey: true
        }
    }, {
        tableName: 'game_images',
        timestamps: false
    });

    return GameImages;
}
module.exports = (sequelize, DataTypes) => {
    const GameCategories = sequelize.define('GameCategories', {
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true, 
            field: 'game_id', 
            references: {
                model: 'games',
                key: 'id'
            }
        },
        categoryId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            field: 'category_id', 
            references: {
                model: 'categories',
                key: 'id'
            }
        },
    }, {
        tableName: 'game_categories', 
        timestamps: false
    });

    GameCategories.associate = (models) => {
        GameCategories.belongsTo(models.Games, { foreignKey: 'gameId', as: 'game' });
        GameCategories.belongsTo(models.Category, { foreignKey: 'categoryId', as: 'category' });
    };

    return GameCategories;
};
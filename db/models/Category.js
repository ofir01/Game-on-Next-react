module.exports = (sequelize, DataTypes) => {
    const Category = sequelize.define('Category', {
        id: {
            autoIncrement: true,
            primaryKey: true,
            type: DataTypes.INTEGER
        },
        name: {
            allowNull: false,
            type: DataTypes.STRING,
        }
    }, {
        tableName: 'categories',
        timestamps: false
    });

    Category.associate = (models) => {
        Category.belongsToMany(models.Games, {
            through: models.GameCategories, // טבלת המעבר בין משחקים לקטגוריות
            foreignKey: 'categoryId',      // המזהה של הקטגוריה לפי המודל ולא המיגרציה (אני)
            otherKey: 'gameId',            // המזהה של המשחק (הצד השני)
            as: 'games'
        });
    };

    return Category;
};
module.exports = (sequelize, DataTypes) => {
    const Wishlist = sequelize.define('Wishlist', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
            // ברגע שמשתמש נמחק, תמחק את כל ה-Wishlist שלו
            onDelete: 'CASCADE',
        },
        gameId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Games',
                key: 'id',
            },
            // ברגע שמשחק נמחק, תסיר אותו מכל ה-Wishlists של כל המשתמשים
            onDelete: 'CASCADE',
        },
        addedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        }
    }, {
        timestamps: false,
        tableName: 'wishlists'
    });

   Wishlist.associate = (models) => {
    Wishlist.belongsTo(models.User, { foreignKey: 'userId', as: 'user' });
    
    Wishlist.belongsTo(models.Games, { 
        foreignKey: 'gameId', 
        as: 'game', 
        onDelete: 'CASCADE' 
    });
};
 


    return Wishlist;
}




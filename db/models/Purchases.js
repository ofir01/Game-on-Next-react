module.exports = (sequelize, DataTypes) => {
    const Purchase = sequelize.define('purchases', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Users', key: 'id' } // קשר לטבלת משתמשים
        },
        gameId: {
            type:DataTypes.INTEGER,
            allowNull: false,
            references: { model: 'Games', key: 'id' } // קשר לטבלת משחקים
        },
        pricePaid: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            comment: 'המחיר ששולם בפועל בעת הרכישה (מונע בעיות אם מחיר המשחק ישתנה)'
        },
        transactionId: {
            type: DataTypes.STRING,
            allowNull: false,
            comment: 'מזהה העסקה שהתקבל מחברת הסליקה'
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed', 'refunded'),
            allowNull: false,
            defaultValue: 'pending',
        },
        refundedAt: {
            allowNull: true,
            type: DataTypes.DATE,
        }
    }, {
       // tableName: 'purchases',
        timestamps: true, 
    });

    Purchase.associate = (models) => {
        // הקשר למשתמש
        Purchase.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });
        // הקשר למשחק
        Purchase.belongsTo(models.Games, {
            foreignKey: 'gameId',
            as: 'game'
        });
    };

    return Purchase;
};




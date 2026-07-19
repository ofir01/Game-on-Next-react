module.exports = (sequelize, DataTypes) => {
    const Warning = sequelize.define('Warning', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        adminId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        reason: {
            type: DataTypes.TEXT,
            allowNull: false,
        }
    }, {
        tableName: 'warning',
        timestamps: true, // יוצר אוטומטית createdAt ו-updatedAt (תאריך מתן האזהרה)
    });

    Warning.associate = (models) => {
        // אזהרה שייכת למשתמש ספציפי שקיבל אותה
        Warning.belongsTo(models.User, {
            foreignKey: 'userId',
            as: 'user'
        });

        // אזהרה שייכת למנהל (שהוא גם משתמש במערכת) שייצר אותה
        Warning.belongsTo(models.User, {
            foreignKey: 'adminId',
            as: 'admin'
        });
    };

    return Warning;
};
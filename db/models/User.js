
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(50),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        role: {
            type: DataTypes.STRING,
            defaultValue: 'USER',
            allowNull: false
        },
        // שדות לאיפוס סיסמה
        resetPasswordToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        resetPasswordExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        // שדות לאימות אימייל
        isVerified: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        verificationToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        tokenExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        // שדות לאימות שינוי אימייל
        pendingEmail: {
            type: DataTypes.STRING,
            allowNull: true,
            validate: {
                isEmail: true,
            },
        },
        emailToken: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        emailTokenExpires: {
            type: DataTypes.DATE,
            allowNull: true,
        },
    }, {
        tableName: 'users',
        timestamps: true, // מאפשר יצירת שדות createdAt ו-updatedAt אוטומטית
    });
    

    User.associate = (models) => {
        User.hasMany(models.UserGame, { foreignKey: 'userId', as: 'userRatings' });

        User.hasMany(models.GameSession, { foreignKey: 'userId', as: 'gameSessions' });
        User.hasMany(models.HighScore, { foreignKey: 'userId', as: 'highScores' });

        User.hasMany(models.Comment, { foreignKey: 'userId', as: 'comments' })


        User.belongsToMany(models.Games, {
            through: models.Wishlist, // כאן חייב לציין את ה-through
            foreignKey: 'userId',
            as: 'wishlistGames'
        });
    };
    return User;
};

module.exports = (sequelize, DataTypes) => {
    const Games = sequelize.define('Games', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: DataTypes.TEXT,
        imageUrl: DataTypes.STRING,
        gameUrl: DataTypes.STRING,

        // --- שדות מחיר וסטטוס קיימים ---
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0.00,
        },
        status: {
            type: DataTypes.ENUM('AVAILABLE', 'COMING SOON', 'BETA', 'OUT OF STOCK'),
            allowNull: false,
            defaultValue: 'AVAILABLE',
        },
        releaseDate: {
            type: DataTypes.DATE,
            allowNull: true,
        },

        // ==========================================
        // שדות הנחה  (Discount System)
        // ==========================================
        discountPercentage: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            validate: {
                min: 0,
                max: 100
            }
        },
        discountUntil: {
            type: DataTypes.DATE,
            allowNull: true, // אם null, ההנחה קבועה עד שינוי ידני
        },

        // --- שדה וירטואלי: מחיר סופי אחרי הנחה ---
        finalPrice: {
            type: DataTypes.VIRTUAL,
            get() {
                const rawPrice = parseFloat(this.getDataValue('price'));
                const discount = this.getDataValue('discountPercentage');
                const until = this.getDataValue('discountUntil');
                
                const now = new Date();
                const isDiscountValid = discount > 0 && (!until || new Date(until) > now);

                if (isDiscountValid) {
                    const savings = rawPrice * (discount / 100);
                    return parseFloat((rawPrice - savings).toFixed(2));
                }
                return rawPrice;
            }
        },

        // --- שדה וירטואלי: האם המשחק במבצע כרגע? ---
        isOnSale: {
            type: DataTypes.VIRTUAL,
            get() {
                const discount = this.getDataValue('discountPercentage');
                const until = this.getDataValue('discountUntil');
                const now = new Date();
                
                return discount > 0 && (!until || new Date(until) > now);
            }
        }
        // ==========================================

    }, {
        tableName: 'games',
        timestamps: true,
    });

    Games.associate = (models) => {
        // קטגוריות
        Games.belongsToMany(models.Category, {
            through: models.GameCategories,
            foreignKey: 'gameId',
            otherKey: 'categoryId',
            as: 'categories'
        });

        // סטטוס משחק בספרייה (שוחק, לא שוחק וכו')
        Games.hasMany(models.UserGame, { as: 'userStatus', foreignKey: 'gameId' });

        // סטטיסטיקות משחק (Play Count וכו')
        Games.hasOne(models.GamePlayStats, { foreignKey: 'gameId', as: 'stats' });

        // סשנים של משתמשים במשחק
        Games.hasMany(models.GameSession, { foreignKey: 'gameId', as: 'sessions' });
        Games.hasMany(models.HighScore, { foreignKey: 'gameId', as: 'highScores' });

        // תגובות
        Games.hasMany(models.Comment, { foreignKey: 'gameId', as: 'comments' });

        // גלריית תמונות
        Games.hasMany(models.GameImages, { foreignKey: 'gameId', onDelete: 'CASCADE', as: 'images' });

        // Wishlist
        Games.belongsToMany(models.User, { // קשר Many-to-Many עם משתמשים דרך טבלת Wishlist
            through: models.Wishlist, // טבלת מעבר בין משתמשים למשחקים ברשימת המשאלות
            foreignKey: 'gameId',
            as: 'wishlistStatus'
        });

       
    };

    return Games;
};

module.exports = (sequelize, DataTypes) => {
    const News = sequelize.define('News', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        // שינינו את content ל-excerpt בהתאם לטופס החדש
        excerpt: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        category: {
            type: DataTypes.STRING,
            allowNull: false,
            defaultValue: 'Update', // ערך ברירת מחדל
        },
        image: {
            // שימוש ב-STRING עם אורך מוגדל ל-1000 כדי לתמוך ב-URLs ארוכים של תמונות
            type: DataTypes.STRING(1000),
            allowNull: true,
        },
        isHot: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false,
        }
    },
        {
            tableName: 'news',
            timestamps: true,
        });

    return News;
};
module.exports = (sequelize, DataTypes) => {
    const ActivityLog = sequelize.define('ActivityLog', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false, // מי המשתמש שביצע את הפעולה
        },
        action: {
            type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN'),
            allowNull: false
        },
        targetType: {
            type: DataTypes.STRING, // למשל: 'News', 'Game', 'User'
            allowNull: false
        },
        targetId: {
            type: DataTypes.STRING, // ה-ID של האובייקט שהשתנה
            allowNull: true
        },
        ipAddress: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        // --- הגדרות מודל (האובייקט השלישי) ---
        tableName: 'activity_log',
        timestamps: true,
        underscored: false // מומלץ: הופך את createdAt ל-created_at ב-DB
    });

    return ActivityLog;
};
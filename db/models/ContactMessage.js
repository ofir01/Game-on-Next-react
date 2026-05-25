
module.exports = (sequelize, DataTypes) => {
    const ContactMessage = sequelize.define('ContactMessage', {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        fullName: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "נא להזין שם מלא" },
                len: [2, 50],
            },
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                isEmail: { msg: "כתובת האימייל אינה תקינה" },
                notEmpty: { msg: "נא להזין אימייל" },
            },
        },
        subject: {
            type: DataTypes.ENUM('GENERAL', 'SUPPORT', 'FEEDBACK', 'PARTNERSHIP'),
            defaultValue: 'GENERAL',
        },
        message: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                len: {
                    args: [10, 2000],
                    msg: "ההודעה חייבת להכיל בין 10 ל-2000 תווים",
                },
            },
        },
        status: {
            type: DataTypes.ENUM('NEW', 'READ', 'IN_PROGRESS', 'RESOLVED', 'SPAM'),
            defaultValue: 'NEW',
        },
        // שיוך למשתמש רשום (אופציונלי)
        userId: {
            type: DataTypes.UUID, // וודא שזה תואם לסוג ה-ID של מודל ה-User שלך
            allowNull: true,
        },
        // שדות טכניים למעקב ואבטחה
        userIp: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        userAgent: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        adminNotes: {
            type: DataTypes.TEXT,
            allowNull: true,
        }
    }, {
        // הגדרות נוספות
        tableName: 'contact_messages',
        timestamps: true, // יוצר אוטומטית createdAt ו-updatedAt
    });

    return ContactMessage;

}




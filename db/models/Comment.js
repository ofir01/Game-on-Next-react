module.exports = (sequelize, DataTypes) => {
    const Comment = sequelize.define(
        'Comment',
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            content: {
                type: DataTypes.TEXT,
                allowNull: false,
            },
            gameId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            userId: {
                type: DataTypes.INTEGER,
                allowNull: false,
            },
            parentId: {
                type: DataTypes.INTEGER,
                allowNull: true,
            },
            isDeleted: {
                type: DataTypes.BOOLEAN,
                defaultValue: false
            }
        },
        {
            tableName: 'comments',
            timestamps: true,
            indexes: [ // אינדקסים לשיפור ביצועים על השדות שמשמשים לחיפושים וסינון
                { fields: ['parentId'] },
                { fields: ['userId'] },
            ],
        }
    )

    /* ===== Relations ===== */
    Comment.associate = (models) => {
        // לכל תגובה יש משתמש אחד בלבד שכתב אותה
        Comment.belongsTo(models.User, {
            foreignKey: 'userId',
            onDelete: 'CASCADE',
        })

        // לכל תגובה יש משחק אחד בלבד שהיא שייכת אליו
        Comment.belongsTo(models.Games, {
            foreignKey: 'gameId',
            onDelete: 'CASCADE',
        })



        // Self relation (comment tree)
        Comment.belongsTo(Comment, {
            as: 'parent',
            foreignKey: 'parentId',
        })

        Comment.hasMany(Comment, {
            as: 'replies',
            foreignKey: 'parentId',
        })
    }

    return Comment
}

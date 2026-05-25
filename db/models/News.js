
module.exports = (sequelize,DataTypes) => {
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
        content: { 
            type: DataTypes.TEXT,
            allowNull: false,
        },
    },
        {
            tableName: 'news',
            timestamps: true,
        });

    return News;
};


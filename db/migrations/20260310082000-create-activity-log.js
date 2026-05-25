'use strict';

module.exports = {
    up: async (queryInterface, Sequelize) => {
        await queryInterface.createTable('activity_log', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            userId: {
                type: Sequelize.INTEGER,
                allowNull: true, // מאפשר לוגים גם לאורחים אם תרצה
                references: {
                    model: 'Users', // מוודא קשר לטבלת משתמשים
                    key: 'id'
                },
                onUpdate: 'CASCADE',
                onDelete: 'SET NULL'
            },
            action: {
                type: Sequelize.ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN'),
                allowNull: false
            },
            targetType: {
                type: Sequelize.STRING,
                allowNull: false
            },
            targetId: {
                type: Sequelize.STRING,
                allowNull: true
            },
            ipAddress: {
                type: Sequelize.STRING,
                allowNull: true
            },
            createdAt: {
                allowNull: false,
                type: Sequelize.DATE
            },
            updatedAt: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.dropTable('activity_log');
        // חשוב: כשמשתמשים ב-ENUM בפוסטגרס, לפעמים צריך למחוק גם את הטיפוס עצמו
        // await queryInterface.sequelize.query('DROP TYPE IF EXISTS "enum_ActivityLogs_action";');
    }
};
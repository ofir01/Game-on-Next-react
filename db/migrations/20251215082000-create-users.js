'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('users', {
            id: {
                type: Sequelize.INTEGER,
                autoIncrement: true,
                primaryKey: true,
                allowNull: false,
            },
            name: {
                type: Sequelize.STRING(50),
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING(100),
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            role: {
                type: Sequelize.STRING(50),
                defaultValue: 'USER',
                allowNull: false
            },
            resetPasswordToken: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            resetPasswordExpires: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            isVerified: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
            },
            verificationToken: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            tokenExpires: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            pendingEmail: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            emailToken: {
                type: Sequelize.STRING,
                allowNull: true,
            },
            emailTokenExpires: {
                type: Sequelize.DATE,
                allowNull: true,
            },
            isBanned: {
                type: Sequelize.BOOLEAN,
                defaultValue: false,
                allowNull: false,
            },
            createdAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
            },
            updatedAt: {
                type: Sequelize.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
            },
        });
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('users');
    },
};
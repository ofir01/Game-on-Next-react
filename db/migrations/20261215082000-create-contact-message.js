'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('contact_messages', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      fullName: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false
      },
      subject: {
        type: Sequelize.ENUM('GENERAL', 'SUPPORT', 'FEEDBACK', 'PARTNERSHIP'),
        defaultValue: 'GENERAL',
        allowNull: false
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false
      },
      status: {
        type: Sequelize.ENUM('NEW', 'READ', 'IN_PROGRESS', 'RESOLVED', 'SPAM'),
        defaultValue: 'NEW',
        allowNull: false
      },
      userId: {
        type: Sequelize.INTEGER, // שינוי מ-UUID ל-INTEGER
        allowNull: true,
        references: {
          model: 'users', // שינוי מ-Users ל-users (אותיות קטנות כמו במיגרציה שלך)
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL'
      },
      userIp: {
        type: Sequelize.STRING(45), // תומך גם ב-IPv6
        allowNull: true
      },
      userAgent: {
        type: Sequelize.STRING,
        allowNull: true
      },
      adminNotes: {
        type: Sequelize.TEXT,
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

    // הוספת אינדקס לשיפור ביצועי חיפוש לפי אימייל או סטטוס
    await queryInterface.addIndex('contact_messages', ['email']);
    await queryInterface.addIndex('contact_messages', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('contact_messages');
  }
};
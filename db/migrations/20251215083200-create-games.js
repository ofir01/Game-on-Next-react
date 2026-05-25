'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('games', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      imageUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      gameUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      price: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
      },

      // --- שדות הנחה חדשים ---
      discountPercentage: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      discountUntil: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      // -----------------------

      status: {
        type: Sequelize.ENUM('AVAILABLE', 'COMING SOON', 'BETA', 'OUT OF STOCK'),
        allowNull: false,
        defaultValue: 'AVAILABLE',
      },
      releaseDate: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('games');
    // הערה חשובה: אם אתה משתמש ב-Postgres, ה-ENUM נשאר בזיכרון של ה-DB 
    // גם אחרי Drop Table. ב-MySQL זה לא קורה.
  }
};
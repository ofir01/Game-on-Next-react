'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_games', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'games',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('Backlog', 'Playing', 'Completed', 'Dropped'),
        defaultValue: 'Backlog',
        allowNull: false
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: true
      },
      isFavorite: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false // מומלץ לשנות ל-false כי יש לו DefaultValue
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });

    // הוספת האינדקס הייחודי - זה מה שיפתור את בעיית הכפילויות!
    await queryInterface.addIndex('user_games', ['userId', 'gameId'], {
      unique: true,
      name: 'user_game_unique_index' // שם לאינדקס (אופציונלי אבל מומלץ)
    });
  },

  async down(queryInterface, Sequelize) {
    // ב-down, הסרת הטבלה כבר מסירה את האינדקסים שלה אוטומטית
    await queryInterface.dropTable('user_games');
  }
};
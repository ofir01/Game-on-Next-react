'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('wishlists', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // ודא שזה שם הטבלה המדויק ב-DB שלך
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // מוחק את הרשימה אם המשתמש נמחק
      },
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Games', 
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // מסיר מהרשימה אם המשחק נמחק
      },
      addedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // הוספת Index כדי למנוע כפילויות (אותו משתמש לא יכול להוסיף אותו משחק פעמיים)
    await queryInterface.addIndex('wishlists', ['userId', 'gameId'], {
      unique: true,
      name: 'unique_user_game_wishlist'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('wishlists');
  }
};
'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_images', {
      gameId: {
        allowNull: false,
        type: Sequelize.INTEGER,
        field: 'game_id',
        primaryKey: true,

        references: {
          model: 'games', // שם הטבלה במסד הנתונים (בדרך כלל ברבים)
          key: 'id'       // העמודה שאליה מקשרים בטבלת האם
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'  // זה מה שימחק את התמונה כשהמשחק נמחק
      },
      url: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true
      },

    }, {
      indexes: {
        unique: ['game_id', 'url']
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('game_images');
  }
};
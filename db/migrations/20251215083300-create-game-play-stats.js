'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('game_play_stats', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
      },
      playCount: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      lastPlay: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // הוספת foreign key ל-games
    await queryInterface.addConstraint('game_play_stats', {
      fields: ['gameId'],
      type: 'foreign key',
      name: 'fk_game_play_stats_game',
      references: {
        table: 'games',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('game_play_stats');
  }
};

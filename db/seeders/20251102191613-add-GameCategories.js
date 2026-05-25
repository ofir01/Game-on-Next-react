'use strict';
const GameCategories = require('../data/GameCategories.json');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const data = GameCategories.map(item => ({
      game_id: item.gameId,    
      category_id: item.categoryId,     
    }));

    await queryInterface.bulkInsert('game_categories', data, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('game_categories', null, {});
  }
};






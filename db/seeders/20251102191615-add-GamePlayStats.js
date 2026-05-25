'use strict';
const GamePlayStats = require('../data/GamePlayStats.json');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('game_play_stats', GamePlayStats, {});//בגלל שאין שינוי בעמודות לכן זה נשאר ככה
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('game_play_stats', null, {});
  }
};






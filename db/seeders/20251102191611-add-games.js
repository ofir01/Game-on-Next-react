'use strict';
const games = require('../data/games.json');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('games', games, {});//בגלל שאין שינוי בעמודות לכן זה נשאר ככה
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('games', null, {});
  }
};






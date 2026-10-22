'use strict';
const wishlists = require('../data/wishlists.json');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('wishlists', wishlists, {});//בגלל שאין שינוי בעמודות לכן זה נשאר ככה
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('wishlists', null, {});
  }
};






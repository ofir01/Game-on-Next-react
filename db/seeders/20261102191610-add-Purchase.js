'use strict';
const purchases = require('../data/Purchase.json');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('purchases', purchases, {});//בגלל שאין שינוי בעמודות לכן זה נשאר ככה
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('purchases', null, {});
  }
};






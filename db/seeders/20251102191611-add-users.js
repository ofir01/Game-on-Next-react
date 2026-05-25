'use strict';
const users = require('../data/users.json');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
   async up(queryInterface, Sequelize) {

    await queryInterface.bulkInsert('users', users, {});//בגלל שאין שינוי בעמודות לכן זה נשאר ככה
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};






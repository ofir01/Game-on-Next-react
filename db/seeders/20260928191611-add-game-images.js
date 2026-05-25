'use strict';
const gameImages = require('../data/gameImages.json');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    //בגלל שהמבנה של הטבלה הוא gameId ו url אז אנחנו צריכים לפרוס את המערך של התמונות כך שכל אובייקט יהיה עם gameId ו url
    const flatImages = gameImages.flatMap(game =>
      game.urls.map(url => ({ game_id: game.gameId, url: url }))
    );
    await queryInterface.bulkInsert('game_images', flatImages, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('game_images', null, {});
  }
};
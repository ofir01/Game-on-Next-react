'use strict';
const GameSession = require('../data/gameSession.json');
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // מכינים את הנתונים: הופכים את שדה ה-data למחרוזת JSON תקינה עבור ה-DB
    const sanitizedSessions = GameSession.map(session => ({
      userId: session.userId,
      gameId: session.gameId,
      status: session.status,
      result: session.result,
      // המרה קריטית למחרוזת JSON, אחרת הסיקוולייז לא יוכל להכניס את הנתונים לטבלה:
      data: session.data ? JSON.stringify(session.data) : null,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt)
    }));

    // הכנסה קבוצתית לתוך הטבלה
    await queryInterface.bulkInsert('game_sessions', sanitizedSessions, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('game_sessions', null, {});
  }
};




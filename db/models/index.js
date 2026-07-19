'use strict';
const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const mysql2 = require('mysql2'); // <--- ייבוא חבילת mysql2
const { request } = require('https');
const db = {};

console.log('--- Connecting to DB ---');

let sequelize;
try {
  // ניסיון יצירת החיבור
  sequelize = new Sequelize(config.database, config.username, config.password, {
    host: config.host,
    dialect: 'mysql',
    dialectModule: mysql2, // <--- זה השורה החשובה ביותר! היא אומרת לסיקוולייז להשתמש בחבילה שהבאנו לו
    port: config.port || 3306,
    logging: () => { }, //לא מדפיס לטרמינל את השאילתות
    //    logging: process.env.NODE_ENV === "development" ? console.log : false
  });

  console.log('Sequelize instance created successfully');
} catch (error) {
  console.error('FAILED to create Sequelize instance:', error);
  throw error; // זה יציג לך את השגיאה המדויקת בטרמינל
}

// --- טעינה ידנית של המודלים - זה מה שפותר את השגיאה הדינמית ---
db.User = require('./User')(sequelize, Sequelize.DataTypes);
db.Warning = require('./Warning')(sequelize, Sequelize.DataTypes);
db.Comment = require('./Comment')(sequelize, Sequelize.DataTypes);
db.Games = require('./Games')(sequelize, Sequelize.DataTypes);
db.GameCategories = require('./GameCategories')(sequelize, Sequelize.DataTypes);
db.Category = require('./Category')(sequelize, Sequelize.DataTypes);
db.GamePlayStats = require('./GamePlayStats')(sequelize, Sequelize.DataTypes);
db.News = require('./News')(sequelize, Sequelize.DataTypes);
db.UserGame = require('./UserGame')(sequelize, Sequelize.DataTypes);
db.GameSession = require('./GameSession')(sequelize, Sequelize.DataTypes);
db.HighScore = require('./HighScore')(sequelize, Sequelize.DataTypes);
db.GameImages = require('./GameImages')(sequelize, Sequelize.DataTypes);
db.Wishlist = require('./Wishlist')(sequelize, Sequelize.DataTypes);
db.ContactMessage = require('./ContactMessage')(sequelize, Sequelize.DataTypes);
db.ActivityLog = require('./ActivityLog')(sequelize, Sequelize.DataTypes);





// הפעלת קשרי גומלין (Associations)
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;







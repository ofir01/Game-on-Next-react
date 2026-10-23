'use strict';
const Sequelize = require('sequelize');
const process = require('process');
const env = process.env.NODE_ENV || 'development';
const config = require('../config/config.json')[env];
const pg = require('pg');
//const mysql2 = require('mysql2'); // <--- ייבוא חבילת mysql2
const db = {};

console.log('--- Connecting to DB ---');



let sequelize = null;

// בדיקה האם יש DATABASE_URL זמין (מונע את הקריסה בזמן docker build)
if (process.env.DATABASE_URL) {
  try {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: 'postgres',
      dialectModule: pg,
      dialectOptions: {
        ssl: {
          require: true,
          rejectUnauthorized: false, // נדרש בחיבור מול Neon
        },
      },
      logging: false,
    });

    console.log('Sequelize instance created successfully');

  } catch (error) {
    console.error('FAILED to create Sequelize instance:', error);
    throw error; // זה יציג את השגיאה המדויקת בטרמינל
  }
} else {
  console.warn('⚠️ WARNING: DATABASE_URL is missing! Skipping DB initialization during build phase.');
  // אובייקט דמה נקי שלא דורש שום ספריות חיצוניות כמו sqlite3
  sequelize = {
    define: () => ({}),
    authenticate: async () => { },
    models: {},
  };
}




/*
try {
sequelize = new Sequelize(config.database, config.username, config.password, {
  host: config.host,
  dialect: 'mysql',
  dialectModule: mysql2, // <--- זה השורה החשובה ביותר! היא אומרת לסיקוולייז להשתמש בחבילה שהבאנו לו
  port: config.port || 3306,
  logging: false,//    logging: process.env.NODE_ENV === "development" ? console.log : false //לא מדפיס לטרמינל את השאילתות
});
console.log('Sequelize instance created successfully');
} catch (error) {
  console.error('FAILED to create Sequelize instance:', error);
  throw error; // זה יציג לך את השגיאה המדויקת בטרמינל
}
*/

// --- טעינה ידנית של המודלים - זה מה שפותר את השגיאה הדינמית ---
// --- טעינה ידנית של המודלים (רק אם יש מופע אמיתי של Sequelize או בטוח) ---
if (process.env.DATABASE_URL) {
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
  db.GameImages = require('./GameImages')(sequelize, Sequelize.DataTypes);
  db.Wishlist = require('./Wishlist')(sequelize, Sequelize.DataTypes);
  db.ContactMessage = require('./ContactMessage')(sequelize, Sequelize.DataTypes);
  db.ActivityLog = require('./ActivityLog')(sequelize, Sequelize.DataTypes);
  db.Purchases = require('./Purchases')(sequelize, Sequelize.DataTypes);

  // הפעלת קשרי גומלין (Associations) רק בזמן ריצה אמיתית
  Object.keys(db).forEach(modelName => {
    if (db[modelName] && db[modelName].associate) {
      db[modelName].associate(db);
    }
  });
} else {
  console.warn('⚠️ Skipping models loading and associations during build phase.');
}

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;







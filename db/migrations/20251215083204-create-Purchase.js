'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('purchases', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'set null' // אם המשתמש נמחק, נעדכן את userId ל-null במקום למחוק את הרכישה
      },
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'games',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'set null' // אם המשחק נמחק, נעדכן את gameId ל-null במקום למחוק את הרכישה
      },
      pricePaid: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
      },
      transactionId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      status: {
        type: Sequelize.ENUM('pending', 'completed', 'refunded'),
        allowNull: false,
        defaultValue: 'pending',
      },
      refundedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      }
    });

    // הוספת אינדקס ייחודי כדי למנוע רכישה כפולה של אותו משחק
   /* await queryInterface.addIndex('purchases', ['userId', 'gameId'], {
      unique: true,
      name: 'unique_user_game_purchase'
    });*/
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('purchases');
  }
};
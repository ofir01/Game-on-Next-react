'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('comments', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      gameId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      parentId: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      isDeleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'),
      },
    });

    // אינדקסים
    await queryInterface.addIndex('comments', ['userId']);
    await queryInterface.addIndex('comments', ['parentId']);

    // foreign key ל-users
    await queryInterface.addConstraint('comments', {
      fields: ['userId'],
      type: 'foreign key',
      name: 'fk_comments_user',
      references: {
        table: 'users',
        field: 'id',
      },
      onDelete: 'CASCADE',
    });

    // self relation ל-parent comment
    await queryInterface.addConstraint('comments', {
      fields: ['parentId'],
      type: 'foreign key',
      name: 'fk_comments_parent',
      references: {
        table: 'comments',
        field: 'id',
      },
      onDelete: 'SET NULL', // אם ההורה נמחק, ההערות הילדים נשארות עם parentId NULL
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('comments');
  }
};

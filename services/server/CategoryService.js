const db = require('../../db/models');

export const CategoryService = {
    // GET_ALL + SEARCH 
    getAll: async (query) => {
        const where = query
            ? { name: { [db.Sequelize.Op.like]: `%${query}%` } }
            : {};

        return await db.Category.findAll({
            attributes: ['id', 'name'],
            where,
            order: [['name', 'ASC']],
        });
    },

    // CREATE
    add: async (name) => {
        const normalized = name.trim().toLowerCase();

        const existing = await db.Category.findOne({
            where: db.Sequelize.where(
                db.Sequelize.fn('LOWER', db.Sequelize.col('name')),
                normalized
            ),
        });
        if (existing) { return false; }

        await db.Category.create({ name: name.trim() });
        return true;
    },

    // UPDATE
    update: async (id, name) => {
        const normalized = name.trim().toLowerCase();

        // בדיקה אם שם כבר קיים אצל מישהו אחר
        const existing = await db.Category.findOne({
            where: db.Sequelize.and(
                db.Sequelize.where(
                    db.Sequelize.fn('LOWER', db.Sequelize.col('name')),
                    normalized
                ),
                {
                    id: { [db.Sequelize.Op.ne]: id }
                }
            )
        });

        if (existing) {
            return false;
        }

        const [updatedRows] = await db.Category.update(
            { name: name.trim() },
            { where: { id } }
        );

        return updatedRows > 0;//האם עודכן בהצלחה
    },

    // DELETE
    delete: async (id) => {
        const deletedCount = await db.Category.destroy({
            where: { id },
        });

        return deletedCount > 0;
    },
};
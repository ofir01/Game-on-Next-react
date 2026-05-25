
const db = require('../../db/models');

export const CommentService = {
    // שליפת תגובות עם פגינציה, סטטיסטיקות ופילטרים
    getCommentsByGame: async (gameId, { page, limit, ratingFilter }) => {
        const offset = (page - 1) * limit;

        // 1. חישוב סטטיסטיקות דירוגים
        const statsRaw = await db.sequelize.query(`
            SELECT rating, COUNT(userId) as count
            FROM user_games
            WHERE gameId = ${gameId} AND rating IS NOT NULL
            GROUP BY rating
        `, { type: db.sequelize.QueryTypes.SELECT });

        const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        statsRaw.forEach(item => { stats[item.rating] = parseInt(item.count); });

        // 2. הגדרת פילטרים
        let whereClause = { gameId, parentId: null, isDeleted: false };

        if (ratingFilter && ratingFilter !== 'all') {
            const usersWithRating = await db.sequelize.query(`
                SELECT userId FROM user_games WHERE gameId = ${gameId} AND rating = ${parseInt(ratingFilter)}
            `, { type: db.sequelize.QueryTypes.SELECT });

            const userIds = usersWithRating.map(u => u.userId);
            if (userIds.length === 0) return { rows: [], count: 0, stats };
            whereClause.userId = { [db.Sequelize.Op.in]: userIds };
        }

        // 3. שליפת הנתונים
        const { count, rows } = await db.Comment.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['updatedAt', 'DESC']],
            attributes: [
                'id', 'content', 'updatedAt', 'userId', 'isDeleted',
                [db.sequelize.literal(`(SELECT rating FROM user_games AS ug WHERE ug.userId = Comment.userId AND ug.gameId = ${gameId} LIMIT 1)`), 'userRating']
            ],
            include: [
                { model: db.User, as: 'User', attributes: ['name'] },
                {
                    model: db.Comment,
                    as: 'replies',
                    where: { isDeleted: false },
                    required: false,
                    include: [{ model: db.User, as: 'User', attributes: ['name'] }],
                    order: [['createdAt', 'ASC']]
                }
            ],
            distinct: true
        });

        return { rows, count, stats };
    },

    // יצירת תגובה חדשה עם בדיקות מניעת כפילות/תגובה עצמית
    create: async ({ userId, gameId, content, parentId }) => {

        const user = await db.User.findByPk(userId);
        if (!user) return { error: 'USER_NOT_FOUND' };
       
        if (!parentId) {
            const existing = await db.Comment.findOne({ where: { gameId, userId, parentId: null, isDeleted: false } });
            if (existing) return { error: 'ALREADY_POSTED' };
        } else {
            const parent = await db.Comment.findByPk(parentId);
            if (parent && String(parent.userId) === String(userId)) return { error: 'SELF_REPLY' };
        }

        return { 
            comment: await db.Comment.create({ content, gameId, userId, parentId: parentId || null }) 
        };
    },

    // עדכון תגובה
    update: async (commentId, userId, content) => {
        const comment = await db.Comment.findByPk(commentId);
        if (!comment) return { error: 'NOT_FOUND' };
        if (String(comment.userId) !== String(userId)) return { error: 'FORBIDDEN' };

        comment.content = content;
        await comment.save();
        return { comment };
    },

    // מחיקה (לוגית)
    delete: async (commentId, userId) => {
        const comment = await db.Comment.findByPk(commentId);
        if (!comment) return { error: 'NOT_FOUND' };

        const user = await db.User.findByPk(userId);
        const isOwner = String(comment.userId) === String(userId);
        const isAdmin = user?.role === 'ADMIN';

        if (!isOwner && !isAdmin) return { error: 'FORBIDDEN' };

        comment.isDeleted = true;
        await comment.save();
        return { success: true };
    }
};
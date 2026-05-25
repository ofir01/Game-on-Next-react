import { NextResponse } from 'next/server';
import { Op } from 'sequelize';
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../../../db/models');

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATION_CONFIG_API_KEY);

const ROLE_PERMISSIONS = {
    ADMIN: { info: true, delete: true, edit: true, create: true },
    EDITOR: { info: true, delete: false, edit: true, create: true },
    USER: { info: true, delete: false, edit: false, create: false },
};

const TARGETS = ['games', 'news', 'wishlist', 'favorites', 'comments', 'ratings'];
const ACTIONS = ['info', 'delete', 'edit', 'create'];

export async function POST(req) {
    try {
        const body = await req.json();
        const userContext = await getUserContext(req);

        if (body?.confirmAction) {
            const result = await executeConfirmedAction(body.confirmAction, userContext);
            return NextResponse.json(result, { status: 200 });
        }

        if (!body?.prompt?.trim()) {
            return NextResponse.json({ text: 'חסר טקסט לבקשה.', isAction: false }, { status: 400 });
        }

        const result = await handleChatRequest(body.prompt.trim(), userContext);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ text: 'השרת נתקל בשגיאה. נסה שוב עוד רגע.', isAction: false }, { status: 500 });
    }
}

async function getUserContext(req) {
    const userId = req.headers.get('x-user-id');
    const user = userId ? await db.User.findByPk(userId) : null;

    return {
        id: user?.id || null,
        name: user?.name || 'guest',
        role: user?.role || 'USER',
    };
}

async function handleChatRequest(prompt, userContext) {
    const siteContext = await getSiteContext(userContext.id);
    const intent = await classifyUserRequest(prompt, userContext, siteContext);

    if (!intent) {
        return { text: 'לא הצלחתי להבין את הבקשה. נסה לנסח אותה שוב.', isAction: false };
    }

    const normalized = normalizeIntent(intent);

    if (normalized.isMissingData || hasMissingRequiredData(normalized)) {
        return {
            text: buildMissingDataText(normalized),
            isAction: normalized.kind === 'ACTION',
            status: 'missing_data',
            intent: normalized,
        };
    }

    if (normalized.kind === 'CHAT') {
        return { text: normalized.content || 'אני כאן. איך אפשר לעזור?', isAction: false };
    }

    if (normalized.kind === 'INFO') {
        if (!canUser(userContext.role, 'info')) {
            return forbiddenResponse('info', normalized.target);
        }

        const infoResult = await queryInfo(normalized, userContext);
        if (!infoResult.items.length) {
            return {
                text: `לא מצאתי נתונים מתאימים ב-${targetLabel(normalized.target)}.`,
                isAction: false,
                status: 'empty',
                payload: [],
            };
        }

        const councilText = await buildCouncilAnswer(prompt, normalized, infoResult, userContext);
        return {
            text: councilText,
            isAction: false,
            status: 'info',
            intent: normalized,
            payload: infoResult.items,
        };
    }

    if (normalized.kind === 'ACTION') {
        if (!canUser(userContext.role, normalized.task)) {
            return forbiddenResponse(normalized.task, normalized.target);
        }

        const preview = await previewAction(normalized, userContext);
        return preview;
    }

    return { text: 'לא הצלחתי לסווג את הבקשה.', isAction: false };
}

async function classifyUserRequest(prompt, userContext, siteContext) {
    const classificationPrompt = `
You are the routing AI for the GAME ON website.
Return only valid JSON. No markdown, no explanation.

User name: ${userContext.name}
User role: ${userContext.role}
User message: ${JSON.stringify(prompt)}

Site context:
${siteContext}

Classify the request into this exact JSON shape:
{
  "kind": "INFO" | "ACTION" | "CHAT",
  "task": "info" | "delete" | "edit" | "create",
  "target": "games" | "news" | "wishlist" | "favorites" | "comments" | "ratings",
  "isMissingData": true | false,
  "data": {
    "searchTerm": "",
    "limit": 5,
    "ids": [],
    "amount": null,
    "fields": {}
  },
  "content": ""
}

Rules:
- INFO means the user wants information from site tables: games, news, wishlist, favorites, comments, ratings.
- ACTION means the user wants to create, delete, or edit data.
- CHAT means casual conversation that does not need database data or mutation.
- For ACTION, never invent missing item names, ids, titles, or edit fields. Set isMissingData=true when a required detail is missing.
- For delete latest/all news, use target="news", task="delete", data.amount. If the user says "all", cap amount at 10.
- For edit, put the requested new values in data.fields. If no fields are given, isMissingData=true.
- For game categories such as action, adventure, racing, puzzle, put that word in data.searchTerm.
- Keep target and task inside the allowed enum values.
- For CHAT, put a short Hebrew answer in content.
`;

    return callLLM(classificationPrompt, { json: true, maxOutputTokens: 2000, temperature: 0.1 });
}

async function buildCouncilAnswer(originalPrompt, intent, infoResult, userContext) {
    const answerPrompt = `
You are the GAME ON council. Answer in Hebrew Markdown only.
The user asked: ${JSON.stringify(originalPrompt)}
User name: ${userContext.name}
Intent JSON: ${JSON.stringify(intent)}
Database result JSON: ${JSON.stringify(infoResult.items)}

Use only facts from the database result. Do not invent games, news, ratings, comments, or prices.
If the result contains IDs, include them only when useful.

Return the council discussion exactly in this structure:
### The Legend
> A sharp veteran take based on the data.
---
### The Sweat
> A hyped practical take based on the data.
---
### The Game Master
**הכרעה:** who wins the argument
**דירוגים:**
* שחקן ותיק: X/10
* שחקן צעיר: X/10
**סיכום:** _one useful summary sentence_
`;

    const result = await callLLM(answerPrompt, { json: false, maxOutputTokens: 2500, temperature: 0.6 });
    return result || 'מצאתי נתונים, אבל לא הצלחתי לנסח את דיון המועצה כרגע.';
}

async function getSiteContext(userId) {
    const [games, news] = await Promise.all([
        db.Games.findAll({
            attributes: ['id', 'title', 'price', 'status', 'updatedAt'],
            include: [{ model: db.Category, attributes: ['name'], as: 'categories', through: { attributes: [] } }],
            limit: 30,
            order: [['updatedAt', 'DESC']],
        }),
        db.News.findAll({
            attributes: ['id', 'title'],
            limit: 15,
            order: [['createdAt', 'DESC']],
        }),
    ]);

    const gameText = games.map((game) => {
        const categories = game.categories?.map((cat) => cat.name).join(', ') || 'no categories';
        return `#${game.id} ${game.title} (${categories})`;
    }).join('; ');

    const newsText = news.map((item) => `#${item.id} ${item.title}`).join('; ');
    const personalContext = userId ? `Current user id: ${userId}` : 'No logged-in user id was provided.';

    return `
Games: ${gameText || 'none'}
News: ${newsText || 'none'}
${personalContext}
`;
}

function normalizeIntent(intent) {
    const kind = ['INFO', 'ACTION', 'CHAT'].includes(intent?.kind) ? intent.kind : (intent?.type === 'ACTION' ? 'ACTION' : 'CHAT');
    const task = ACTIONS.includes(intent?.task) ? intent.task : (kind === 'INFO' ? 'info' : 'info');
    const target = TARGETS.includes(intent?.target) ? intent.target : 'games';
    const data = typeof intent?.data === 'object' && intent.data !== null ? intent.data : {};
    const fields = typeof data.fields === 'object' && data.fields !== null ? data.fields : {};
    const ids = Array.isArray(data.ids) ? data.ids.map((id) => parseInt(id, 10)).filter(Boolean) : [];

    return {
        kind,
        task: kind === 'INFO' ? 'info' : task,
        target,
        isMissingData: Boolean(intent?.isMissingData),
        data: {
            searchTerm: typeof data.searchTerm === 'string' ? data.searchTerm.trim() : '',
            limit: clampNumber(data.limit, 5, 1, 10),
            amount: data.amount === null || data.amount === undefined ? null : clampNumber(data.amount, 5, 1, 10),
            ids,
            fields,
        },
        content: typeof intent?.content === 'string' ? intent.content : '',
    };
}

async function queryInfo(intent, userContext) {
    switch (intent.target) {
        case 'games':
            return { items: await findGames(intent.data) };
        case 'news':
            return { items: await findNews(intent.data) };
        case 'wishlist':
            return { items: userContext.id ? await findWishlist(userContext.id, intent.data) : [] };
        case 'favorites':
            return { items: userContext.id ? await findFavorites(userContext.id, intent.data) : [] };
        case 'comments':
            return { items: await findComments(intent.data) };
        case 'ratings':
            return { items: await findRatings(intent.data) };
        default:
            return { items: [] };
    }
}

async function previewAction(intent, userContext) {
    const items = await findActionItems(intent, userContext);

    if (intent.task !== 'create' && !items.length) {
        return {
            text: `לא מצאתי פריטים מתאימים ל${actionLabel(intent.task)} ב-${targetLabel(intent.target)}.`,
            isAction: true,
            status: 'empty',
        };
    }

    const confirmAction = {
        task: intent.task,
        target: intent.target,
        data: intent.data,
        itemIds: items.map((item) => item.id),
    };

    return {
        text: buildConfirmationText(intent, items),
        isAction: true,
        status: 'needs_confirmation',
        requiresConfirmation: true,
        confirmAction,
        items,
    };
}

async function executeConfirmedAction(confirmAction, userContext) {
    const intent = normalizeIntent({
        kind: 'ACTION',
        task: confirmAction?.task,
        target: confirmAction?.target,
        data: {
            ...(confirmAction?.data || {}),
            ids: confirmAction?.itemIds || confirmAction?.data?.ids || [],
        },
        isMissingData: false,
    });

    if (!canUser(userContext.role, intent.task)) {
        return forbiddenResponse(intent.task, intent.target);
    }

    if (intent.task === 'delete') {
        const deletedCount = await deleteItems(intent);
        return {
            text: deletedCount ? `בוצע. נמחקו ${deletedCount} פריטים מ-${targetLabel(intent.target)}.` : 'לא נמחקו פריטים.',
            isAction: true,
            status: deletedCount ? 'done' : 'empty',
        };
    }

    if (intent.task === 'edit') {
        const updatedCount = await editItems(intent);
        return {
            text: updatedCount ? `בוצע. עודכנו ${updatedCount} פריטים ב-${targetLabel(intent.target)}.` : 'לא עודכנו פריטים.',
            isAction: true,
            status: updatedCount ? 'done' : 'empty',
        };
    }

    if (intent.task === 'create') {
        const created = await createItem(intent);
        return {
            text: created?.id ? `בוצע. נוצר פריט חדש ב-${targetLabel(intent.target)}: ${created.title || `#${created.id}`}.` : 'לא נוצר פריט.',
            isAction: true,
            status: created?.id ? 'done' : 'empty',
        };
    }

    return { text: 'הפעולה לא נתמכת עדיין.', isAction: true, status: 'unsupported' };
}

async function findActionItems(intent, userContext) {
    if (intent.task === 'create') return [];

    const data = {
        ...intent.data,
        limit: intent.data.amount || intent.data.limit || 5,
    };

    switch (intent.target) {
        case 'games':
            return findGames(data);
        case 'news':
            return findNews(data);
        case 'wishlist':
            return userContext.id ? findWishlist(userContext.id, data) : [];
        case 'favorites':
            return userContext.id ? findFavorites(userContext.id, data) : [];
        case 'comments':
            return findComments(data);
        case 'ratings':
            return findRatings(data);
        default:
            return [];
    }
}

async function findGames(data) {
    const where = {};
    const include = [
        { model: db.Category, attributes: ['name'], as: 'categories', through: { attributes: [] }, required: false },
        { model: db.GamePlayStats, attributes: ['playCount'], as: 'stats', required: false },
    ];

    if (data.ids?.length) {
        where.id = { [Op.in]: data.ids };
    } else if (data.searchTerm) {
        where[Op.or] = [
            { title: { [Op.like]: `%${data.searchTerm}%` } },
            { description: { [Op.like]: `%${data.searchTerm}%` } },
            { '$categories.name$': { [Op.like]: `%${data.searchTerm}%` } },
        ];
    }

    const games = await db.Games.findAll({
        where,
        include,
        attributes: ['id', 'title', 'description', 'price', 'status', 'discountPercentage', 'releaseDate'],
        limit: data.limit || 5,
        order: [['updatedAt', 'DESC']],
        subQuery: false,
        distinct: true,
    });

    return games.map((game) => ({
        id: game.id,
        title: game.title,
        description: game.description,
        price: Number(game.price),
        status: game.status,
        discountPercentage: game.discountPercentage,
        releaseDate: game.releaseDate,
        categories: game.categories?.map((cat) => cat.name) || [],
        playCount: game.stats?.playCount || 0,
    }));
}

async function findNews(data) {
    const where = {};

    if (data.ids?.length) {
        where.id = { [Op.in]: data.ids };
    } else if (data.searchTerm) {
        where[Op.or] = [
            { title: { [Op.like]: `%${data.searchTerm}%` } },
            { content: { [Op.like]: `%${data.searchTerm}%` } },
        ];
    }

    const news = await db.News.findAll({
        where,
        attributes: ['id', 'title', 'content', 'createdAt'],
        limit: data.amount || data.limit || 5,
        order: [['createdAt', 'DESC']],
    });

    return news.map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        createdAt: item.createdAt,
    }));
}

async function findWishlist(userId, data) {
    const entries = await db.Wishlist.findAll({
        where: { userId },
        include: [{ model: db.Games, as: 'game', attributes: ['id', 'title', 'description', 'price', 'status'] }],
        limit: data.limit || 5,
        order: [['addedAt', 'DESC']],
    });

    return entries
        .filter((entry) => !data.searchTerm || entry.game?.title?.toLowerCase().includes(data.searchTerm.toLowerCase()))
        .map((entry) => ({
            id: entry.id,
            gameId: entry.gameId,
            title: entry.game?.title,
            description: entry.game?.description,
            price: Number(entry.game?.price || 0),
            status: entry.game?.status,
        }));
}

async function findFavorites(userId, data) {
    const favorites = await db.UserGame.findAll({
        where: { userId, isFavorite: true },
        include: [{ model: db.Games, as: 'game', attributes: ['id', 'title', 'description', 'price', 'status'] }],
        limit: data.limit || 5,
        order: [['updatedAt', 'DESC']],
    });

    return favorites
        .filter((entry) => !data.searchTerm || entry.game?.title?.toLowerCase().includes(data.searchTerm.toLowerCase()))
        .map((entry) => ({
            id: entry.id,
            gameId: entry.gameId,
            title: entry.game?.title,
            description: entry.game?.description,
            price: Number(entry.game?.price || 0),
            status: entry.game?.status,
            rating: entry.rating,
        }));
}

async function findComments(data) {
    const where = { isDeleted: false };

    if (data.ids?.length) {
        where.id = { [Op.in]: data.ids };
    } else if (data.searchTerm) {
        where.content = { [Op.like]: `%${data.searchTerm}%` };
    }

    const comments = await db.Comment.findAll({
        where,
        include: [
            { model: db.Games, attributes: ['id', 'title'] },
            { model: db.User, attributes: ['id', 'name'] },
        ],
        attributes: ['id', 'content', 'gameId', 'userId', 'createdAt'],
        limit: data.limit || 5,
        order: [['createdAt', 'DESC']],
    });

    return comments.map((comment) => ({
        id: comment.id,
        content: comment.content,
        gameId: comment.gameId,
        gameTitle: comment.Game?.title,
        userId: comment.userId,
        userName: comment.User?.name,
        createdAt: comment.createdAt,
    }));
}

async function findRatings(data) {
    const where = { rating: { [Op.ne]: null } };

    if (data.ids?.length) {
        where.id = { [Op.in]: data.ids };
    }

    const ratings = await db.UserGame.findAll({
        where,
        include: [
            { model: db.Games, as: 'game', attributes: ['id', 'title'] },
            { model: db.User, as: 'user', attributes: ['id', 'name'] },
        ],
        attributes: ['id', 'gameId', 'userId', 'rating', 'status'],
        limit: data.limit || 5,
        order: [['updatedAt', 'DESC']],
    });

    return ratings
        .filter((rating) => !data.searchTerm || rating.game?.title?.toLowerCase().includes(data.searchTerm.toLowerCase()))
        .map((rating) => ({
            id: rating.id,
            gameId: rating.gameId,
            gameTitle: rating.game?.title,
            userId: rating.userId,
            userName: rating.user?.name,
            rating: rating.rating,
            status: rating.status,
        }));
}

async function deleteItems(intent) {
    const ids = intent.data.ids || [];
    if (!ids.length) return 0;

    switch (intent.target) {
        case 'games':
            return db.Games.destroy({ where: { id: { [Op.in]: ids } } });
        case 'news':
            return db.News.destroy({ where: { id: { [Op.in]: ids } } });
        case 'wishlist':
            return db.Wishlist.destroy({ where: { id: { [Op.in]: ids } } });
        case 'favorites':
            return db.UserGame.update({ isFavorite: false }, { where: { id: { [Op.in]: ids } } }).then(([count]) => count);
        case 'comments':
            return db.Comment.update({ isDeleted: true }, { where: { id: { [Op.in]: ids } } }).then(([count]) => count);
        case 'ratings':
            return db.UserGame.update({ rating: null }, { where: { id: { [Op.in]: ids } } }).then(([count]) => count);
        default:
            return 0;
    }
}

async function editItems(intent) {
    const ids = intent.data.ids || [];
    const fields = allowedUpdateFields(intent.target, intent.data.fields);
    if (!ids.length || !Object.keys(fields).length) return 0;

    switch (intent.target) {
        case 'games':
            return db.Games.update(fields, { where: { id: { [Op.in]: ids } } }).then(([count]) => count);
        case 'news':
            return db.News.update(fields, { where: { id: { [Op.in]: ids } } }).then(([count]) => count);
        case 'comments':
            return db.Comment.update(fields, { where: { id: { [Op.in]: ids } } }).then(([count]) => count);
        case 'ratings':
        case 'favorites':
            return db.UserGame.update(fields, { where: { id: { [Op.in]: ids } } }).then(([count]) => count);
        default:
            return 0;
    }
}

async function createItem(intent) {
    const fields = allowedCreateFields(intent.target, intent.data.fields);

    if (intent.target === 'news' && fields.title && fields.content) {
        return db.News.create(fields);
    }

    if (intent.target === 'games' && fields.title) {
        return db.Games.create(fields);
    }

    return null;
}

function allowedUpdateFields(target, fields) {
    const allowLists = {
        games: ['title', 'description', 'price', 'status', 'discountPercentage', 'discountUntil', 'imageUrl', 'gameUrl'],
        news: ['title', 'content'],
        comments: ['content', 'isDeleted'],
        ratings: ['rating', 'status', 'isFavorite'],
        favorites: ['isFavorite', 'rating', 'status'],
    };

    const allowed = allowLists[target] || [];
    return Object.fromEntries(Object.entries(fields || {}).filter(([key]) => allowed.includes(key)));
}

function allowedCreateFields(target, fields) {
    const allowLists = {
        games: ['title', 'description', 'price', 'status', 'imageUrl', 'gameUrl', 'releaseDate', 'discountPercentage', 'discountUntil'],
        news: ['title', 'content'],
    };

    const allowed = allowLists[target] || [];
    return Object.fromEntries(Object.entries(fields || {}).filter(([key]) => allowed.includes(key)));
}

function buildConfirmationText(intent, items) {
    const lines = items.map((item, index) => `${index + 1}. ${item.title || item.content || item.gameTitle || `#${item.id}`}`).join('\n');
    const fieldsText = intent.task === 'edit' ? `\n\nשדות לעדכון:\n${JSON.stringify(intent.data.fields, null, 2)}` : '';

    if (intent.task === 'create') {
        return `מצאתי בקשת יצירה ב-${targetLabel(intent.target)}.\n\n${JSON.stringify(intent.data.fields, null, 2)}\n\nהאם אתה בטוח שברצונך לבצע?`;
    }

    return `מצאתי ${items.length} פריטים ל${actionLabel(intent.task)} ב-${targetLabel(intent.target)}:\n\n${lines}${fieldsText}\n\nהאם אתה בטוח שברצונך לבצע?`;
}

function buildMissingDataText(intent) {
    if (intent.kind === 'ACTION') {
        return `חסרים פרטים כדי לבצע ${actionLabel(intent.task)} ב-${targetLabel(intent.target)}. כתוב לי בדיוק איזה פריט ומה צריך להשתנות.`;
    }

    return `חסרים פרטים לשליפה מ-${targetLabel(intent.target)}. כתוב לי מה לחפש או כמה פריטים להציג.`;
}

function hasMissingRequiredData(intent) {
    if (intent.kind !== 'ACTION') return false;

    const hasItemSelector = Boolean(
        intent.data.searchTerm ||
        intent.data.ids?.length ||
        intent.data.amount
    );

    if (intent.task === 'delete') {
        return !hasItemSelector;
    }

    if (intent.task === 'edit') {
        return !hasItemSelector || !Object.keys(intent.data.fields || {}).length;
    }

    if (intent.task === 'create') {
        if (intent.target === 'news') {
            return !intent.data.fields?.title || !intent.data.fields?.content;
        }

        if (intent.target === 'games') {
            return !intent.data.fields?.title;
        }

        return true;
    }

    return false;
}

function forbiddenResponse(task, target) {
    return {
        text: `אין לך הרשאה לבצע ${actionLabel(task)} ב-${targetLabel(target)}.`,
        isAction: true,
        status: 'forbidden',
    };
}

function canUser(role, task) {
    return Boolean(ROLE_PERMISSIONS[role]?.[task]);
}

function clampNumber(value, fallback, min, max) {
    const number = parseInt(value, 10);
    if (Number.isNaN(number)) return fallback;
    return Math.max(min, Math.min(max, number));
}

function targetLabel(target) {
    const labels = {
        games: 'משחקים',
        news: 'חדשות',
        wishlist: 'רשימת משאלות',
        favorites: 'מועדפים',
        comments: 'תגובות',
        ratings: 'דירוגים',
    };

    return labels[target] || target;
}

function actionLabel(task) {
    const labels = {
        info: 'שליפת מידע',
        delete: 'מחיקה',
        edit: 'עריכה',
        create: 'יצירה',
    };

    return labels[task] || task;
}

async function callLLM(prompt, { json, maxOutputTokens = 2000, temperature = 0.2 }) {
    try {
        const model = genAI.getGenerativeModel({
            model: 'gemini-flash-lite-latest',
            generationConfig: {
                ...(json ? { responseMimeType: 'application/json' } : {}),
                maxOutputTokens,
                temperature,
            },
        });

        const result = await model.generateContent(prompt);
        const textResult = result?.response?.text?.();

        if (!textResult) return null;
        return json ? JSON.parse(textResult) : textResult;
    } catch (error) {
        console.error('Gemini API Error:', error);
        return null;
    }
}

import { NextResponse } from 'next/server';
const { Op } = require('sequelize');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../../../db/models');
import { getUserId } from '../../../utils/verification';
import { UserService } from '../../../services/server/UserService';


const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATION_CONFIG_API_KEY);
const generativeModel = 'gemini-flash-lite-latest';

const ROLE_PERMISSIONS = {
    ADMIN: { info: true, delete: true, edit: true, create: true },
    EDITOR: { info: true, delete: false, edit: true, create: true },
    USER: { info: true, delete: false, edit: false, create: false },
};
// בודק את ההרשאות של המשתמש
function canUser(role, task) {
    return Boolean(ROLE_PERMISSIONS[role]?.[task]);
}

const TARGETS = ['Games', 'News', 'Wishlist', 'UserGame', 'Comment', 'Ratings'];
const TASKS = ['info', 'delete', 'edit', 'create', 'chat'];
const KINDS = ['INFO', 'ACTION', 'CHAT'];//למחוק ולחבר הכל ל- TASKS



//מבצע בדיקה אם מדובר בפעולה שהמשתמש מורשה לבצע לפי התפקיד שלו ומה הפעולה והטארגט המבוקשים
export async function POST(req) {
    try {
        //קבלת הנתונים מהבקשה והקשר המשתמש - מי המשתמש, מה התפקיד שלו, וכו'
        const body = await req.json();
        const userContext = await getUserContext();

        //אם זה אישור לפעולה, מבצעים את הפעולה ומחזירים את התוצאה
        if (body?.confirmAction) {
            const result = await executeConfirmedAction(body.confirmAction, userContext);
            return NextResponse.json(result, { status: 200 });
        }

        //בדיקת תקינות
        if (!body?.prompt?.trim()) {
            return NextResponse.json({ text: 'חסר טקסט לבקשה.', isAction: false }, { status: 400 });
        }

        // אחרת, זה בקשת צ'אט רגילה שצריכה מענה או זיהוי כפעולה שדורשת אישור
        const result = await handleChatRequest(body.prompt.trim(), userContext);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ text: 'השרת נתקל בשגיאה. נסה שוב עוד רגע.', isAction: false }, { status: 500 });
    }
}


//למחוק
// צריך למחוק פעולה זו, כי הבינה מלאכותית אמורה לשלוף רק מה שצריך מהאתר, ולא את הכל
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



// מחזירה נתונים של המשתמש וההרשאות שלו
async function getUserContext() {
    const userId = await getUserId();
    const user = userId ? await UserService.getUserById(userId) : null;

    return {
        id: user?.id || null,
        name: user?.name || 'guest',
        role: user?.role || 'USER',
    };
}

// פונקציה עזר ליצירת תגובות אחידות מהפרומפט
const createResponse = (data) => {
    return {
        text: data.text,
        isAction: data.isAction,
        status: data.status,
        ...data // כאן נכנסים המפתחות המשתנים כמו payload או intent
    };
};



// הפונקציה הראשית של פרומפט
async function handleChatRequest(prompt, userContext) {

    // שולח את הפרומפט עם הקשר המשתמש והאתר לLLM כדי לסווג את הבקשה ולזהות אם זה שאלה רגילה או בקשה לפעולה שדורשת אישור
    const intent = await classifyUserRequest(prompt, userContext);
    console.log("Intent: " + JSON.stringify(intent));
    /*
    Intent: {"kind":"CHAT","task":"info","target":"games","isMissingData":false,
    "data":{"searchTerm":"","limit":5,"ids":[],"amount":null,"fields":{}},"content":""}
    */

    // טיפול בבקשות לפעולות שדורשות פרטים נוספים מהמשתמש לפני שניתן לבצע אותן
    /* if (intent?.isMissingData && intent.kind === KINDS[1]) {
         const formSchema = getDynamicFormSchema(intent?.target, intent?.task);//מחזיר טופס למילוי
         const classificationPrompt = await buildMissingDataText(intent);//מחזיר הודעה
 
         const response = createResponse({
             text: classificationPrompt,
             isAction: true,
             status: 'missing_data',
             formSchema: formSchema && formSchema.length > 0 ? formSchema : null // שולח את המערך ללקוח רק אם הוא לא ריק
         });
         console.log("Response for missing data: " + JSON.stringify(response));
         return response;
     }*/

    //'CHAT'
    if (intent.kind === KINDS[2]) {
        return createResponse({ text: intent.content || 'אני כאן. איך אפשר לעזור?', isAction: false });
    }

    //'INFO'
    if (intent.kind === KINDS[0]) {
        if (!canUser(userContext.role, 'info')) {
            return forbiddenResponse('info', intent?.target);
        }

        const infoResult = await queryInfo(intent, userContext);
        if (!infoResult.items.length) {
            return createResponse({
                text: `לא מצאתי נתונים מתאימים ב-${targetLabel(intent?.target)}.`,
                isAction: false,
                status: 'empty',
                payload: [],
            });
        }

        const councilText = await buildCouncilAnswer(prompt, intent, infoResult, userContext);
        return createResponse({
            text: councilText,
            isAction: false,
            status: 'info',
            intent: intent,
            payload: infoResult.items,
        });
    }

    //'ACTION'
    if (intent.kind === KINDS[1]) {
        // לפני שמבצעים את הפעולה, בודקים אם המשתמש מורשה לבצע אותה לפי התפקיד שלו
        if (!canUser(userContext.role, intent.task)) {
            return forbiddenResponse(intent.task, intent.target);
        }

        const preview = await previewAction(intent, userContext);
        return preview;
    }

    return createResponse({ text: 'לא הצלחתי לסווג את הבקשה.', isAction: false });
}




// Council answer generation
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




// The normalizeIntent function standardizes the intent object by ensuring all properties are set to valid values. It checks the kind, task, and target properties and provides default values if they are not valid.
function normalizeIntent(intent) {
    /*
  Intent: {"kind":"CHAT","task":"info","target":"games","isMissingData":false,
  "data":{"searchTerm":"","limit":5,"ids":[],"amount":null,"fields":{}},"content":""}
  */
    const kind = intent?.kind;
    const task = intent?.task;
    const target = intent?.target;
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

// The canUser function checks if a user with a given role has permission to perform a specific task. It looks up the permissions for the role in the ROLE_PERMISSIONS object and returns true if the task is allowed, or false otherwise. This function is used to enforce access control for different actions based on the user's role.
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

// Action preview and execution
async function previewAction(intent, userContext) {
    //הפעולה 
    const items = await findActionItems(intent, userContext);

    if (intent.task !== 'create' && !items.length) {
        return createResponse({
            text: `לא מצאתי פריטים מתאימים.`,
            isAction: true,
            status: 'empty',
        });
    }

    const confirmAction = {
        task: intent.task,
        target: intent.target,
        data: intent.data,
        itemIds: items.map((item) => item.id),
    };

    return createResponse({
        text: buildConfirmationText(intent, items),
        isAction: true,
        status: 'needs_confirmation',
        requiresConfirmation: true,
        confirmAction,
        items,
    });
}

// The executeConfirmedAction function takes the details of the action to be performed (such as delete, edit, or create) along with the user's context to ensure they have the necessary permissions. It then executes the appropriate database operations based on the intent and returns a response indicating the result of the action, such as how many items were affected or if a new item was created successfully.
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
        return createResponse({
            text: deletedCount ? `בוצע. נמחקו ${deletedCount} פריטים מ-${targetLabel(intent.target)}.` : 'לא נמחקו פריטים.',
            isAction: true,
            status: deletedCount ? 'done' : 'empty',
        });
    }

    if (intent.task === 'edit') {
        const updatedCount = await editItems(intent);
        return createResponse({
            text: updatedCount ? `בוצע. עודכנו ${updatedCount} פריטים ב-${targetLabel(intent.target)}.` : 'לא עודכנו פריטים.',
            isAction: true,
            status: updatedCount ? 'done' : 'empty',
        });
    }

    if (intent.task === 'create') {
        const created = await createItem(intent);
        return createResponse({
            text: created?.id ? `בוצע. נוצר פריט חדש ב-${targetLabel(intent.target)}: ${created.title || `#${created.id}`}.` : 'לא נוצר פריט.',
            isAction: true,
            status: created?.id ? 'done' : 'empty',
        });
    }

    return createResponse({ text: 'הפעולה לא נתמכת עדיין.', isAction: true, status: 'unsupported' });
}

// Data querying and action execution helper functions
async function findActionItems(intent, userContext) {
    if (intent.task === 'create') return [];

    const data = {
        ...intent.data,
        limit: intent.data.amount || intent.data.limit || 5,
    };
    const dbQueryConfig = buildDbQuery(intent); // מעבירים את ה-intent השלם
    console.log('data: ' + JSON.stringify(data));

    switch (intent.target) {
        case 'games':
            return findGames(data);
        case 'news':
            return await db.News.findAll(dbQueryConfig);;
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



function buildDbQuery(intent) {
    const intentData = intent.data || {};
    const task = intent.task;

    // 1. קביעת מגבלת הכמות (Limit) לפי סוג הפעולה
    let queryLimit;
    if (task === 'delete') {
        // במחיקה מותר רק פריט אחד
        queryLimit = 1;
    } else {
        // בהצגה/מידע ניקח מה שהמשתמש ביקש, אבל נגביל למקסימום 5
        const requestedAmount = intentData.amount || intentData.limit || 5;
        queryLimit = Math.min(requestedAmount, 5);
    }

    // 2. הגדרת ברירות מחדל (הגבלה ומיון)
    const query = {
        limit: queryLimit,
        order: [['createdAt', intentData.orderDirection || 'DESC']],
        where: {}
    };

    // 3. תרגום סוג החיפוש הטקסטואלי לשפת ה-DB
    if (intentData.searchTerm) {
        switch (intentData.matchType) {
            case 'startsWith':
                // מתחיל ב...
                query.where.title = { [Op.startsWith]: intentData.searchTerm };
                break;
            case 'exact':
                // בדיוק מה שהוקלד
                query.where.title = { [Op.eq]: intentData.searchTerm };
                break;
            case 'contains':
            default:
                // מכיל (מילה בתוך משפט) - מחפש גם בכותרת וגם בתוכן
                query.where[Op.or] = [
                    { title: { [Op.like]: `%${intentData.searchTerm}%` } },
                    { content: { [Op.like]: `%${intentData.searchTerm}%` } }
                ];
                break;
        }
    }

    return query;
}

// Each of the find functions below is tailored to query the specific table and related data for the target type. They handle the search term, ids, and amount parameters to filter and limit the results accordingly. The functions also format the results into a consistent structure that can be used for both information retrieval and action previews.
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

// The findNews function queries the News table based on the provided search term, ids, or amount. It returns a list of news items with their id, title, content, and creation date. The function uses Sequelize's querying capabilities to filter and limit the results according to the intent data.
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

// These functions for wishlist, favorites, comments, and ratings include user-specific data and relations, so they are defined separately for clarity and to handle the specific logic needed for each case.
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

// Favorites are similar to wishlist but include the isFavorite flag and rating, and they are stored in the UserGame join table, which requires a different query structure.
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

// Comments and ratings are more straightforward queries on their respective tables, but they also include related game and user information for context in the council answer.
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

// Ratings are stored in the UserGame join table, which requires a different query structure to retrieve the rating along with related game and user information.
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

// The deleteItems, editItems, and createItem functions perform the actual database mutations based on the intent. They return counts of affected rows or the created item for feedback in the confirmation response.
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

// The editItems function updates existing records based on the provided fields in the intent. It uses the allowedUpdateFields function to filter out any fields that are not permitted for editing, ensuring that only valid updates are made to the database.
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

// The createItem function creates a new record in the database based on the provided fields in the intent. It uses the allowedCreateFields function to filter out any fields that are not permitted for creation, ensuring that only valid data is inserted into the database. The function returns the created item, which can be used to provide feedback in the confirmation response.
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

// The allowedUpdateFields and allowedCreateFields functions define which fields are permitted for updating and creating records for each target type. This ensures that the system only processes valid fields and prevents unauthorized or unintended modifications to the database.
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

// For creation, we typically allow a subset of fields that are required or commonly set when creating a new record. For example, when creating a new game, the title is required, but other fields like description or price may be optional.
function allowedCreateFields(target, fields) {
    const allowLists = {
        games: ['title', 'description', 'price', 'status', 'imageUrl', 'gameUrl', 'releaseDate', 'discountPercentage', 'discountUntil'],
        news: ['title', 'content'],
    };

    const allowed = allowLists[target] || [];
    return Object.fromEntries(Object.entries(fields || {}).filter(([key]) => allowed.includes(key)));
}

// The buildConfirmationText function constructs a confirmation message based on the intent and the items that were found for the action. It formats the message to include the relevant details of the items and any fields that are being updated, providing the user with a clear summary of what they are about to confirm.
function buildConfirmationText(intent, items) {
    const lines = items.map((item, index) => `${index + 1}. ${item.title || item.content || item.gameTitle || `#${item.id}`}`).join('\n');
    const fieldsText = intent.task === 'edit' ? `\n\nשדות לעדכון:\n${JSON.stringify(intent.data.fields, null, 2)}` : '';

    if (intent.task === 'create') {
        return `מצאתי בקשת יצירה ב-${targetLabel(intent.target)}.\n\n${JSON.stringify(intent.data.fields, null, 2)}\n\nהאם אתה בטוח שברצונך לבצע?`;
    }

    return `מצאתי ${items.length} פריטים ל${actionLabel(intent.task)} ב-${targetLabel(intent.target)}:\n\n${lines}${fieldsText}\n\nהאם אתה בטוח שברצונך לבצע?`;
}



// The forbiddenResponse function generates a response message to inform the user that they do not have permission to perform the requested action on the specified target. It uses the actionLabel and targetLabel functions to create a user-friendly message that clearly states the lack of authorization.
function forbiddenResponse(task, target) {
    return createResponse({
        text: `אין לך הרשאה לבצע`,
        isAction: true,
        status: 'forbidden',
    });
}



// The clampNumber function is a utility that ensures a given value is parsed as an integer and falls within a specified range. If the value cannot be parsed as a number, it returns a fallback value. This is used to sanitize and validate numeric inputs from the intent data, such as limits and amounts.
function clampNumber(value, fallback, min, max) {
    const number = parseInt(value, 10);
    if (Number.isNaN(number)) return fallback;
    return Math.max(min, Math.min(max, number));
}

// The targetLabel and actionLabel functions provide user-friendly labels for the various targets and actions, which are used in the response messages to make them more readable and engaging for the user.
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

// The actionLabel function maps the internal task identifiers to more user-friendly labels in Hebrew, which are used in the response messages to clearly communicate the type of action being performed.
function actionLabel(task) {
    const labels = {
        info: 'שליפת מידע',
        delete: 'מחיקה',
        edit: 'עריכה',
        create: 'יצירה',
    };

    return labels[task] || task;
}




//====================סיווג בקשות המשתמש====================
// פעולה ראשונה של החוקים
async function classifyUserRequest(prompt, userContext) {
    const classificationPrompt = `
You are the routing AI for the GAME ON website.
Return only valid JSON. No markdown, no explanation.

User name: ${userContext.name}
User role: ${userContext.role}
User message: ${JSON.stringify(prompt)}

Classify the request into this exact JSON shape:
{
  "kind": ${KINDS.map((k) => `"${k}"`).join(' | ')},
  "task": ${TASKS.map((t) => `"${t}"`).join(' | ')},
  "target": ${TARGETS.map((t) => `"${t}"`).join(' | ')},
  "isMissingData": true | false,
  "data": {
    "searchTerm": "",
    "matchType": "contains" | "startsWith" | "exact", 
    "orderDirection": "DESC" | "ASC",
    "limit": 5,
    "amount": null,
    "fields": {}
  },
  "content": ""
}

Rules:
- INFO means the user wants information from site tables.
- ACTION means the user wants to create, delete, or edit data.
- CHAT means casual conversation.
- For ACTION, never invent missing details. Set isMissingData=true if needed.
- SORTING: If the user asks for the "latest", "newest", or "last", set orderDirection="DESC". If they ask for "first" or "oldest", set orderDirection="ASC". Default is "DESC".
- SEARCHING: If the user specifies "starts with X", set matchType="startsWith". If they want exactly X, set matchType="exact". Default is "contains".
- For delete latest/all news, use target="news", task="delete". If user says "all", cap amount at 10.
`;

    return callLLM(classificationPrompt, { valid: "JSON" });
}

//הנתונים של המודל
async function callLLM(prompt, { valid } = {}) {

    //בניית האובייקט לקריאה לבינה מלאכותית
    const params = {
        model: generativeModel,
        generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.2,
        }
    };
    if (valid === "JSON") {
        params.generationConfig.responseMimeType = 'application/json';
    }

    try {
        const model = genAI.getGenerativeModel(params);

        const result = await model.generateContent(prompt);
        //מגיע עם הרבה נתונים נוספים, אבל הטקסט עצמו נמצא בresponse.text
        const textResult = result?.response?.text?.();

        if (!textResult) return null;
        return valid === "JSON" ? JSON.parse(textResult) : textResult;
    } catch (error) {
        console.error('Gemini API Error:', error);
        return null;
    }
}

//====================חסר מידע ויצירת טופס דינמי====================
//כאשר חסר מידע
async function buildMissingDataText(intent) {
    const Prompts = `
You are the routing AI for the GAME ON website.
The user wants to perform an action but some details are missing (isMissingData = true).
Your task is to generate a short, clear, and friendly message in the user's language (Hebrew), 
asking them to provide the missing details for their request.

Context:
- Action attempted: ${intent?.task}
- Target: ${intent?.target}

Example: If they want to 'create' a 'game' but specified no details, ask them what is the name of the game, category, etc.
Return ONLY the final text message to the user. No markdown, no JSON, no explanations.
`;

    //  חוזר סטרינג נקי!
    return callLLM(Prompts);
}

//שליפת מידע על הטבלאות והחזרת למשתמש
function getDynamicFormSchema(target, task) {
    console.log(`Generating form schema for target: ${target}, task: ${task}`);

    // מחיקה ושליפה לא דורשות טופס
    if (task === 'delete') return null;
    if (!target || !db[target]) return null;

    const attributes = db[target].rawAttributes;
    console.log(`Raw attributes for ${target}:`, Object.keys(attributes));

    // שדות שאנחנו רוצים לסנן באופן גורף
    const excludedFields = ['id', 'createdAt', 'updatedAt', 'userId', 'gameId'];
    const schema = [];

    try {
        for (const [key, attr] of Object.entries(attributes)) {
            // 1. קבלת סוג השדה כמחרוזת 
            if (!attr || !attr.type) continue;
            const typeStr = attr.type ? String(attr.type.key || attr.type).toUpperCase() : '';

            // 2. סינון שדות מערכת, וירטואליים ותאריכים
            if (excludedFields.includes(key) ||
                typeStr.includes('VIRTUAL') ||
                typeStr.includes('DATE') ||
                typeStr.includes('TIME')) {
                continue;
            }

            // 3. קריאה לפונקציה המנתחת
            const fieldConfig = getFieldConfig(attr, typeStr);
            if (!fieldConfig) continue;

            const schemaItem = {
                name: key,
                label: key,
                type: fieldConfig.inputType
            };

            // הוספה בטוחה:
            if (fieldConfig.options && fieldConfig.options.length > 0) {
                schemaItem.options = fieldConfig.options;
            }

            schema.push(schemaItem);
        }
    } catch (error) {
        console.error('Error generating form schema:', error);
        return null;
    }

    // פונקציית עזר חיצונית
    function getFieldConfig(attr, typeStr) {
        let inputType = 'text';
        let options = undefined;

        if (typeStr.includes('INTEGER') || typeStr.includes('FLOAT') || typeStr.includes('DECIMAL')) {
            inputType = 'number';
        } else if (typeStr.includes('BOOLEAN')) {
            inputType = 'checkbox';
        } else if (typeStr.includes('TEXT')) {
            inputType = 'textarea';
        } else if (typeStr.includes('ENUM')) {
            inputType = 'select';

            // כאן התיקון: מנסים לשלוף את ה-values ממספר מקומות אפשריים
            // לעיתים ב-Sequelize זה נמצא ב-attr.values, לעיתים ב-attr.type.values
            options = attr.values || (attr.type && attr.type.values) || [];
        }

        return { inputType, options };
    }
    return schema;
}


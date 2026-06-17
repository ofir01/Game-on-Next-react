import { NextResponse } from 'next/server';
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../../../db/models');
import { getUserId } from '../../../utils/verification';
import { UserService } from '../../../services/server/UserService';
import { GameService } from '../../../services/server/GameService';
import { NewsService } from '../../../services/server/NewsService';
import { CommentService } from '../../../services/server/commentService';

// ==================== Configuration ====================
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATION_CONFIG_API_KEY);
const generativeModel = 'gemini-flash-lite-latest';

const TASKS = ['chat', 'info', 'create', 'edit', 'delete'];

const TARGETS = {
    games: {
        modelName: 'Games',
        actions: ['info', 'create', 'edit', 'delete'],
        infoRoute: '/api/games/advanced-search',
    },
    news: {
        modelName: 'News',
        actions: ['info', 'create', 'edit', 'delete'],
        infoRoute: '/api/news',
    },
    wishlist: {
        modelName: 'Wishlist',
        actions: ['info', 'delete'],
        infoRoute: '/api/user/wishlist',
        needsUser: true,
    },
    library: {
        modelName: 'UserGame',
        actions: ['info', 'edit'],
        infoRoute: '/api/user/library',
        needsUser: true,
    },
    comments: {
        modelName: 'Comment',
        actions: ['info', 'create', 'edit', 'delete'],
        infoRoute: '/api/comments',
    },
    ratings: {
        modelName: 'UserGame',
        actions: ['info', 'edit', 'delete'],
        infoRoute: '/api/ratings',
    },
};

const ROLE_PERMISSIONS = {
    ADMIN: { info: true, delete: true, edit: true, create: true, chat: true },
    EDITOR: { info: true, delete: false, edit: true, create: true, chat: true },
    USER: { info: true, delete: false, edit: false, create: false, chat: true },
};

const TASK_LIMITS = {
    info: 5,
    delete: 1,
    edit: 1,
    create: 1,
};

const FORM_ONLY_TASKS = ['create', 'edit'];

// ==================== Route Handlers ====================
export async function POST(req) {
    try {
        const body = await req.json();
        const userContext = await getUserContext();

        if (body?.confirmAction) {
            const result = await executeConfirmedAction(body.confirmAction, userContext);
            return NextResponse.json(result, { status: 200 });
        }

        if (body?.formAction) {
            const result = await previewFormAction(body.formAction, userContext);
            return NextResponse.json(result, { status: 200 });
        }

        if (!body?.prompt?.trim()) {
            const text = await buildStateText({ status: 'missing_prompt', userContext });
            return NextResponse.json(createResponse({ text, isAction: false, status: 'missing_prompt' }), { status: 400 });
        }

        const result = await handleChatRequest(body.prompt.trim(), userContext);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Chat API Error:', error);
        const text = await buildStateText({ status: 'server_error' });
        return NextResponse.json(createResponse({ text, isAction: false, status: 'server_error' }), { status: 500 });
    }
}

async function handleChatRequest(prompt, userContext) {
    const intent = normalizeIntent(await classifyUserRequest(prompt, userContext));
    console.log('Intent:', JSON.stringify(intent));

    if (intent.task === 'chat') {
        return createResponse({
            text: intent.content || await buildStateText({ status: 'chat_ready', userContext, intent }),
            isAction: false,
            status: 'chat',
            intent,
        });
    }

    if (!canUser(userContext.role, intent.task)) {
        return aiStateResponse({ status: 'forbidden', intent, userContext, isAction: intent.task !== 'info' });
    }

    if (!targetSupportsTask(intent.target, intent.task)) {
        return aiStateResponse({ status: 'unsupported', intent, userContext, isAction: intent.task !== 'info' });
    }

    if (intent.task === 'info') {
        const queryPlan = buildInfoQueryPlan(intent, userContext);
        const text = await buildInfoPlanText(prompt, intent, queryPlan, userContext);

        return createResponse({
            text,
            isAction: false,
            status: 'info_plan',
            intent,
            queryPlan,
        });
    }

    if (shouldAskForForm(intent)) {
        return buildMissingDataResponse(intent, userContext);
    }

    return buildActionPreview(intent, userContext);
}

// ==================== Context And Permissions ====================
async function getUserContext() {
    const userId = await getUserId();
    const user = userId ? await UserService.getUserById(userId) : null;

    return {
        id: user?.id || null,
        name: user?.name || 'guest',
        role: user?.role || 'USER',
    };
}

function canUser(role, task) {
    return Boolean(ROLE_PERMISSIONS[role]?.[task]);
}

function targetSupportsTask(target, task) {
    return Boolean(TARGETS[target]?.actions?.includes(task));
}

// ==================== AI Classification ====================
async function classifyUserRequest(prompt, userContext) {
    const classificationPrompt = `
You are the routing AI for the GAME ON website.
Return only valid JSON. No markdown, no explanation.

User name: ${userContext.name}
User role: ${userContext.role}
User message: ${JSON.stringify(prompt)}

Classify the request into this exact JSON shape:
{
  "task": ${TASKS.map((task) => `"${task}"`).join(' | ')},
  "target": ${Object.keys(TARGETS).map((target) => `"${target}"`).join(' | ')},
  "isMissingData": true | false,
  "data": {
    "searchTerm": "",
    "matchType": "contains" | "startsWith" | "exact",
    "sortBy": "createdAt" | "updatedAt" | "title" | "price" | "rating" | "playCount",
    "orderDirection": "DESC" | "ASC",
    "limit": 5,
    "ids": [],
    "fields": {}
  },
  "content": ""
}

Rules:
- Use task="chat" for casual conversation or requests that do not need site data.
- Use task="info" when the user asks for site information. Do not answer the data question yourself.
- Use task="create", "edit", or "delete" only when the user clearly asks to change data.
- For create and edit, set isMissingData=true unless the request came from a completed structured form.
- For delete, require exactly one id. If there is no clear single id, set isMissingData=true.
- For info, limit is max 5. For delete, limit is always 1.
- Never invent IDs, fields, prices, ratings, names, or database facts.
- Keep content only for task="chat"; otherwise content must be empty.
- If the target is unclear, choose the closest target and set isMissingData=true.
`;

    return callLLM(classificationPrompt, { responseMimeType: 'application/json' });
}

function normalizeIntent(intent = {}) {
    const task = TASKS.includes(intent?.task) ? intent.task : 'chat';
    const target = TARGETS[intent?.target] ? intent.target : 'games';
    const data = typeof intent?.data === 'object' && intent.data !== null ? intent.data : {};
    const rawLimit = task === 'delete' ? 1 : clampNumber(data.limit, TASK_LIMITS[task] || 5, 1, TASK_LIMITS[task] || 5);
    const ids = Array.isArray(data.ids) ? data.ids.map((id) => parseInt(id, 10)).filter(Boolean).slice(0, TASK_LIMITS[task] || 5) : [];

    return {
        task,
        target,
        isMissingData: Boolean(intent?.isMissingData),
        data: {
            searchTerm: typeof data.searchTerm === 'string' ? data.searchTerm.trim() : '',
            matchType: ['contains', 'startsWith', 'exact'].includes(data.matchType) ? data.matchType : 'contains',
            sortBy: ['createdAt', 'updatedAt', 'title', 'price', 'rating', 'playCount'].includes(data.sortBy) ? data.sortBy : 'createdAt',
            orderDirection: data.orderDirection === 'ASC' ? 'ASC' : 'DESC',
            limit: rawLimit,
            ids,
            fields: typeof data.fields === 'object' && data.fields !== null ? data.fields : {},
        },
        content: typeof intent?.content === 'string' ? intent.content : '',
    };
}

// ==================== Info Plan Preparation ====================
function buildInfoQueryPlan(intent, userContext) {
    const targetConfig = TARGETS[intent.target];
    const params = {
        limit: clampNumber(intent.data.limit, 5, 1, 5),
        q: intent.data.searchTerm || undefined,
        sortBy: intent.data.sortBy,
        orderDirection: intent.data.orderDirection,
        matchType: intent.data.matchType,
        ids: intent.data.ids,
    };

    return {
        target: intent.target,
        route: targetConfig.infoRoute,
        method: 'GET',
        params: stripEmptyValues(params),
        needsUser: Boolean(targetConfig.needsUser),
        userId: targetConfig.needsUser ? userContext.id : undefined,
        maxItems: 5,
    };
}

async function buildInfoPlanText(originalPrompt, intent, queryPlan, userContext) {
    const prompt = `
You are the GAME ON assistant.
Answer in the user's language.

The user asked for information, but the chat route only prepares the database query plan and does not fetch data.

User name: ${userContext.name}
Original user request: ${JSON.stringify(originalPrompt)}
Intent: ${JSON.stringify(intent)}
Prepared query plan: ${JSON.stringify(queryPlan)}

Return a short helpful message that says the information request was understood and prepared.
Do not claim that data was found. Do not invent results.
`;

    return callLLM(prompt) || 'הבנתי את בקשת המידע והכנתי עבורה תוכנית שליפה.';
}

// ==================== Forms And Action Preview ====================
function shouldAskForForm(intent) {
    if (FORM_ONLY_TASKS.includes(intent.task)) return true;
    if (intent.task === 'delete') return intent.data.ids.length !== 1;
    return intent.isMissingData;
}

async function buildMissingDataResponse(intent, userContext) {
    const formSchema = getDynamicFormSchema(intent.target, intent.task);
    const text = await buildMissingDataText(intent, userContext);

    return createResponse({
        text,
        isAction: true,
        status: 'missing_data',
        intent,
        formSchema,
    });
}

async function previewFormAction(formAction, userContext) {
    const intent = normalizeIntent({
        task: formAction?.task,
        target: formAction?.target,
        data: {
            ids: formAction?.ids || formAction?.data?.ids || [],
            fields: formAction?.fields || formAction?.data?.fields || {},
        },
        isMissingData: false,
    });

    if (!canUser(userContext.role, intent.task)) {
        return aiStateResponse({ status: 'forbidden', intent, userContext, isAction: true });
    }

    if (!targetSupportsTask(intent.target, intent.task)) {
        return aiStateResponse({ status: 'unsupported', intent, userContext, isAction: true });
    }

    return buildActionPreview(intent, userContext);
}

async function buildActionPreview(intent, userContext) {
    const validationStatus = validateActionIntent(intent, userContext);
    if (validationStatus) {
        return aiStateResponse({ status: validationStatus, intent, userContext, isAction: true });
    }

    const confirmAction = {
        task: intent.task,
        target: intent.target,
        data: {
            ids: intent.task === 'delete' || intent.task === 'edit' ? intent.data.ids.slice(0, 1) : [],
            fields: intent.data.fields,
        },
    };

    const text = await buildPreviewText(intent, userContext);

    return createResponse({
        text,
        isAction: true,
        status: 'needs_confirmation',
        requiresConfirmation: true,
        confirmAction,
        items: buildPreviewItems(intent),
        intent,
    });
}

function validateActionIntent(intent, userContext) {
    if (TARGETS[intent.target]?.needsUser && !userContext.id) return 'login_required';
    if (intent.target === 'comments' && ['create', 'edit', 'delete'].includes(intent.task) && !userContext.id) return 'login_required';
    if (intent.task === 'delete' && intent.data.ids.length !== 1) return 'missing_delete_id';
    if (intent.task === 'edit' && intent.data.ids.length !== 1) return 'missing_edit_id';
    if (intent.task === 'edit' && !Object.keys(allowedUpdateFields(intent.target, intent.data.fields)).length) return 'missing_edit_fields';
    if (intent.task === 'create' && !Object.keys(allowedCreateFields(intent.target, intent.data.fields)).length) return 'missing_create_fields';
    return null;
}

function buildPreviewItems(intent) {
    if (intent.task === 'create') {
        return [{ id: 'new', title: intent.data.fields.title || intent.data.fields.name || 'פריט חדש', ...intent.data.fields }];
    }

    return intent.data.ids.slice(0, 1).map((id) => ({
        id,
        title: `#${id}`,
        ...intent.data.fields,
    }));
}

async function buildPreviewText(intent, userContext) {
    const prompt = `
You are the GAME ON assistant.
Answer in the user's language.

The user is about to confirm an action. No database preview was fetched.

User name: ${userContext.name}
Action intent: ${JSON.stringify(intent)}

Write a short confirmation question that clearly summarizes the action.
Mention that only one item can be deleted when task is delete.
Do not say that any item was found in the database.
`;

    return callLLM(prompt) || 'הכנתי את הפעולה לאישור. האם לבצע?';
}

async function buildMissingDataText(intent, userContext) {
    const prompt = `
You are the GAME ON assistant.
Answer in the user's language.

The user wants to perform an action, but the server requires a structured form before preview or execution.

User name: ${userContext.name}
Intent: ${JSON.stringify(intent)}

Return one short friendly sentence asking the user to complete the form.
Do not include JSON, markdown, or explanations.
`;

    return callLLM(prompt) || 'כדי להמשיך, מלא את הפרטים בטופס.';
}

function getDynamicFormSchema(target, task) {
    if (task === 'delete') {
        return [{ name: 'id', label: 'מזהה הפריט למחיקה', type: 'number', required: true }];
    }

    if (task === 'edit') {
        return [
            { name: 'id', label: 'מזהה הפריט לעריכה', type: 'number', required: true },
            ...getModelFieldSchema(target, task),
        ];
    }

    if (task === 'create') {
        return getModelFieldSchema(target, task);
    }

    return null;
}

function getModelFieldSchema(target, task) {
    const modelName = TARGETS[target]?.modelName;
    const model = modelName ? db[modelName] : null;
    if (!model?.rawAttributes) return [];

    const allowList = task === 'create' ? CREATE_FIELD_ALLOWLIST[target] : UPDATE_FIELD_ALLOWLIST[target];
    if (!allowList?.length) return [];

    return allowList
        .map((fieldName) => {
            const attr = model.rawAttributes[fieldName];
            if (!attr?.type) return null;

            const fieldConfig = getFieldConfig(attr);
            return fieldConfig ? {
                name: fieldName,
                label: fieldName,
                type: fieldConfig.inputType,
                required: attr.allowNull === false,
                options: fieldConfig.options,
            } : null;
        })
        .filter(Boolean);
}

function getFieldConfig(attr) {
    const typeStr = String(attr.type?.key || attr.type).toUpperCase();

    if (typeStr.includes('INTEGER') || typeStr.includes('FLOAT') || typeStr.includes('DECIMAL')) {
        return { inputType: 'number' };
    }

    if (typeStr.includes('BOOLEAN')) {
        return { inputType: 'checkbox' };
    }

    if (typeStr.includes('TEXT')) {
        return { inputType: 'textarea' };
    }

    if (typeStr.includes('ENUM')) {
        return { inputType: 'select', options: attr.values || attr.type?.values || [] };
    }

    return { inputType: 'text' };
}

// ==================== Confirmed Action Execution ====================
async function executeConfirmedAction(confirmAction, userContext) {
    const intent = normalizeIntent({
        task: confirmAction?.task,
        target: confirmAction?.target,
        data: confirmAction?.data || {},
        isMissingData: false,
    });

    if (!canUser(userContext.role, intent.task)) {
        return aiStateResponse({ status: 'forbidden', intent, userContext, isAction: true });
    }

    const validationStatus = validateActionIntent(intent, userContext);
    if (validationStatus) {
        return aiStateResponse({ status: validationStatus, intent, userContext, isAction: true });
    }

    const result = await runMutation(intent, userContext);
    const status = result.success ? 'done' : result.status || 'not_changed';
    const text = await buildStateText({ status, intent, userContext, result });

    return createResponse({
        text,
        isAction: true,
        status,
        result,
    });
}

async function runMutation(intent, userContext) {
    if (intent.task === 'delete') return deleteSingleItem(intent, userContext);
    if (intent.task === 'edit') return editSingleItem(intent, userContext);
    if (intent.task === 'create') return createSingleItem(intent, userContext);
    return { success: false, status: 'unsupported' };
}

async function deleteSingleItem(intent, userContext) {
    const id = intent.data.ids[0];

    if (intent.target === 'games') {
        return mutationResult(await GameService.delete(id));
    }

    if (intent.target === 'news') {
        return mutationResult(await NewsService.delete(id));
    }

    if (intent.target === 'wishlist') {
        return mutationResult(await db.Wishlist.destroy({ where: { id, userId: userContext.id } }));
    }

    if (intent.target === 'comments') {
        const result = await CommentService.delete(id, userContext.id);
        return result?.success ? { success: true, affected: 1 } : { success: false, status: result?.error || 'not_changed' };
    }

    if (intent.target === 'ratings') {
        const [affected] = await db.UserGame.update({ rating: null }, { where: { id } });
        return mutationResult(affected);
    }

    return { success: false, status: 'unsupported' };
}

async function editSingleItem(intent, userContext) {
    const id = intent.data.ids[0];
    const fields = allowedUpdateFields(intent.target, intent.data.fields);

    if (intent.target === 'games') {
        const result = await GameService.update(id, fields);
        return result?.success ? { success: true, affected: 1 } : { success: false, status: result?.error || 'not_changed' };
    }

    if (intent.target === 'news') {
        return mutationResult(await NewsService.update(id, fields));
    }

    if (intent.target === 'comments') {
        const result = await CommentService.update(id, userContext.id, fields.content);
        return result?.comment ? { success: true, affected: 1 } : { success: false, status: result?.error || 'not_changed' };
    }

    if (intent.target === 'ratings' || intent.target === 'library') {
        const [affected] = await db.UserGame.update(fields, { where: { id } });
        return mutationResult(affected);
    }

    return { success: false, status: 'unsupported' };
}

async function createSingleItem(intent, userContext) {
    const fields = allowedCreateFields(intent.target, intent.data.fields);

    if (intent.target === 'games') {
        const created = await GameService.create(fields, fields.selectedCategoryIds || []);
        return created?.id ? { success: true, id: created.id, title: created.title } : { success: false, status: 'not_changed' };
    }

    if (intent.target === 'news') {
        const created = await NewsService.create(fields);
        return created?.id ? { success: true, id: created.id, title: created.title } : { success: false, status: 'not_changed' };
    }

    if (intent.target === 'comments') {
        const created = await CommentService.create({ userId: userContext.id, ...fields });
        return created?.comment?.id ? { success: true, id: created.comment.id } : { success: false, status: created?.error || 'not_changed' };
    }

    return { success: false, status: 'unsupported' };
}

function mutationResult(value) {
    const affected = typeof value === 'boolean' ? (value ? 1 : 0) : Number(value || 0);
    return affected > 0 ? { success: true, affected } : { success: false, status: 'not_changed', affected: 0 };
}

// ==================== Field Allow Lists ====================
const CREATE_FIELD_ALLOWLIST = {
    games: ['title', 'description', 'price', 'status', 'imageUrl', 'gameUrl', 'releaseDate', 'discountPercentage', 'discountUntil'],
    news: ['title', 'content'],
    comments: ['gameId', 'content', 'parentId'],
};

const UPDATE_FIELD_ALLOWLIST = {
    games: ['title', 'description', 'price', 'status', 'discountPercentage', 'discountUntil', 'imageUrl', 'gameUrl'],
    news: ['title', 'content'],
    comments: ['content'],
    ratings: ['rating', 'status', 'isFavorite'],
    library: ['rating', 'status', 'isFavorite'],
};

function allowedCreateFields(target, fields) {
    return pickAllowedFields(fields, CREATE_FIELD_ALLOWLIST[target] || []);
}

function allowedUpdateFields(target, fields) {
    return pickAllowedFields(fields, UPDATE_FIELD_ALLOWLIST[target] || []);
}

function pickAllowedFields(fields, allowedFields) {
    return Object.fromEntries(
        Object.entries(fields || {}).filter(([key, value]) => allowedFields.includes(key) && value !== undefined && value !== '')
    );
}

// ==================== Response Text ====================
async function aiStateResponse({ status, intent, userContext, isAction }) {
    const text = await buildStateText({ status, intent, userContext });
    return createResponse({ text, isAction, status, intent });
}

async function buildStateText({ status, intent = null, userContext = {}, result = null }) {
    const prompt = `
You are the GAME ON assistant.
Answer in the user's language.

Build one concise user-facing message for this state.

Status: ${status}
User: ${JSON.stringify(userContext)}
Intent: ${JSON.stringify(intent)}
Mutation result: ${JSON.stringify(result)}

Rules:
- Use a friendly, consistent tone.
- Do not expose internal errors, stack traces, or permission policy details.
- For forbidden, say the action cannot be performed by this user.
- For not_changed, say the action was not completed.
- For done, say the action completed successfully and mention result details when available.
- No markdown unless it helps readability.
`;

    return callLLM(prompt) || fallbackStateText(status);
}

function fallbackStateText(status) {
    const messages = {
        missing_prompt: 'חסר טקסט לבקשה.',
        server_error: 'השרת נתקל בשגיאה. נסה שוב עוד רגע.',
        chat_ready: 'אני כאן. איך אפשר לעזור?',
        forbidden: 'אי אפשר לבצע את הפעולה הזו עם ההרשאות הנוכחיות.',
        unsupported: 'הפעולה הזו עדיין לא נתמכת בצאט.',
        login_required: 'צריך להתחבר כדי לבצע את הפעולה הזו.',
        missing_delete_id: 'כדי למחוק צריך מזהה יחיד של פריט.',
        missing_edit_id: 'כדי לערוך צריך מזהה יחיד של פריט.',
        missing_edit_fields: 'כדי לערוך צריך למלא לפחות שדה אחד.',
        missing_create_fields: 'כדי ליצור פריט צריך למלא את פרטי הטופס.',
        not_changed: 'הפעולה לא הושלמה.',
        done: 'הפעולה בוצעה בהצלחה.',
    };

    return messages[status] || 'לא הצלחתי להשלים את הבקשה.';
}

function createResponse(data) {
    return {
        text: data.text,
        isAction: Boolean(data.isAction),
        status: data.status || null,
        ...data,
    };
}

// ==================== LLM And Utilities ====================
async function callLLM(prompt, { responseMimeType, maxOutputTokens = 2000, temperature = 0.2 } = {}) {
    const params = {
        model: generativeModel,
        generationConfig: {
            maxOutputTokens,
            temperature,
        },
    };

    if (responseMimeType) {
        params.generationConfig.responseMimeType = responseMimeType;
    }

    try {
        const model = genAI.getGenerativeModel(params);
        const result = await model.generateContent(prompt);
        const textResult = result?.response?.text?.();

        if (!textResult) return null;
        return responseMimeType === 'application/json' ? JSON.parse(textResult) : textResult;
    } catch (error) {
        console.error('Gemini API Error:', error);
        return null;
    }
}

function clampNumber(value, fallback, min, max) {
    const number = parseInt(value, 10);
    if (Number.isNaN(number)) return fallback;
    return Math.max(min, Math.min(max, number));
}

function stripEmptyValues(object) {
    return Object.fromEntries(
        Object.entries(object).filter(([, value]) => {
            if (value === undefined || value === null || value === '') return false;
            if (Array.isArray(value) && !value.length) return false;
            return true;
        })
    );
}

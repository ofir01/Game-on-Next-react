import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserId } from '../../../utils/verification';
import { UserService } from '../../../services/server/UserService';
import { GameService } from '../../../services/server/GameService';
import { NewsService } from '../../../services/server/NewsService';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATION_CONFIG_API_KEY);
const generativeModel = 'gemini-flash-lite-latest';

export async function POST(req) {
    try {
        const body = await req.json();
        const userContext = await getUserContext();

        if (!body || !Array.isArray(body) || body.length === 0) {
            return NextResponse.json({ text: 'היסטוריית השיחה ריקה.' }, { status: 400 });
        }

        const lastMessage = body[body.length - 1];
        if (!lastMessage?.content?.trim()) {
            return NextResponse.json({ text: 'חסר טקסט לבקשה.' }, { status: 400 });
        }

        const result = await handleChatRequest(body, userContext);
        return NextResponse.json(result, { status: 200 });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ text: 'השרת נתקל בשגיאה. נסה שוב עוד רגע.' }, { status: 500 });
    }
}

//מידע על המשתמש
async function getUserContext() {
    const userId = await getUserId();
    const user = userId ? await UserService.getUserById(userId) : null;
    return { name: user?.name || 'guest' };
}

//פונקציה להחזרת תשובה ללקוח
const createResponse = (text) => ({ text });

// מיפוי הפעולות למניעת כפילות קוד (Switch)
const INTENT_HANDLERS = {
    'get_games': findGames,
    'get_stats': findStats,
    'get_news': findNews,
    'getSimilarGames': findSimilarGames,
    'getUpcomingGames': findUpcomingGames,
    'getRecommendation': findRecommendation
};

//פונקציה ראשית
async function handleChatRequest(prompt, userContext) {
    const intent = await classifyUserRequest(prompt);
    console.log("Intent: ", intent);

    // הגנה מקריסה אם ה-AI נכשל
    if (!intent) {
        return createResponse("There was a problem parsing the request, please try again.");
    }

    if (intent.intent === 'unknown' || !INTENT_HANDLERS[intent.intent]) {
        return createResponse(intent.reply || "I didn't fully understand the request, could you explain again?");
    }

    // הפעלת הפונקציה המתאימה לפי ה-Intent
    const fetchFunction = INTENT_HANDLERS[intent.intent];
    const dbResult = await fetchFunction(intent);
    console.log(`DB Result for ${intent.intent}:`, dbResult);

    // בחירת פרומפט התגובה המתאים (מועצה או תגובה רגילה)
    let llmResponse;
    if (intent.intent === 'getRecommendation') {
        llmResponse = await buildCouncilAnswer(intent, dbResult, userContext);
    } else {
        llmResponse = await generateResponse(intent, dbResult, userContext);
    }

    return createResponse(llmResponse?.reply || "An error occurred creating the reply.");
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// פונקציות שליפה מהדאטהבייס 
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//המלצה למשחק
async function findRecommendation(intentData) {
    const { filters, sort, limit, offset, page, minPrice, maxPrice } = intentData;
    const categoriesParam = filters?.category && filters.category.trim() !== "" ? [filters.category] : [];

    return await GameService.getAdvancedSearch({
        q: filters?.gameName || '',
        sort: sort?.field || 'new',
        limit: limit || 10,
        offset: offset || 0,
        page: page || 1,
        minPrice: minPrice || null,
        maxPrice: maxPrice || null,
        categories: categoriesParam
    });
}

//משחקים קרובים
async function findUpcomingGames(intentData) {
    return await GameService.getUpcomingGames(intentData.limit || 10, intentData.offset || 0);
}

//המשחק הכי משוחק
async function findStats(intentData) {
    if (intentData.sort?.field === 'plays') {
        return await GameService.getTrendingGames(intentData.limit || 10, intentData.offset || 0);
    }
    return []; // Fallback
}

//משחקים דומים
async function findSimilarGames(intentData) {
    if (intentData.filters?.gameName) {
        const gameData = await GameService.getGameBySlug(intentData.filters.gameName);
        if (gameData && gameData.id) {
            return await GameService.getSimilarGames(gameData.id, gameData.categoryIds || [], intentData.limit || 5);
        }
    }
    return []; // חובה להחזיר מערך ריק במקום טקסט למניעת קריסות בפרומפט הבא
}

//משחקים
async function findGames(intentData) {
    const { filters, sort, limit, offset } = intentData;
    const searchLimit = limit || 10;

    if (filters?.gameName) {
        return await GameService.getAdvancedSearch({ q: filters.gameName, limit: searchLimit }).then(res => res.games);
    }
    if (filters?.category) {
        return await GameService.getAdvancedSearch({ categories: [filters.category], limit: searchLimit }).then(res => res.games);
    }
    if (sort?.field === 'rating') {
        return await GameService.getTopRatedGames(searchLimit, offset || 0);
    }
    if (sort?.field === 'createdAt') {
        return await GameService.getAdvancedSearch({ sort: 'newest', limit: searchLimit }).then(res => res.games);
    }
    return [];
}

//חדשות
async function findNews(intentData) {
    const { limit = 5, offset = 0 } = intentData;
    const page = Math.floor(offset / limit) + 1;
    try {
        const result = await NewsService.get({ page, limit });
        return result?.news || [];
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// פרומפטים
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//מיון הבקשה
async function classifyUserRequest(prompt) {
    const classificationPrompt = `
You are the routing AI for the GAME ON website.
Your only job is to classify the user's latest request and return the smallest useful database-query JSON object.
Return ONLY valid JSON. No Markdown block, no explanations, no extra keys.

User message history:
${JSON.stringify(prompt, null, 2)}

VALID INTENTS:
- "get_games": search/list games by name, category, newest, best rated, or a direct game request.
- "get_stats": most played/trending games only.
- "get_news": site news/articles.
- "getSimilarGames": games similar to one named game.
- "getUpcomingGames": future/coming-soon games.
- "getRecommendation": advice/recommendation requests, including price-aware suggestions.
- "unknown": greetings, small talk, unclear requests, wording help, memory/history questions, or unsupported actions.

OUTPUT FORMAT (STRICT):
{
  "intent": "get_games" | "get_stats" | "get_news" | "unknown" | "getSimilarGames" | "getUpcomingGames" | "getRecommendation",
  "filters": { "gameName": "", "category": "" },
  "sort": { "field": "createdAt" | "rating" | "plays" },
  "page": number,
  "minPrice": number | null,
  "maxPrice": number | null,
  "limit": number,
  "offset": number,
  "reply": "String used ONLY when intent is unknown, otherwise empty string",
  "summary": "Brief summary of request",
  "language": "he" | "en" | "other"
}

RULES:
1. Always infer from the latest user message, but use conversation history for follow-ups like "עוד", "הבא", "כמו זה", or "לפני האחרון".
2. Use "unknown" when the user is only chatting, asks what they previously said, asks for wording help, asks to compare games without enough names/data, or requests an unsupported action. Put the answer/clarifying question in "reply".
3. Do not invent game names, categories, prices, ratings, news, or facts. If a game/category is only partially written, copy the user's text as-is.
4. Category values must be short English category names when obvious, for example "shooter", "puzzle", "racing", "action", "sports"; otherwise leave category as "".
5. Sort defaults to { "field": "createdAt" }. Use "rating" for best/top/highest rated. Use "plays" only for most played/trending/popular by plays.
6. Limit defaults to 10. Use 1 for a single specific/latest/best game. Use 5 for similar games. Respect an explicit user number when reasonable.
7. Offset defaults to 0. "next/more/עוד/הבא" continues the previous topic by adding the previous limit to offset. "second last/לפני האחרון" means limit 1 and offset 1. "third last" means limit 1 and offset 2.
8. Page defaults to 1. If the user asks for page N, set page to N and offset to (N - 1) * limit.
9. minPrice and maxPrice default to null. For free games set maxPrice to 0. For "under X" set maxPrice. For "over X" set minPrice. Price-aware advice should usually be "getRecommendation".
10. For every intent except "unknown", reply must be "".

EXAMPLES:
User: "המשחק האחרון" -> intent get_games, sort.field createdAt, limit 1, offset 0
User: "המשחק הכי טוב" -> intent get_games, sort.field rating, limit 1
User: "משחקים דומים לקנדי קראש" -> intent getSimilarGames, filters.gameName "קנדי קראש", limit 5
User: "תמליץ לי על משחק יריות חינמי" -> intent getRecommendation, filters.category "shooter", maxPrice 0
User: "מה אמרתי קודם?" -> intent unknown, reply in Hebrew
`;
    return callLLM(classificationPrompt);
}

//תגובה כללית
async function generateResponse(intent, data, userContext) {
    const responsePrompt = `
You are a helpful and energetic assistant for the GAME ON website.
User Name: ${userContext.name}
User Request: "${intent.summary}"
Language: ${intent.language}
Database Result: ${JSON.stringify(data)}

Rules:
1. Write a friendly, concise response in the user's language based ONLY on the database result.
2. ALWAYS use Markdown to bold game titles, for example **Candy-Crush**.
3. Include only fields that appear in the result: title, short description, rating, price/free status, release date, or play count.
4. If the result is an object with a "games" array, use that array. If the array is empty or data is empty, politely say no matches were found and suggest a narrower search.
5. Do not mention internal IDs, raw JSON, database, intent, filters, or implementation details.
6. Do not invent ratings, prices, descriptions, release dates, or categories.
7. Output MUST be ONLY valid JSON in this format: { "reply": "your response" }
`;
    return await callLLM(responsePrompt);
}

//המלצה על משחקים
async function buildCouncilAnswer(intent, infoResult, userContext) {
    const answerPrompt = `
You are the GAME ON council giving a recommendation.
User Name: ${userContext.name}
User Request: ${intent.summary}
Language: ${intent.language}
Database Result: ${JSON.stringify(infoResult)}

Write your response entirely inside a valid JSON object like this: { "reply": "markdown content here" }

The "reply" string MUST be formatted exactly as this Markdown structure:
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

Base all facts ONLY on the provided database result.
If there are no usable games in the result, keep the same JSON format but politely say that no matching games were found and ask for another category, style, or price range.
Do not mention internal IDs, raw JSON, database, intent, filters, or implementation details.
`;
    return await callLLM(answerPrompt);
}

//המודל
async function callLLM(prompt) {
    try {
        const model = genAI.getGenerativeModel({
            model: generativeModel,
            generationConfig: {
                responseMimeType: 'application/json',
                maxOutputTokens: 2000,
                temperature: 0.2,
            }
        });
        const result = await model.generateContent(prompt);
        const textResult = result.response.text();
        return textResult ? JSON.parse(textResult) : null;
    } catch (error) {
        console.error('Gemini API Error:', error);
        return null;
    }
}

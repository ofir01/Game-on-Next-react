
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getUserId } from '../../../utils/verification';
import { UserService } from '../../../services/server/UserService';
import { GameService } from '../../../services/server/GameService';
import { NewsService } from '../../../services/server/NewsService';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GOOGLE_GENERATION_CONFIG_API_KEY);
const generativeModel = 'gemini-flash-lite-latest';

//מחזיר מערך בשביל לענות לכמה בקשות של משתמש,
//מקבל אובייקט שבו הבקשות הקודמות והתשובות בשביל זיכרון שיחות קודמות
//שימוש בסטריים בשביל לקבל תשובה בחלקים ולא לחכות עד הסוף
export async function POST(req) {
    try {
        const body = await req.json();
        const userContext = await getUserContext(req);

        if (!body || !Array.isArray(body) || body.length === 0) {
            return NextResponse.json({ text: 'Conversation history is empty.' }, { status: 400 });
        }

        //בודקים אם יש שיח בשיחה האחרונה
        const lastMessage = body[body.length - 1];
        if (!lastMessage?.content?.trim()) {
            return NextResponse.json({ text: 'Request text is missing.' }, { status: 400 });
        }

        // 1. מיון הבקשות וקבלת מערך של כוונות (Multi-Intent)
        const classification = await classifyUserRequest(body);
        console.log("Classification: ", classification);

        if (!classification || !classification.intents) {
            return NextResponse.json({ text: 'There was a problem parsing the request, please try again.' }, { status: 500 });
        }

        // 2. ריצה במקביל על כל הבקשות מול הדאטהבייס
        const fetchPromises = classification.intents.map(async (intent) => {
            if (!INTENT_HANDLERS[intent.intent]) {
                return { intent: intent.intent, summary: intent.summary, language: intent.language, data: null, reply: intent.reply };
            }
            const fetchFunction = INTENT_HANDLERS[intent.intent];
            const dbResult = await fetchFunction(intent);
            return { intent: intent.intent, summary: intent.summary, language: intent.language, data: dbResult, reply: intent.reply || "" };
        });

        const allDbResults = await Promise.all(fetchPromises);
        console.log("All DB Results: ", allDbResults);

        // 3. פתיחת זרם תשובה מה-AI שכולל את כל המידע
        const resultStream = await getFinalStream(allDbResults, userContext);
        const encoder = new TextEncoder();

        // 4. בניית ReadableStream שמשחרר מידע למשתמש משפט-אחר-משפט
        const readableStream = new ReadableStream({
            async start(controller) {
                let buffer = '';
                try {
                    for await (const chunk of resultStream.stream) {
                        buffer += chunk.text();

                        // מחפשים את סוף המשפט האחרון (נקודה, סימן קריאה, סימן שאלה או ירידת שורה)
                        const lastPunctuationIndex = Math.max(
                            buffer.lastIndexOf('.'),
                            buffer.lastIndexOf('!'),
                            buffer.lastIndexOf('?'),
                            buffer.lastIndexOf('\n')
                        );

                        // אם מצאנו משפט שלם, נשחרר אותו ללקוח
                        if (lastPunctuationIndex !== -1) {
                            const chunkToSend = buffer.slice(0, lastPunctuationIndex + 1);
                            controller.enqueue(encoder.encode(chunkToSend));
                            buffer = buffer.slice(lastPunctuationIndex + 1); // משאירים בחוצץ רק את החלק שעוד לא הושלם
                        }
                    }
                    // בסוף, שחרור של כל מה שנותר בחוצץ
                    if (buffer.trim()) {
                        controller.enqueue(encoder.encode(buffer));
                    }
                    controller.close();
                } catch (err) {
                    controller.error(err);
                }
            }
        });

        // החזרת הזרם (זה כבר לא NextResponse.json)
        return new Response(readableStream, {
            headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
            },
        });
    } catch (error) {
        console.error('Chat API Error:', error);
        return NextResponse.json({ text: 'השרת נתקל בשגיאה. נסה שוב עוד רגע.' }, { status: 500 });
    }
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// פונקציות צד שרת ודאטהבייס!
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

//מידע על המשתמש
async function getUserContext(req) {
    const userId = await getUserId(req);
    const user = userId ? await UserService.getUserById(userId) : null;
    return { name: user?.name || 'guest' };
}

// מיפוי הפעולות למניעת כפילות קוד (Switch)
const INTENT_HANDLERS = {
    'get_games': findGames,
    'get_stats': findStats,
    'get_news': findNews,
    'getSimilarGames': findSimilarGames,
    'getUpcomingGames': findUpcomingGames,
    'getRecommendation': findRecommendation
};

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
    return []; 
}

//משחקים דומים
async function findSimilarGames(intentData) {
    if (intentData.filters?.gameName) {
        const gameData = await GameService.getGameBySlug(intentData.filters.gameName);
        if (gameData && gameData.id) {
            return await GameService.getSimilarGames(gameData.id, gameData.categoryIds || [], intentData.limit || 5);
        }
    }
    return [];
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
// פרומפטים - מותאמים לריבוי בקשות והזרמה
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

// מיון הבקשה - להחזרת מערך intents
//לתת דוגמא, לעשות חוקים עשה ואל תעשה,לרשום תוצאה סופית רצויה,
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
- "unknown": greetings, small talk, unclear requests, or memory/history questions.
- "wording_help": help rewriting text, creating game descriptions, drafting content, or brainstorming game names.
- "out_of_scope": weather, cooking, math, or any topic completely unrelated to gaming.

OUTPUT FORMAT (STRICT):
{
  "intents": [
    {
      "intent": "get_games" | "get_stats" | "get_news" | "unknown" | "getSimilarGames" | "getUpcomingGames" | "getRecommendation" | "wording_help" | "out_of_scope",
      "filters": { "gameName": "", "category": "" },
      "sort": { "field": "createdAt" | "rating" | "plays" },
      "page": number,
      "minPrice": number | null,
      "maxPrice": number | null,
      "limit": number,
      "offset": number,
      "reply": "CRITICAL: MUST MATCH THE USER'S EXACT LANGUAGE. Used ONLY for unknown, out_of_scope, wording_help, or when details are missing. Otherwise empty string.",
      "summary": "Brief summary of request",
      "language": "he" | "en" | "other"
    }
  ]
}

RULES:
1. Always infer from the latest user message. You MUST write the "reply" in the EXACT SAME LANGUAGE as the user's latest message (e.g., reply in English for English inputs).
2. Use "unknown" when the user is only chatting. Put the answer in "reply".
3. Do not invent game names, categories, prices, ratings, news, or facts. 
4. Category values must be short English category names when obvious, for example "shooter", "puzzle", "racing".
5. Sort defaults to { "field": "createdAt" }. Use "rating" for best/top. Use "plays" for most played.
6. Limit defaults to 10. Use 1 for a single specific game.
7. Offset defaults to 0. 
8. minPrice and maxPrice default to null. For free games set maxPrice to 0.
9. For every intent except "unknown", "out_of_scope", and "wording_help", reply must be "". EXCEPT when details are missing (see rule 11).
10. For "out_of_scope" (e.g. weather): Set intent to "out_of_scope" and put a polite refusal in "reply" in the user's language.
11. Missing Details: If the user asks for wording help or news but did not provide the specific text/game, keep the intent, leave filters empty, and write a polite follow-up question in "reply" asking for the missing details.
12. For "wording_help" when details ARE present: Fulfill the request directly and put the rewritten text inside the "reply" key.
`;
    return callLLM(classificationPrompt);
}

// יצירת הסטרים הסופי (מאחד את התגובה הרגילה ומועצת החכמים)
async function getFinalStream(intentsData, userContext) {
    const hasRecommendation = intentsData.some(i => i.intent === 'getRecommendation');
    const mainLanguage = intentsData[0]?.language || 'he';

    const streamPrompt = `
You are a helpful and energetic assistant for the GAME ON website.
User Name: ${userContext.name}
Language to use: ${mainLanguage}

Here are the user's requested intents and the database results or pre-written replies for each:
${JSON.stringify(intentsData)}

Rules:
1. Write a friendly, cohesive response combining the answers for ALL intents based on the results.
2. CRITICAL RULE: You MUST write the entire response in the exact language specified above: "${mainLanguage}". If the language is "en", write only in English. 
3. If an intent contains a pre-written "reply" (like for wording_help, out_of_scope, or missing details), prioritize using or outputting that "reply" text directly, maintaining its language.
4. ALWAYS use Markdown to bold game titles, for example **Candy-Crush**.
5. Include only fields that appear in the result (title, description, rating, price, release date).
6. Do not mention internal IDs, raw JSON, database, intent, or implementation details.
7. Provide ONLY the final text in Markdown. DO NOT wrap the output in JSON format.

${hasRecommendation ? `
8. Because the user asked for a recommendation, you MUST format the recommendation part of your answer exactly like this Council structure:
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
` : ''}
`;

    // אנו קוראים למודל ללא ההגבלה של 'application/json' כדי לאפשר הזרמה של טקסט רגיל
    const model = genAI.getGenerativeModel({
        model: generativeModel,
        generationConfig: {
            maxOutputTokens: 2000,
            temperature: 0.2,
        }
    });
    return await model.generateContentStream(streamPrompt);
}

//המודל עבור החזרת JSON בלבד (משמש כעת רק עבור ה-Classification)
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


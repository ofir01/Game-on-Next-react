import { NextResponse } from 'next/server';
const { Op } = require('sequelize');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const db = require('../../../db/models');
import { getUserId } from '../../../utils/verification';
import { UserService } from '../../../services/server/UserService';
import { GameService } from '../../../services/server/GameService';
import { NewsService } from '../../../services/server/NewsService';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATION_CONFIG_API_KEY);
const generativeModel = 'gemini-flash-lite-latest';




//מבצע בדיקה אם מדובר בפעולה שהמשתמש מורשה לבצע לפי התפקיד שלו ומה הפעולה והטארגט המבוקשים
export async function POST(req) {
    try {
        //קבלת הנתונים מהבקשה והקשר המשתמש - מי המשתמש, מה התפקיד שלו, וכו'
        const body = await req.json();
        const userContext = await getUserContext();

        console.log('body: ' + JSON.stringify(body));
        //בדיקת תקינות
        if (!body || !Array.isArray(body) || body.length === 0) {
            return NextResponse.json({ text: 'היסטוריית השיחה ריקה.' }, { status: 400 });
        }

        // 2. שולפים את האובייקט האחרון במערך (ההודעה הנוכחית של המשתמש)
        const lastMessage = body[body.length - 1];

        // 3. בודקים שההודעה האחרונה מכילה טקסט תקין
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


// מחזירה נתונים של המשתמש וההרשאות שלו
async function getUserContext() {
    const userId = await getUserId();
    const user = userId ? await UserService.getUserById(userId) : null;

    return {
        name: user?.name || 'guest',
    };
}

// פונקציה עזר ליצירת תגובות אחידות מהפרומפט
const createResponse = (data) => {
    return {
        text: data.text,
    };
};



// הפונקציה הראשית של פרומפט
async function handleChatRequest(prompt, userContext) {

    // שולח את הפרומפט עם הקשר המשתמש והאתר לLLM כדי לסווג את הבקשה ולזהות אם זה שאלה רגילה או בקשה לפעולה שדורשת אישור
    const intent = await classifyUserRequest(prompt, userContext);
    console.log("Intent: " + JSON.stringify(intent));
    /*
  Intent: {"intent":"get_games","queryType":"single","filters":{"gameName":"","category":"","userId":"","gameId":""},
           "sort":{"field":"rating","direction":"DESC"},"limit":1,"offset":0,,"reply":""}
    */
    // "intent": "get_games" | "get_players" | "get_stats", "unknown"

    //'CHAT'
    if (intent.intent === 'unknown') {
        return createResponse({ text: intent.reply });
    }

    if (intent.intent === 'get_games') {
        const resolt = await findGames(intent);
        console.log('resolt: ' + JSON.stringify(resolt));

        const llm = await generateResponse(intent, resolt, userContext);
        console.log('llm: ' + JSON.stringify(llm));
        return createResponse({ text: llm.reply });
    }

    if (intent.intent === 'get_news') {
        const resolt = await findNews(intent);
        console.log('resolt: ' + JSON.stringify(resolt));

        const llm = await generateResponse(intent, resolt, userContext);
        console.log('llm: ' + JSON.stringify(llm));
        return createResponse({ text: llm.reply });
    }




    return createResponse({ text: intent.reply });
}

async function generateResponse(intent, data, userContext) {
    const responsePrompt = `
You are a helpful assistant for the GAME ON website.
Your role: Write a natural and friendly response in the SAME language as the user's request, based on the provided database data.

Rules:
1. IDENTIFY THE LANGUAGE of the user's request and respond in THAT SAME LANGUAGE.
2. Use the database data provided to create a DETAILED and ENGAGING response.
   - IMPORTANT: ALWAYS use Markdown to BOLD the game title (e.g., **Candy-Crush**).
   - If a specific game is found, include: title (bolded), brief description, avgRating, and price.
   - If the game is free, mention it clearly.
3. Be friendly and professional.
4. If the data is empty, say you couldn't find anything in the user's language.
5. Output ONLY valid JSON with a "reply" key.

Data provided: ${JSON.stringify(data)}

User Request: "${intent.summary}"
User Name: ${userContext.name}
User language: ${intent.language}

Output format:
{
  "reply": "your detailed response here"
}
`;
    return await callLLM(responsePrompt);
}

//מציאת משחק
async function findGames(intentData) {
    const { filters, sort, limit, offset } = intentData;
    console.log("filters.gameName: " + filters.gameName, "filters.category: " + [filters.category], ": " + sort, "limit: " + limit, "offset: " + offset);

    // מקרה 1: חיפוש משחק ספציפי לפי שם
    if (filters.gameName) {
        return await GameService.getAdvancedSearch({
            q: filters.gameName,
            limit: limit
        }).then(res => res.games);
    }

    // מקרה 2: משחקים לפי קטגוריה
    if (filters.category) {
        return await GameService.getAdvancedSearch({
            categories: [filters.category],
            limit: limit
        }).then(res => res.games);
    }

    // מקרה 3: שליפה לפי מיון (הכי מדורג, הכי חדש וכו')
    if (sort?.field === 'rating') {
        return await GameService.getTopRatedGames(limit || 10);
    }

    if (sort?.field === 'createdAt') {
        // אין פונקציה ישירה ל"חדשים", אז נשתמש בחיפוש מתקדם עם מיון
        return await GameService.getAdvancedSearch({
            sort: 'newest',
            limit: limit
        }).then(res => res.games);
    }


//getUpcomingGames
//getSimilarGames
    return [];
}

async function findNews(intentData) {
    const { filters, sort, limit, offset } = intentData;


    // 🧠 חישוב ה-page מתוך ה-offset:
    // אם ה-offset הוא 0, אנחנו בעמוד 1. אם ה-offset הוא 5 וה-limit הוא 5, אנחנו בעמוד 2.
    const page = Math.floor(offset / limit) + 1;

    try {
        // קריאה לפונקציית ה-get של ה-News Service שלך
        const result = await NewsService.get({
            page: page,
            limit: limit
        });

        // החזרת הנתונים (מערך החדשות)
        return result.news || [];
    } catch (error) {
        console.error("Error fetching news:", error);
        return [];
    }
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






//====================סיווג בקשות המשתמש====================
// פעולה ראשונה של החוקים
async function classifyUserRequest(prompt, userContext) {
    const formattedHistory = JSON.stringify(prompt, null, 2);
    const classificationPrompt = `
You are the routing AI for the GAME ON website.

Your job:
Convert user messages into a structured database query object ONLY.
You do NOT fetch data.
You do NOT perform actions.
You ONLY output valid JSON.

Return ONLY JSON. No markdown. No explanation. No extra text.

User message:
${formattedHistory}

User name:
${userContext.name}

---

OUTPUT FORMAT (STRICT):

{
  "intent": "get_games" | "get_players" | "get_stats"| "get_news" | "unknown"
  "queryType": "single" | "list",
  "filters": {
    "gameName": "",
    "category": "",
  },
  "sort": {
    "field": "createdAt" | "rating" | "plays" | "score",
    "direction": "ASC" | "DESC"
  },
  "limit": number,
  "offset": number,
  "reply": "string (ONLY used if intent is 'unknown', otherwise empty string '')",
  "summary": "Brief summary of the user's request",
  "language": "the user's language"
}

---

RULES:

1. intent mapping:
- If user asks about games → "get_games"
- If user asks about players → "get_players"
- If user asks about rankings/stats → "get_stats"

2. queryType:
- "single" = one result (e.g. "latest game", "best game", "game X")
- "list" = multiple results (e.g. "all shooting games", "top 10 games")

3. sorting rules:
- "latest", "newest", "recent" → sort.field = "createdAt", direction = "DESC"
- "oldest", "first" → direction = "ASC"
- "best", "top", "highest rating" → sort.field = "rating", direction = "DESC"
- "most played" → sort.field = "plays", direction = "DESC"
- default sort: createdAt DESC

4. filters:
- If user mentions a game name → put in filters.gameName
- If the user requests a game similar to a specific game, enter the game name in filters.gameName , and increase the limit to 5.
- If the user requests a specific game and provides only part of the game name, enter the same name without any additions to filters.gameName

- If category mentioned → put in filters.category

- If user is looking for news put in intent = get_news

5. limit rules:
- single result → limit = 1
- list requests → default limit = 10 unless user asks otherwise

6. offset rules:
- "second last" → offset = 1, limit = 1
- "third last" → offset = 2, limit = 1
- otherwise offset = 0

7. NEVER:
- Do not generate text answers
- Do not guess missing data
- Do not invent fields outside schema
- Do not return explanations
- Do not include extra keys

8.
- If the user is asking about the conversation history (e.g., "what did I say?", "what game did I ask for?", "remember this"), or just greeting/chatting -> intent MUST be "unknown". Provide the answer in the "reply" field.

9.
-If user asks for help with the wording, check if the user has entered all the details required for you to analyze, if not, ask them to enter them, and always → put in intent → unknown


---

EXAMPLES:

User: "המשחק האחרון"
→ createdAt DESC, limit 1

User: "המשחק לפני האחרון"
→ createdAt DESC, limit 1, offset 1

User: "משחקי יריות"
→ category = shooter, list, limit 10

User: "המשחק הכי טוב"
→ rating DESC, limit 1

User: "מי השחקן הכי טוב"
→ intent = get_players, sort score DESC, limit 1

---

Return ONLY the JSON object.
`;
    return callLLM(classificationPrompt);
}

//הנתונים של המודל
async function callLLM(prompt) {

    //בניית האובייקט לקריאה לבינה מלאכותית
    const params = {
        model: generativeModel,
        generationConfig: {
            responseMimeType: 'application/json',
            maxOutputTokens: 2000,
            temperature: 0.2,
        }
    };

    try {
        const model = genAI.getGenerativeModel(params);

        const result = await model.generateContent(prompt);
        //מגיע עם הרבה נתונים נוספים, אבל הטקסט עצמו נמצא בresponse.text
        const textResult = result.response.text();

        if (!textResult) return null;
        return JSON.parse(textResult);
    } catch (error) {
        console.error('Gemini API Error:', error);
        return null;
    }
}


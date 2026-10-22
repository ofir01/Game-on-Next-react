import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENERATION_CONFIG_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);
const generativeModel = 'gemini-flash-lite-latest';

export async function callLLM(prompt, expectJson = false) {
    try {
        const model = genAI.getGenerativeModel({
            model: generativeModel,
            generationConfig: {
                responseMimeType: expectJson ? 'application/json' : 'text/plain',
                maxOutputTokens: 2000,
                temperature: expectJson ? 0.2 : 0.8,
            }
        });
        
        const result = await model.generateContent(prompt);
        const textResult = result.response.text();
        
        return expectJson ? JSON.parse(textResult) : textResult;
    } catch (error) {
        console.error('Gemini SDK Error:', error);
        return null;
    }
}

// פונקציה חכמה למאמן שיודעת מה מצב המשחק
export async function getCoachAdvice(gameState) {
    // מנסים לשלוף את שם המשחק מהאובייקט (אם שלחת אותו), אחרת נשתמש בשם כללי
    const gameName = gameState.gameName || "המשחק הזה";
    
    // ניסוח הפרומפט ששולח את כל האובייקט כמו שהוא ל-AI
    const prompt = `
    אתה מאמן קשוח, ציני אבל משעשע של שחקן שמשחק כרגע ב-"${gameName}".
    
    הנה המצב הנוכחי של המשחק (מוצג כאובייקט נתונים):
    ${JSON.stringify(gameState, null, 2)}
    
    הוראות למאמן:
    1. נתח את הנתונים כדי להבין את מצב השחקן. (למשל: חפש משתנים כמו מהלכים, תורים, פגיעות, מצב ניצחון/הפסד וכו').
    2. תן לו משפט אחד קצר (עד 12 מילים) בעברית שמתייחס ישירות וספציפית לביצועים שלו לפי הנתונים.
    3. אם הנתונים מראים שהוא עדיין לא עשה אף מהלך (למשל 0 תורים או 0 מהלכים) - תן לו עקיצה שתדרבן אותו להתחיל לשחק.
    4. אם הנתונים מראים שהוא מצליח יפה - תפרגן אבל עם עקיצה קטנה.
    5. אם הוא מנחש גרוע או עושה המון מהלכים - תרד עליו בצורה מצחיקה.
    `;
    
    return await callLLM(prompt, false);
}

// פונקציה ליצירת התמונות דרך JSON
export async function generateGameImages(theme, count) {
    const prompt = `Generate exactly ${count} highly descriptive, distinct image generation prompts in English based on the theme: "${theme}". Return ONLY a valid JSON array of strings.`;
    return await callLLM(prompt, true);
}
/// Server-Side: api/chat/route.js

import { NextResponse } from 'next/server';
const { GoogleGenerativeAI } = require("@google/generative-ai");
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATION_CONFIG_API_KEY);
const db = require('../../../db/models');

let name = 'guest';





// ==========================================
// 1. הרשאות, הגדרת וחלקי הפרומפט (אובייקט מסודר)
// ==========================================
const ROLE_PERMISSIONS = {
  ADMIN: { delete: true, email: true, add: true, edit: true, wishlist: true, info: true },
  EDITOR: { delete: false, email: false, add: true, edit: true, wishlist: true, info: true },
  USER: { delete: false, email: false, add: false, edit: false, wishlist: true, info: true }
};

const PROMPT_PARTS = {
  role: `אתה מנהל המערכת וה-AI של אתר GAME ON.`,

  rules: `
    עליך לנתח את כוונת המשתמש ולהחזיר אך ורק אובייקט JSON תקין במבנה הבא:
    {
      "type": "ACTION" או "CHAT",
      "action_details": {
        "task": "delete/add/edit/info",
        "target": "news/games/email/wishlist/Comment/rating",
        "isMissingData": true/false (סמן true אם המשתמש ביקש פעולה אבל לא אמר על איזה משחק/פריט מדובר),
        "data":"שם המשחק/החדשות (השאר ריק אם המשתמש לא ציין)"
      },
      "content": "התשובה שלך"
    }
  `,
  news: `
- אם המשתמש רוצה למחוק חדשות:
  * במידה וביקש "הכל" או מספר לא מוגדר, הגדר "amount": 10 (כברירת מחדל בטיחותית).
  * במידה וציין מספר, חלץ אותו ל-"amount".
  * הגדר "task": "delete_news_bulk" ו-"target": "latest".

- אם המשתמש רוצה להוסיף ידיעה:
  * הגדר "task": "create_news".
  * חלץ ל-"data" את השדות: "title" ו-"content".
`,

  actionInstructions: `
    * אם המשתמש ביקש פעולה (למחוק, להוסיף, וכו'): 
      - החזר "type": "ACTION".
      - מלא את action_details. אם חסר שם המשחק, הגדר "isMissingData": true.
      - השאר את content ריק (הקוד יטפל בזה).
  `,

  chatInstructions: `
    * אם המשתמש רק שואל או מחפש מידע:
      - החזר "type": "CHAT".
      - בשדה "content", החזר את הדיון של מועצת הגיימרים בדיוק במבנה ה-Markdown הבא:
      
      ### 👴 The Legend
      > [הצעה עוקצנית]
      ---
      ### 🧒 The Sweat
      > [הצעה מלאת הייפ]
      ---
      ### ⚖️ The Game Master
      **הכרעה:** [המנצח]
      **דירוגים:**
      * 👴 שחקן ותיק: [X/10]
      * 🧒 שחקן צעיר: [X/10]
      **סיכום:** _[משפט סיכום]_
  `
};

//הבקשה ופרטי המשתמש, והחזרת התשובה
export async function POST(req) {
  try {
    if (!genAI) {
      console.error("Missing API KEY in Environment Variables!");
      return NextResponse.json({ text: "שגיאת קונפיגורציה: המפתח לא נמצא בשרת." }, { status: 500 });
    }

    //הבקשה ופרטי המשתמש
    const { prompt } = await req.json();
    const userId = req.headers.get('x-user-id');
    const user = await db.User.findByPk(userId);
    name = user?.name || 'guest';
    const userRole = user ? user.role : 'USER'; // נותנים USER כברירת מחדל אם אין

    // שולחים את הפרומפט והרול לפונקציה המרכזית
    const result = await handleInfoCouncil(prompt, userRole);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ text: "אחי, השרת חטף קריסה (Server Error). נסה שוב." }, { status: 500 });
  }
}

// ==========================================
// 2. הפונקציה המרכזית לניהול הבקשה
// ==========================================
async function handleInfoCouncil(prompt, userRole) {
  // 1. שליפת נתונים מהדאטאבייס
  const gamesFromDB = await db.Games.findAll({
    attributes: ['title', 'description'],
    limit: 20,
    include: [{ model: db.Category, attributes: ['name'], as: 'categories' }],
  });

  const newsFromDB = await db.News.findAll({
    attributes: ['title'],
    limit: 10,
    order: [['createdAt', 'DESC']]
  });

  const siteContext = `
    המשחקים הזמינים באתר שלנו: ${gamesFromDB.map(g => g.title).join(", ")}.
    החדשות האחרונות באתר: ${newsFromDB.map(n => n.title).join(", ")}.
  `;


  // הרכבת הפרומפט מהאובייקט שלנו
  const massivePrompt = `
    ${PROMPT_PARTS.role}
    שם המשתמש שמולך: "${name}"
    הודעת המשתמש: "${prompt}"
    נתוני האתר: ${siteContext}
    
    ${PROMPT_PARTS.rules}
    ${PROMPT_PARTS.news}
    ${PROMPT_PARTS.actionInstructions}
    ${PROMPT_PARTS.chatInstructions}
  `;

  // 2. קריאה ל-LLM וקבלת JSON
  const aiResponseJSON = await callLLM(massivePrompt);

  if (!aiResponseJSON) {
    return { text: "שגיאה בפענוח הנתונים מה-AI." };
  }

  // 3. ניתוב (Routing) לפי החלטת ה-AI
  /*
 האובייקט המתקבל
 {
 type: 'CHAT',
 action_details: { task: '', target: '', isMissingData: false, data:'' },
 content: '',
}
 */
  //פעולות במערכת נעשה בעצמנו
  if (aiResponseJSON.type === "ACTION") {
    const actionResultText = await executeAction(aiResponseJSON.action_details, userRole);
    return { text: actionResultText, isAction: true };
  } else {
    // אם זו שיחה, מחזירים את התשובה של המועצה
    return { text: aiResponseJSON.content, isAction: false };
  }
}

// ==========================================
// 3. מבצע הפעולות (Action Executor) 
// ==========================================
async function executeAction(actionDetails, userRole) {
  // בדיקה 1: האם חסרים נתונים? (למשל, ביקש למחוק אבל לא אמר מה)
  if (actionDetails.isMissingData || !actionDetails.target) {
    return `⚙️ מערכת: אחי, כדי שאוכל ${actionDetails.task}, אני צריך שתגיד לי על איזה משחק מדובר.`;
  }

  // בדיקה 2: מיפוי הפעולה ובדיקת הרשאות
  if (!userRole || !ROLE_PERMISSIONS[userRole] || ROLE_PERMISSIONS[userRole][actionDetails.task] === true) {
    return `⛔ מערכת: סורי אחי, הפעולה ${actionDetails.task} חסומה עבורך. אין לך את הרול (Role) המתאים.`;
  }

  // כאן תכנס הלוגיקה של המסד נתונים בהמשך (למשל db.Games.destroy...)
  /*switch (actionDetails.target) {
    case 'news': await executionNews(actionDetails);
  }*/


  // החזרת תשובת הצלחה מהקוד
  return `✅ מערכת: GG! הפעולה ${actionDetails.task} על "${actionDetails.target}" בוצעה בהצלחה במסד הנתונים.`;
}


async function executionNews(actionDetails) {
  switch (actionDetails.task) {
    case 'delete_news_bulk': {
      let amount = parseInt(actionDetails.data?.amount) || 10;
      if (amount > 10) amount = 10;


      const latestNews = await db.News.findAll({
        attributes: ['id', 'title'],
        order: [['createdAt', 'DESC']],
        limit: amount
      });

      if (latestNews.length === 0) return { text: "לא מצאתי ידיעות למחיקה." };

      const ids = latestNews.map(n => n.id);
      const titles = latestNews.map(n => n.title).join("\n- ");

      // מחזירים אובייקט עשיר ללקוח עם הוראות לביצוע
      return {
        text: `מצאתי ${latestNews.length} ידיעות אחרונות:\n${titles}\n\n**האם למחוק אותן?**`,
        requiresConfirmation: true, // דגל שמדליק את הכפתורים בלקוח
        actionType: 'DELETE_BULK_NEWS',
        payload: ids // שולחים את המערך לקומפוננטה
      };
    }


    case 'create': {
      const { title, content } = actionDetails.data || {};
      if (!title || !content) return "⚠️ חסר כותרת או תוכן לידיעה. לא יכול ליצור.";

      // קריאה ל-Service שלך
      const newNews = await NewsService.create({ title, content });
      return `📰 ידיעה חדשה נוצרה בהצלחה: "${newNews.title}" (ID: ${newNews.id})`;
    }
  }


}




// ==========================================
// 4. קריאה ל-Gemini (כולל פירוק ה-JSON)
// ==========================================
async function callLLM(prompt) {
  try {
    // הגדרת המודל חייבת להיות בתוך הפונקציה כדי להבטיח קריאה נכונה של המפתח
    const model = genAI.getGenerativeModel({
      model: "gemini-flash-lite-latest",
      generationConfig: {
        maxOutputTokens: 5000,
        temperature: 0.8,
      }
    });

    //console.log("Sending prompt to Gemini:", model);

    const result = await model.generateContent(prompt);

    const textResult = result?.response?.text ? result.response.text() : null;
    console.log("Raw Gemini Response:", JSON.parse(textResult));

    return JSON.parse(textResult);
  } catch (error) {
    console.error("--- Gemini API Crash Report ---");
    const quotaError = error?.errorDetails?.find(d => d['@type'] === 'type.googleapis.com/google.rpc.RetryInfo');
    const waitTime = quotaError?.retryDelay || 'כמה';


    let userFriendlyMessage = `error status: ${error.status}, quotaError: ${quotaError} ,waitTime: ${waitTime}`;

    if (error.status === 429) {

      // משתמשים ב- \n כדי לסמן ירידת שורה
      userFriendlyMessage = `אחי, חטפתי עומס(Too Many Requests).\n\nהמכסה החינמית נגמרה.\n\nנסה שוב בעוד ${waitTime} שניות.`;
    }

    console.log(userFriendlyMessage);

    return { content: userFriendlyMessage };
  }
}









// פונקציה לניפוי באגים - מציגה את כל המודלים הזמינים ב-Gemini (ניתן לקרוא לה פעם אחת בתחילת השרת)
async function listModels() {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${genAI}`);
    const data = await response.json();
    console.log("Available Models:", JSON.stringify(data, null, 2));
  } catch (e) {
    console.error("Error listing models:", e);
  }
}






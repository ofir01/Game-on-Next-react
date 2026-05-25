// פונקציה ראשית לשליחת הודעות
export async function sendMessage(type, payload) {
    // אנו מצפים ש-payload יכיל את פרטי המשתמש, ואולי גם לינקים או הודעה מותאמת אישית
    const { user, message, link } = payload;
    
    let htmlBody;
    const templateContent = WARNING_TYPES[type];

    // הגנה: בדיקה שהסוג קיים
    if (!templateContent) {
        throw new Error(`Invalid email type: ${type}`);
    }

    // כשאין הודעה בבחירה חופשית אבל נדרשת
    if ((type === "System_Message" || type === "Security_Notice") && !message) {
        throw new Error(`Message is required for type: ${type}`);
    }

    // אם הועברה הודעה מותאמת אישית, נדרוס את הטקסט הקיים
    const finalContent = { ...templateContent };
    if (message) finalContent.body = message;
    if (link) finalContent.actionLink = link; // הוספת הלינק לתוכן

    // עיבוד ה-HTML לפי הסוג
    if (["Welcome", "Confirm_Email", "ResetPassword"].includes(type)) {
        htmlBody = generateActionEmailHtml(finalContent, user.name);
    } else {
        htmlBody = generateAlertEmailHtml(finalContent, user.name);
    }

    const data = {
        from: 'GAME ON <onboarding@resend.dev>', // חשוב להשאיר בחינמי של Resend
        to: user.email,
        subject: finalContent.subject,
        html: htmlBody
    };

    return data;
}

// מערך של האופציות - מעודכן עם סוגים חדשים
const WARNING_TYPES = {
    // --- הודעות מערכת ופעולה ---
    Welcome: {
        subject: "Welcome to the Arena! - GAME ON",
        title: "היי גיימר, הגעת למקום הנכון! 🎮",
        body: "אנחנו מתרגשים שהצטרפת לקהילת GAME ON. כדי שתוכל להתחיל לשחק ולנהל את המשחקים שלך, אנחנו צריכים רק לוודא שזה באמת האימייל שלך.",
        buttonText: "אמת את החשבון שלי",
        themeColor: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
        headerBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    ResetPassword: {
        subject: "Password Reset Request - GAME ON",
        title: "שכחת סיסמה? אל דאגה 🔑",
        body: "קיבלנו בקשה לאיפוס הסיסמה לחשבון שלך ב-GAME ON. אם זה היית אתה, לחץ על הכפתור למטה כדי ליצור סיסמה חדשה. (הלינק תקף ל-30 דקות).",
        buttonText: "אפס סיסמה עכשיו",
        themeColor: "linear-gradient(to right, #fa709a 0%, #fee140 100%)",
        headerBg: "linear-gradient(135deg, #f6d365 0%, #fda085 100%)"
    },
    Confirm_Email: {
        subject: "Confirm Your New Email - GAME ON",
        title: "עדכון כתובת אימייל 📧",
        body: "זיהינו ששינית את כתובת האימייל שלך. כדי לשמור על החשבון שלך מאובטח, אנא אמת את הכתובת החדשה בלחיצה על הכפתור מטה.",
        buttonText: "אמת אימייל חדש",
        themeColor: "linear-gradient(to right, #4facfe 0%, #00f2fe 100%)",
        headerBg: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
    },
    
    // --- הודעות התראה, אבטחה ומנהלים ---
    Security_Notice: {
        subject: "התראת אבטחה - GAME ON",
        title: "פעילות אבטחה בחשבון 🛡️",
        body: "", // יוזן מה-message (הודעה דינמית מ-AuthService)
        severityColor: "#10b981" // ירוק (כדי לסמן שמדובר בהודעת מערכת/אבטחה ולא עונש)
    },
    Warning: {
        subject: "Account Activity Warning - GAME ON",
        title: "אזהרת פעילות",
        body: "שמנו לב שאחד מהתכנים שהעלית לאחרונה מפר את כללי הקהילה שלנו. אנא עזור לנו לשמור על קהילת GAME ON נעימה לכולם.",
        severityColor: "#3b82f6" // כחול
    },
    Content_Removal: {
        subject: "Content Removal Notice - GAME ON",
        title: "הסרת תוכן",
        body: "התוכן שהעלית לאחרונה הוסר מכיוון שהוא מפר את תנאי השימוש שלנו. הפרות נוספות עלולות להוביל להשעיית החשבון.",
        severityColor: "#f59e0b" // כתום
    },
    FINAL_WARNING: {
        subject: "FINAL WARNING - Account Suspension Risk",
        title: "אזהרה אחרונה",
        body: "החשבון שלך סומן עקב הפרות חוזרות ונשנות. זוהי אזהרה אחרונה. כל הפרה נוספת תוביל לחסימה לצמיתות של חשבונך.",
        severityColor: "#ef4444" // אדום
    },
    System_Message: {
        subject: "System Message - GAME ON",
        title: "עדכון מערכת",
        body: "", // יוזן מה-message
        severityColor: "#8b5cf6" // סגול
    }
};

// 1. תבנית למיילים של פעולה (ברוך הבא, איפוס סיסמה, אימות אימייל)
function generateActionEmailHtml(content, userName) {
    const actionButton = content.actionLink ? `
        <div style="margin-top: 35px; margin-bottom: 35px;">
            <a href="${content.actionLink}" 
               style="background: ${content.themeColor}; 
                      color: white; 
                      padding: 15px 35px; 
                      text-decoration: none; 
                      border-radius: 50px; 
                      font-weight: bold; 
                      font-size: 18px;
                      display: inline-block;
                      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);">
                ${content.buttonText}
            </a>
        </div>
    ` : '';

    return `
    <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, sans-serif; background-color: #f0f4f8; padding: 20px; text-align: center;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1);">
            
            <div style="background: ${content.headerBg}; padding: 40px 20px;">
                <h1 style="color: white; font-size: 32px; margin: 0; letter-spacing: 2px;">GAME ON</h1>
            </div>

            <div style="padding: 40px 30px;">
                <h2 style="color: #2d3748; margin-bottom: 20px;">${content.title}</h2>
                <div style="text-align: right;">
                    <p style="color: #2d3748; font-weight: bold; margin-bottom: 10px;">שלום ${userName || 'גיימר'},</p>
                    <p style="color: #4a5568; line-height: 1.6; font-size: 16px;">
                        ${content.body}
                    </p>
                </div>

                ${actionButton}

                <p style="color: #a0aec0; font-size: 12px; margin-top: 20px;">
                    אם לא ביקשת לקבל את המייל הזה, אפשר פשוט להתעלם ממנו.
                </p>
            </div>

            <div style="background-color: #f8fafc; padding: 20px; border-top: 1px solid #edf2f7;">
                <p style="color: #718096; font-size: 14px; margin: 0;">
                    © 2026 GAME ON - Build. Play. Win.
                </p>
            </div>
        </div>
    </div>
    `;
}

// 2. תבנית למיילים של התראות ומערכת (אזהרות, הסרת תוכן, התראות אבטחה) - בסגנון "גיימינג" כהה
function generateAlertEmailHtml(content, userName) {
    return `
    <!DOCTYPE html>
    <html lang="he" dir="rtl">
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: 'Segoe UI', sans-serif; background-color: #020617; color: #ffffff; padding: 20px; text-align: right; }
            .card { max-width: 500px; margin: auto; background: #0f172a; border-top: 5px solid ${content.severityColor}; border-radius: 12px; padding: 30px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.5); }
            .header { color: ${content.severityColor}; font-size: 24px; font-weight: bold; margin-bottom: 15px; text-transform: uppercase; }
            .body { color: #cbd5e1; line-height: 1.6; font-size: 16px; margin-bottom: 20px; }
            .user-greeting { font-weight: bold; margin-bottom: 10px; color: #f8fafc; }
            .footer { margin-top: 30px; font-size: 12px; color: #64748b; border-top: 1px solid #1e293b; padding-top: 15px; text-align: center; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="header">${content.title}</div>
            <div class="body">
                <div class="user-greeting">שלום ${userName || 'משתמש'},</div>
                ${content.body}
            </div>
            <div class="footer">
                GAME ON Security Team <br>
                זוהי הודעה אוטומטית, אנא אל תשיב למייל זה.
            </div>
        </div>
    </body>
    </html>
    `;
}
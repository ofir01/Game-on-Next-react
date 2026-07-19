
-חסר-
להוסיף ראוטר בסרגל כלים
להוסיף תשלום
אפשרות להציג בטבלה לפי סדר תאריך
אפשרות לסכום רק מה שסומן ב- V   ברירת מחדל הכל
לעשות רשימה בצד שאפשר להוסיף אליה ולהוריד בשביל חישוב סופי וגם לשנות אחוזי חישוב- חשוב להוסיף KEY לכל שורה
אפשרות לראות בריחוף העכבר או בלחיצה על המטלה שיפתח ויופיע המשימה או שיקפוץ מלמעלה
בונוס  להוסיף חישוב לפי אחוזים למבחנים או מטלות.

-אופציה-
אפשרות למצב מוחשך
אפשרות למורה לבדוק כל תלמיד או כל מטלה
השלמה אוטומטית לחיפוש




תמונה של משחק הניחושים
חיבור באמצעות גוגל
התחלת משחק שנבנה ב JS
התאמת משחק לצפיה
חיפוש משחקים לפי קטגוריה אצל המשתמש במועדפים






חסר:
זיהוי מצב הרשת
ActivityLog
Resend - מחיקת תגובה של משתמש ואזהרה - כיצד לזהות את המשתמש דרך התגובה שנחסמה
הגדרות חשבון - מחיקת המשתמש מהאתר. - כשהמשתמש נחסם שלא יוכל למחוק את עצמו

לחשוב על זה:
8.2
מדיניות מחיקת משתמש ואנונימיזציה (User Anonymization Policy): על מנת למנוע תופעה של ישויות מידע יתומות במסד הנתונים מחד, ולשמור על שלמות התוכן הקהילתי (תגובות ודירוגים) מאידך, המערכת לא תבצע מחיקה פיזית (Hard Delete) של תגובות או ביקורות בעת מחיקת חשבון משתמש. במקום זאת, פרטיו האישיים והמזהים של המשתמש (אימייל, סיסמה מוצפנת, שם פרופיל) יימחקו לחלוטין מטבלת User, וכל התגובות והדירוגים ההיסטוריים שכתב ישויכו באופן אוטומטי למזהה קבוע של משתמש מערכת אנונימי גלובלי (System Anonymous User).

//===============================================================================================================================
כללים:
ב־React אסור לשנות state ישירות לכן כשיש הרבה נתונים נעשה 
const toggleCategory = (id) => {
        setFormData(prev => ({
            ...prev, //שמור את שאר הנתונים
            selectedCategories: prev.selectedCategories.includes(id) //בדוק אם קיים כבר
                ? prev.selectedCategories.filter(item => item !== id) // הסר אותו
                : [...prev.selectedCategories, id] // הוסף אותו
        }));
    };

    //הוספה לערך setCount(prev => prev + 1); כי state updates הם async

    כל render יוצר variables חדשים  בגלל זה יש useMemo / useCallback
  useEffect ≠ componentDidMount רץ אחרי render לא “לפני”
  Hooks חייבים להיות בראש הקומפוננטה
  render חייב להיות pure
  React לא אוהב mutation אסור items.splice(...) אלא  filter map slice spread
  JSX זה לא HTML עושים className htmlFor onClick ולא class for onclick
  key ב־map קריטי לא טוב key={index} אלא עדיף key={item.id}

  React Query משנה לגמרי data fetching  במקום לעשות fetch loading error cache retry  הוא מאפשר useQuery() אוטומטי 👉 cache 👉 refetch 👉 loading 👉 stale 👉 retry

כלל הזהב הכי חשוב ב־React
React = UI הוא פונקציה של State
  אתה לא “משנה DOM”.
אתה:
משנה state
React מחשב UI חדש
React מעדכן DOM


קומפוננטה = פונקציה שרצה מחדש כל render



useMutation מחזיר אובייקט שבתוכו
mutate   לפעולה רגילה
mutateAsync   לפעולה שצריך לחכות
isPending  לשים אנימציה בזמן הביצוע
isError
isSuccess






import { useQuery } from '@tanstack/react-query';   = מספק חבילה לשגיאה לטעינה ולשליפה
providers  = עוטף
lib/services  = שליפה מהשרת
useDebounce = במקום הספריה של לודש

<ReactQueryDevtools initialIsOpen={false} />  מראה בקשות של שרת בפרוייקט


middleware/proxy = חוסם כניסה לכתובות בדפדפן


שימוש תקין ללא רינדור מיותר:
Hook (כמו useQuery): משמש לשליפת הנתונים מהשרת וניהול הסטטוס שלהם (טעינה/שגיאה) מבלי לשלוח בקשות כפולות.
useMemo: משמש לשמירת תוצאה של חישוב (כמו מיון או סינון) בזיכרון, כדי שלא ירוץ מחדש בכל רינדור של הדף.
React.memo: משמש למניעת רינדור מחדש של קומפוננטה שלמה (כמו הסליידר) אם הנתונים שהיא קיבלה לא השתנו.







פרטי המשתמש:
import { useAuth } from '../../context/AuthContext'; // ה-Context מחזיק את פרטי המשתמש
    const { user, logout } = useAuth(); // שליפת המשתמש ופונקציית ההתנתקות
                            const isAdmin = user?.role === 'ADMIN';
  {/* הודעת שגיאה אם משתמש רגיל מנסה להגיע לפה */}
                    {(!isAdmin && (activeTab === 'users' || activeTab === 'allusers')) && (
                        <div className="text-red-500 font-bold">אין לך הרשאה לצפות בדף זה.</div>
                    )}






הסבר הקשרים:
משחק וסטטיסטיקה (קשר של 1 ל-1)
// בתוך הקובץ של Game
Game.hasOne(models.GamePlayStats, {
  foreignKey: 'gameId', // העמודה בטבלת הסטטיסטיקה
  as: 'stats',          // השם שנראה ב-JSON (game.stats)
  onDelete: 'CASCADE'   // אם נמחק משחק, נמחק גם את הסטטיסטיקה שלו
});

// בתוך הקובץ של GamePlayStats
GamePlayStats.belongsTo(models.Game, {
  foreignKey: 'gameId', // חייב להיות אותו שם!
  as: 'game'
});



ב"רבים לרבים" (Many-to-Many)  צריך טבלה מקשרת
Game.belongsToMany(models.Category, {
  through: 'GameCategories', // שם טבלת המגשר שמחברת ביניהם
  foreignKey: 'gameId',      // המפתח של הטבלה הנוכחית בתוך טבלת המגשר
  as: 'categories'
});


onDelete (מה קורה כשמוחקים?)
מגדיר מה יקרה לנתונים המקושרים אם הנתון הראשי נמחק.
CASCADE: אם המשתמש נמחק -> כל התגובות שלו נמחקות אוטומטית (הכי נפוץ).
SET NULL: אם המשתמש נמחק -> התגובה נשארת, אבל ה-userId הופך לריק.







axios VS Fetch:
// Axios עושה לבד JSON.stringify והופך את התשובה ל-Object
// אם השרת החזיר 400, 401, 500 וכו' - נגיע ישר לשגיאה

ההבדלים בינהם בקצרה:
טיפול בשגיאות
המרת נתונים
אבטחה
תמיכה בדפדפנים

	Fetch 	
חייב לבדוק ידנית if (!res.ok)
חייב לעשות JSON.stringify ו-res.json()
בסיסי
דפדפנים מודרניים בלבד

  Axios
  קופץ אוטומטית ל-catch בכל שגיאה
עושה הכל אוטומטי (נמצא ב-res.data)
הגנה מובנית ממתקפות XSRF
תמיכה רחבה מאוד (כולל ישנים)








הדפסה :
        console.log(JSON.stringify(news, null, 2));
toast.success('נתונים: ' + JSON.stringify(res.data));
import { toast } from 'sonner'
const toastId = toast.loading('מעדכן פרטים...');
toast.success('האימייל נשלח! בדוק את תיבת הדואר הנכנס', { id: toastId });
toast.info('האימייל לא מאומת', {
  action: {
    label: 'שלח שוב',
    onClick: () => resendEmail()
  },
});





רענון לדף:
 setTimeout(() => {
                window.location.reload();//רענון לדף
            }, 2000)


עד שיהיה בקשת API:
       // סימולציה של השהייה (בקשת רשת)
      //await new Promise(resolve => setTimeout(resolve, 1000));



שימוש בשמירה במי עשה שינויים
      import { logActivity } from '../../../../../public/utils/auditService';
        const log_Activity = await logActivity({ req, action: 'UPDATE', targetType: 'News', targetId: id });
        if (log_Activity) { return NextResponse.json({ message: log_Activity }, { status: 400 }); }




כדי שרכיב יצוף מעל גוף הדף
import { createPortal } from 'react-dom';
createPortal(modalContent, document.body)



תחליף ל-useEffect 
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
פעולות שיש בונו
fetchNextPage 
isLoading
useMutation  כשרוצים לשלוח נתונים
useInfiniteQuery  כשהנתונים שחוזרים מחולקים לדפים,
useQuery לקבלת נתונים 





const { id } = await params; // שליפת ה-ID מה-URL (מגיע מ-[id])







useQuery = משמש לשליפת נתונים (Read) מהשרת.
מריץ את הבקשה אוטומטית כשהקומפוננטה עולה.
שומר את המידע בזיכרון המטמון (Cache).

useMutation = משמש לשינוי נתונים (Create, Update, Delete) בשרת.
מופעל ידנית רק כשהמשתמש מבצע פעולה (כמו לחיצה על כפתור).מנהל את סטטוס השליחה (טעינה, הצלחה, שגיאה).

useQueryClient = משמש לניהול ושליטה בזיכרון המטמון (Cache).
מאפשר לנקות או לרענן (Invalidate) מידע ישן.
משמש לעדכון הממשק מייד לאחר ש-useMutation מצליח.








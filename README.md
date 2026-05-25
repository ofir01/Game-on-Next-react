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




 ========== Classroom==================================
חיפוש חופשי
אפשרות להציג רק מה שהושלם או לא הושלם
לינק מעבר למשימה עצמה
אפשרות לחיפוש לפי קטגוריה תפריט ותוצג טבלה שלו

-חסר-
להוסיף ראוטר בסרגל כלים
להוסיף חיפוש מתקדם בתפריט החיפוש, והצגת חלק מהפריטים בקופסא מתוך החיפוש
להוסיף איפוס סיסמה
להוסיף אימות אימייל
להוסיף מועדפים
להוסיף משתנה בשביל המעבר בין הדפים וחזרה לאחור
להוסיף תשלום
להוסיף מחיר, ומחיר מבצע
להוסיף עוד תמונות לכל משחק
שליפת משחק והצגת משחקים דומים באותה קטגוריה
אפשרות להציג בטבלה לפי סדר תאריך
אפשרות לסכום רק מה שסומן ב- V   ברירת מחדל הכל
לעשות רשימה בצד שאפשר להוסיף אליה ולהוריד בשביל חישוב סופי וגם לשנות אחוזי חישוב- חשוב להוסיף KEY לכל שורה
אפשרות לראות בריחוף העכבר או בלחיצה על המטלה שיפתח ויופיע המשימה או שיקפוץ מלמעלה
בונוס  להוסיף חישוב לפי אחוזים למבחנים או מטלות.

-אופציה-
אפשרות למצב מוחשך
אפשרות למורה לבדוק כל תלמיד או כל מטלה
השלמה אוטומטית לחיפוש








לעשות סרטון לדף 404
תמונה של משחק הניחושים
חיבור באמצעות גוגל
חדשות
התחלת משחק שנבנה ב JS
התאמת משחק לצפיה
חיפוש משחקים לפי קטגוריה אצל המשתמש במועדפים
מודל של AI








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

תיקיות שצריך למחוק
הצא'ט בשרת - chat
הנתיב בשרת ששולח הודעת לחברים של המשתמש - friends
העמוד שמראה חברים  dashboard -  FriendsList
שרת שמראה כמה מחוברים באתר
תיקיה pages



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





בעיות שנפתרו:
המשתמש לא צריך להכניס להתחבר מחדש בכל פעם שהוא נכנס לאתר,  כי העוגיה שומרת את המזהה, ובחיבור השרת בודק את הנתונים של המשתמש לפי העוגיה ומחזיר את הפרטים המעודכנים - זה חובה בשביל מצב שהמשתמש הוסר מהאתר או שהשתנה ההרשאות שלו.
נוספה עמודה ששומרת את המייל שהמשתמש רוצה להחליף אליו, כל עוד המייל לא אומת- לא תתבצע ההחלפה, הבעיה- אם המשתמש החליף מייל אבל עדיין לא אימת אותו- או בגלל שהתחרט או בגלל שהמייל אינו שלו, יוצא שאין דרך להיכנס לחשבון.


להוסיף AI שועשה מחקר באתר ומבצע מחיקה כמו איזה משחקים הכי פחות אהבו, איזה ישנים,, דירוג,, לבצע שינויי קטגוריה אוטומטי לפי הרשת

לעשות סוכן AI שמצמצם סימניות לבודדות מכל אחד, ומקטלג לפי קטגוריה


















לעשות אנימציה טעינה יפה יותר,
להוריד חיפוש, לעשות יותר צבע צבעוני, לעשות את הסיפריות שיוצגו בתחילת הפרוייקט,
סוכן שיסדר את כל האתרים בדפדפן, וגם סוכן שיסדר את הטלגרם










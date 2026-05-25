import ttkbootstrap as ttk
from ttkbootstrap.constants import *
from ttkbootstrap import Style
from tkinter import PhotoImage # צריך בשביל האייקון שלא נטען בלי זה

# יבוא סיפרייה של תמונות ודריסת הפעולה CUBIC
from PIL import Image, ImageTk  # כדי להקטין את התמונה
Image.CUBIC = Image.BICUBIC

import time # לזמן
from tkinter import messagebox  # ספריה להודעות
import pygame # למוזיקה
import os # ספריה לקריאת קבצים
import MySQLdb # DB


#  יצירת ממשק משתמש ב-Tkinter עם סטייל
root = ttk.Window(themename="superhero")  # אפשר לשנות ערכת נושא   solar או superhero
# --------------------------------------------------------------משתנה גלובלי
current_question = 0  # מייצג את השאלה הנוכחית
ListAnswers = []  # מייצג את התשובות מהמשתמש
time_left = None  # הזמן שנותר לכל שאלה (בשניות)
reset_time_left = 1 # ערך התחלתי שידרס ע''י המשתנה
timer_id = None  # משתנה לאחסון מזהה הטיימר הפעיל
help_window = None  # משתנה לשמירת חלון העזר
first_name = None
last_password = None
quiz = []  # רשימה לשמירת השאלות
password_visible = False  # משתנה בוליאני שמייצג אם הסיסמה גלויה או מוסתרת
selected_option = ttk.StringVar() # משתנה שמחזיק את ערך הבחירה הסופית בכל שאלה
option_buttons = []  # רשימה שמחזיקה כפתורים, כדי שבכל שאלה יהיה אפשר לעשות מספר אופציות אחרות
frame_Radiobutton = None # המסגרת שתידרס בכל שאלה
next_button = None  # אתחול ראשוני של כפתור הבא
Help_button = None # אתחול ראשוני של כפתור עזרה
frame_button =None # מסגרת לכפתור הבא ועזרה

#MySQLdb-----------------------------------------------------------------------------------------------------

connection = MySQLdb.connect(
    host="localhost",
    user="root",
    password="11211121",
    db="Trivo"   #רק לאחר שנוצרה DATABASE כזו אפשר לרשום שורה זו, אז אפשר להריץ את הקוד שיוצר טבלה בלי שורה זו ואח''כ לחזור לזה
)
cursor = connection.cursor()
cursor.execute("CREATE DATABASE IF NOT EXISTS Trivo") # יוצר DATABASE רק אם לא קיימת כזו

#הגדת העמודות של הטבלה
cursor.execute('''
CREATE TABLE IF NOT EXISTS students (
    id INT AUTO_INCREMENT PRIMARY KEY,  # מספר שיוצר אוטומטית בכל שורה
    first_name TEXT,
    last_name TEXT,
    score VARCHAR(10),
    user_answers TEXT  # כל התשובות של המשתמש
)
''')


# ---------------------------------------------------פונקציה לטעינת השאלות מקובץ טקסט
def load_quiz_from_file():
    global quiz, reset_time_left
    quiz_file_path = os.path.join("assets", "quiz.txt") # נתיב קובץ השאלות

    # בדיקת קיום הקובץ
    if not os.path.exists(quiz_file_path):
        messagebox.showerror("Error", "File 'quiz.txt' not found in assets folder.")
        return

    # with open הקובץ יסגר אוטומטית בסיום קריאתו, גם אם יש שגיאה
    # המצב שבו הקובץ נפתח. "r" מסמן קריאה בלבד (read mode), כלומר לא ניתן לכתוב לקובץ
    # quiz_file_path משתנה שמכיל את הנתיב של הקובץ שנפתח
    with open(quiz_file_path, "r", encoding="utf-8") as file:
        lines = [line.strip() for line in file if line.strip()]  # מסיר שורות ריקות

    if lines[-1].startswith("TIME:"): # טעינת הזמן מסוף הקובץ במילה זמן
        reset_time_left = int(lines[-1].split(":")[1])
        lines = lines[:-1]  # הסרת שורת הזמן מרשימת השאלות

    # לולאה שעוברת על השורות ויוצרת את רשימת השאלות
    i = 0
    while i < len(lines):
        if i + 2 < len(lines):  # ודא שיש לפחות שלוש שורות
            question = lines[i]
            correct_answer = lines[i + 1]
            options = [option.strip() for option in lines[i + 2].split(',')]

            # בדיקה שהאפשרויות לא ריקות
            if options:
                quiz.append({
                    "question": question,
                    "correct_answer": correct_answer,
                    "options": options
                })
            i += 3  # מעבר לשאלה הבאה
        else:
            print("Error: Missing lines for question, answer, or options")
            break


# ---------------------------------------------------------------אתחול רכיב השמע
pygame.mixer.init() # מפעיל את הרכיב

def success():
    pygame.mixer.music.load("assets/success.mp3")
    pygame.mixer.music.play()

def fail():
    pygame.mixer.music.load("assets/fail.mp3")
    pygame.mixer.music.play()

def MusicCorrectAnswer():
    pygame.mixer.music.load("assets/MusicCorrectAnswer.mp3")
    pygame.mixer.music.play()

def wrongAnswer():
    pygame.mixer.music.load("assets/wrongAnswer.mp3")
    pygame.mixer.music.play()

# --------------------------------------------------------------פונקציה להדפסת השאלה והאפשרויות
def display_question():
    global reset_time_left, timer_id,time_left, help_window,frame_Radiobutton,frame_button,Help_button

    # עדכון מספר השאלה הנוכחית מתוך סך השאלות
    question_count_label.config(text=f"Question {current_question + 1} of {len(quiz)}")

    # ביטול טיימר קיים
    if timer_id:
        root.after_cancel(timer_id)

    # סגירת חלון העזר (אם פתוח)
    if help_window:
        close_help_window()

    time_left = reset_time_left  # אתחול הטיימר
    timer_meter.configure(amountused=0, amounttotal=reset_time_left)  # איפוס הטיימר
    update_timer()  # התחלת הטיימר

    question_data = quiz[current_question]  # מוציא מהרשימה מילון במיקום מסוים
    question_label.config(text=question_data["question"])  # ידפיס רק את השאלה

    # אם יש מסגרת קיימת, נהרוס אותה
    if frame_Radiobutton is not None:
        frame_Radiobutton.destroy()
        # הסיבה שצריך להרוס גם את הכפתורים, כדי שהמסגרת תמיד תהיה מעליהם
        frame_button.destroy()

    # מסגרת בשביל הכפתורי רדיו שיהיו בכמה עמודות ב-grid
    frame_Radiobutton = ttk.Frame(root)
    frame_Radiobutton.pack()
    # מסגרת בשביל הכפתורים שיהיו באמצע למטה ואחד ליד השני
    frame_button = ttk.Frame(root)
    frame_button.pack(padx=10, pady=10, expand=True) # xpand=True ממקד במרכז

    Help_button = ttk.Button(frame_button, image=Help_icon, bootstyle="outline-info",command=open_help_window)  # כפתור עזרה עם אייקון
    Help_button.pack(side=ttk.LEFT, padx=10, pady=20)  # חלון עזרה
    #  width גודל הכפתור
    next_button = ttk.Button(frame_button, text="Next", width=10, bootstyle="outline-warning",command=next_question)  # כפתןר הבא
    next_button.pack(side=ttk.LEFT, padx=10, pady=20) # כפתור הבא

    # מחיקת כפתורים ישנים
    #לא צריך בגלל שמוחקים את המסגרת שמחזיקרה את כל הכפתורים
    #for buttons in option_buttons:
    #    buttons.destroy()  # מחיקה מהחלון
    option_buttons.clear()  # מחיקה מהרשימה



    # יצירת כפתורים בהתאם למספר האפשרויות בשאלה הנוכחית
    for index,option in enumerate(question_data["options"]):
        # selected_option כל הכפתורים יחוברו למשתנה
        # option ערך הכפתור ילקח מהרשימה
        radio_btn = ttk.Radiobutton(frame_Radiobutton, text=option, variable=selected_option, value=option, style="Custom.TRadiobutton")
        option_buttons.append(radio_btn)

        # מסדר את כפתורי הרדיו ברשת (grid) בצורה סימטרית
        row = index // 2  # כל שורה תיקח 2 כפתורים
        column = index % 2  # מחלק את הכפתורים לשתי עמודות
        # sticky="nsew" גורם לכפתורים להיות סימטריים
        radio_btn.grid(row=row, column=column, pady=10, padx=50,sticky="nsew")  # רווחים בין הכפתורים

        # הוספת האירועים של "עכבר נכנס" ו-"עכבר יצא"
        # (style="Custom.Hover.TButton")  זה יגרום גם לצביעת רקע אחורי
        radio_btn.bind("<Enter>", lambda event, btn=radio_btn: btn.configure(style="Hover.TRadiobutton"))
        radio_btn.bind("<Leave>", lambda event, btn=radio_btn: btn.configure(style="Custom.TRadiobutton"))
    # בשאלה האחרונה שנה את שם הכפתור לסיום
    if current_question == len(quiz) - 1:
        next_button.config(text="finish", command=next_question)  # הכפתור


# ------------------------------------------------פונקציה לעדכון הטיימר בכל שנייה
def update_timer():
    global time_left, timer_id
    if time_left >= 0:
        if time_left < reset_time_left/4:
            timer_meter.configure(bootstyle="danger") # אדום
        elif time_left < reset_time_left/2:
            timer_meter.configure(bootstyle="warning")  # צהוב
        else:
            timer_meter.configure(bootstyle="success")  # ירוק

        timer_meter.configure(amountused=(time_left))
        timer_meter.configure(subtext="seconds left")
        time_left -= 1 # מוריד 1 מהשעון
        timer_id = root.after(1000, update_timer) # השהייה
    else:
        next_question()


# ------------------------------------------------כפתור קדימה, ושמירת התשובה במערך התשובות
def next_question():
    global current_question, help_window
    selected_answer = selected_option.get() # קבלת התשובה
    ListAnswers.append(selected_answer)  # שמירת הערך ברשימה
    selected_option.set("")  # אתחול המשתנה ששומר את הבחירה

    # בדיקה האם התשובה נכונה והשמעת מנגינה בהתאם
    question_data = quiz[current_question]
    correct_answer = question_data["correct_answer"]

    # מציאת הכפתור שנלחץ
    # אם לא נבחר אף תשובה ימשיך לשאלה הבאה ללא ביצוע לולאה זו
    for button in option_buttons:
        #הבחירה לא נכונה
        if button.cget("value") == selected_answer and selected_answer != correct_answer:
            # במקום להשתמש ב- button.config(bg="red")
            button.configure(style="Red.TRadiobutton")  # תשובה שגויה - רקע אדום
            wrongAnswer()  # השמעת צליל כישלון
        elif button.cget("value") == correct_answer:
            button.configure(style="Green.TRadiobutton")  # תשובה נכונה - רקע ירוק בכל מצב
            if selected_answer == correct_answer: # אם בנוסף גם בחר את התשובה הנכונה
                MusicCorrectAnswer()  # השמעת צליל הצלחה

    root.update_idletasks()  # רענון של החלון להצגת הצבע

    time.sleep(1) # עוצר את הזמן לשניה

    # בודק אם נגמר השאלות
    current_question += 1
    if current_question == len(quiz):
        finish()
    else:
        display_question()


# ----------------------------------------------------------------------סיום
def finish():
    # ביטול הטיימר כאשר השעון האחרון עוד לא נגמר
    if timer_id:
        root.after_cancel(timer_id)

    # השוואת כל התשובות, הצורך לשמור את התשובות ברשימה , בשביל שיהיה אפשר להדפיס את התשובות אם נרצה
    correct = 0  # כמה תשובות נכונות
    for i in range(len(ListAnswers)):
        if quiz[i]["correct_answer"] == ListAnswers[i]:
            correct += 1

    # מנגינה לניצחון או הפסד
    if correct > len(ListAnswers)/2:
        success()
    else:
        fail()

    #next_button.config(state="disabled")  # normal סגירת הכפתור ההפך מ-
    # הודעה על הציון וסגירת המבחן
    percentage = str(int(correct * 100 / len(quiz))) + "%"
    messagebox.showinfo(title='score ' + percentage,
                        message=f"Correct answers: {correct} out of {len(quiz)}", )

    # שמירה במסד הנתונים
    cursor.execute('''
       INSERT INTO students (first_name, last_name, score, user_answers)
       VALUES (%s, %s, %s, %s)
       ''', ( first_name, last_password, percentage, ",".join(ListAnswers)))
    connection.commit()  # שמירת השינויים

    root.destroy()  # סגירת החלון


# ----------------------------------------------------------פונקציה לפתיחת חלון עזר
def open_help_window():
    global help_window
    help_window = ttk.Toplevel()
    help_window.title("חלון עזר")
    help_window.geometry("600x500")

    # קריאה של תוכן הקובץ והצגה בחלון
    help_file_path = os.path.join("assets", "help.txt")
    if os.path.exists(help_file_path):
        with open(help_file_path, "r", encoding="utf-8") as file:
            help_text = file.read()
    else:
        help_text = "קובץ help לא נמצא."

    label = ttk.Label(help_window, text=help_text, wraplength=250, justify=ttk.LEFT)
    label.pack(pady=20)

    help_window.protocol("WM_DELETE_WINDOW", close_help_window)  # קישור לאירוע סגירה
    disable_help_button()


# פונקציה לסגירת חלון העזר והפעלת כפתור ה-Help מחדש
def close_help_window():
    global help_window
    if help_window:
        help_window.destroy()
        help_window = None
        enable_help_button()

# הפעלת כפתור ה-Help מחדש
def enable_help_button():
    Help_button.config(state="normal")

# נטרול כפתור ה-Help כאשר חלון עזר פתוח
def disable_help_button():
    Help_button.config(state="disabled")

# ---------------------------------------------------------------------------התחלה
def start():
    root.title("Welcome to the Trivia!")
    root.geometry("1300x900")

    #הכנסת כל האלמנטים לחלון, הסיבה שהם הוכרזו בחוץ- כדי שיהיו מוכרים בכל הפעולות
    timer_meter.pack(pady=10)    # תווית הזמן
    question_count_label.pack(pady=5)  # מונה כמות השאלות
    question_label.pack(pady=20)    # תווית השאלות


    # טעינת השאלות מקובץ הטקסט
    load_quiz_from_file()
    # הצגת השאלה הראשונה אם יש שאלות
    if quiz:
        display_question()
    else:
        messagebox.showinfo("Error", "No questions available to display.")

#-----------------------------------------------------------------------------הכנסת פרטים
def open_registration_window():
    root.title("Registration")
    root.geometry("1000x1200")  # גודל החלון

    # מסגרת בעבור כל תיבה ותווית שלו, כדי שיהיו אחד מתחת לשני
    frame = ttk.Frame(root)
    frame.pack(pady=60)  # מרווח מלמעלה

    # טעינת תמונה
    try:
        original_image = Image.open("assets/background.png")  # פתיחת התמונה באמצעות PIL
        resized_image = original_image.resize((700, 400))  # הקטנת התמונה
        image = ImageTk.PhotoImage(resized_image)  # המרת התמונה ל-PhotoImage
        ttk.Label(frame, image=image).pack(pady=20)
        frame.image = image  # שמור על התמונה בזיכרון

    except FileNotFoundError:
        ttk.Label(frame, text="No Image", style="Custom.TLabel").pack(pady=20)

    # יצירת שדה לשם משתמש
    ttk.Label(frame, text="Username:",style="Custom.TLabel").pack(anchor=ttk.W, pady=(10, 0))  # מיקום התווית בצד שמאל עם רווח אנכי
    entry_username = ttk.Entry(frame,style="Custom.TEntry", width=40)  # שדה טקסט עם עיצוב בהיר
    entry_username.pack(pady=10)  # הוספת רווח אנכי מתחת לשדה

    # יצירת שדה לסיסמה
    ttk.Label(frame, text="Password:", style="Custom.TLabel").pack(anchor=ttk.W, pady=(10, 0))  # מיקום התווית בצד שמאל עם רווח אנכי
    password_var = ttk.StringVar()  # משתנה ששומר את תוכן שדה הסיסמה
    entry_password = ttk.Entry(frame, textvariable=password_var,style="Custom.TEntry", width=40,show="*")  # שדה סיסמה מוסתר
    entry_password.pack(pady=10)  # הוספת רווח אנכי מתחת לשדה

    # פונקציה להחלפת מצב התצוגה של הסיסמה
    def toggle_password_visibility():
        global password_visible   # משתנה בוליאני שמייצג אם הסיסמה גלויה או מוסתרת
        if password_visible:  # אם הסיסמה גלויה
            entry_password.config(show="*")  # הסתרת התוכן (מצב מוסתר)
            toggle_button.config(text="Show Password")  # שינוי טקסט הכפתור
            password_visible = False  # עדכון המצב
        else:  # אם הסיסמה מוסתרת
            entry_password.config(show="")  # הצגת התוכן (מצב גלוי)
            toggle_button.config(text="Hide Password")  # שינוי טקסט הכפתור
            password_visible = True  # עדכון המצב

    # כפתור להחלפת מצב התצוגה של הסיסמה
    toggle_button = ttk.Button(frame, text="Show Password", bootstyle="outline-secondary",command=toggle_password_visibility)  # כפתור שמחליף את מצב התצוגה של הסיסמה
    toggle_button.pack(pady=10)  # הוספת רווח אנכי מתחת לכפתור

    #פעולה שבודקת שהקלט תקין
    def submit_registration():
        global first_name, last_password
        first_name = entry_username.get() # קבלת הערך שבמשתנה הקלט
        last_password = entry_password.get()

        if first_name and last_password: # אם יש בשניהם ערך
            #לא להרוס או לנקות את החלון כי זה יהרוס את כל המשתנים של החלון הבא, אלא להרוס את המסגרת בלבד
            frame.destroy()
            start()  # מעבר לפעולת ההתחלה
        else:
            messagebox.showwarning("Warning", "Please enter both first and last names.")
    # כפתור התחברות
    ttk.Button(frame, text="Login", bootstyle="outline-warning", width=20,command=submit_registration).pack(pady=20)  # כפתור התחברות עם עיצוב זורח
    # כפתור יציאה
    ttk.Button(frame, text="Exit", bootstyle="outline-danger", width=20, command=root.destroy).pack(pady=10)  # כפתור יציאה עם עיצוב אדום







#-------------------------------------------------------------------------העיצובים והאלמנטים
#שים לב: השימוש ב-font יעשה בצורה הזו ב ttkbootstrap
# וגם לא צריך את bootstyle="warning"
#relief="flat" ללא גבול anchor כיוון
#שים לב: יש חשיבות לשם שבסטייל  Custom = ברירת מחדל  ,TLabel = לתוויות בלבד  , TRadiobutton = לכפתורי רדיו בלבד, כל שינוי יגרום לאי דיוקים
style = Style("superhero")  #  ערכת הנושא של ttkbootstrap היא העיקרית שקובעת את צבע החלון
style.configure("Custom.TLabel", font=("Arial", 12, "bold"),foreground="orange")  # סגנון עבור תוויות
style.configure("Custom.TEntry", font=("Arial", 12, "bold"),foreground="orange")  # סגנון עבור תיבות
style.configure("Green.TRadiobutton",font=("Arial", 14, "bold"), foreground="green")  # רקע ירוק לתשובה נכונה
style.configure("Red.TRadiobutton",font=("Arial", 14, "bold"), foreground="red")  # רקע אדום לתשובה שגויה
style.configure("Hover.TRadiobutton",font=("Arial", 14, "bold"), foreground="purple")  # רקע סגול לכפתור שהעכבר מרחף מעליו
style.configure("Custom.TRadiobutton",font=("Arial", 14, "bold"),foreground="orange")  #  צבע כפתורי רדיו


# טעינת אייקון לחלון
try:
    image_icon = PhotoImage(file='assets/icon.png')  # אייקון
    root.iconphoto(False, image_icon)  # האייקון בכותרת החלון בצד שמאל
    # root.tk.call('wm', 'iconphoto', root._w, image_icon)  גם זה עובד כאשר האייקון לא נטען
except FileNotFoundError:
    pass  # אם אין אייקון, התוכנית לא תקרוס

#הגדרת האלמנטים כאן בחוץ בשביל שיהיו מוכרים בכל הפעולות
timer_meter = ttk.Meter(
    root,
    bootstyle="success",  # סגנון מטר
    subtext="seconds left",  # טקסט משנה בתחתית
    interactive=False,    # לא ניתן לשנות ידנית
    amountused=0,         # כמות התחלתית
    amounttotal=reset_time_left,  # סך הכול
    metersize=120         # גודל
)
question_label = ttk.Label(root, text="",style="Custom.TLabel")# תווית השאלות
question_count_label = ttk.Label(root, text="",style="Custom.TLabel") # תווית למספר השאלות
Help_icon = ttk.PhotoImage(file='assets/Help.png') # האייקון בחלון עזרה



open_registration_window()

root.mainloop() # הרצת חלון שלא יסגר Tkinter

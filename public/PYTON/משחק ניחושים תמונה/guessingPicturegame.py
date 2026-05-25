from tkinter import messagebox
import random
import pygame
from PIL import Image, ImageTk
import MySQLdb # ספריה MYSQL
import ttkbootstrap as ttk
from ttkbootstrap.constants import *
from ttkbootstrap import Style


#משתנים גלובליים
player_name=None # שם השחקן
password = None # סיסמה
password_visible = False # בשביל גילוי הסיסמה

# MySQLdb-----------------------------------------------------------------------------------------------------

connection = MySQLdb.connect(
    host="localhost",
    user="root",
    password="11211121",
    db="Game"   #רק לאחר שנוצרה DATABASE כזו אפשר לרשום שורה זו, אז אפשר להריץ את הקוד שיוצר טבלה בלי שורה זו ואח''כ לחזור לזה
)
cursor = connection.cursor()
cursor.execute("CREATE DATABASE IF NOT EXISTS Game") # יוצר DATABASE רק אם לא קיימת כזו
# יצירת טבלת game_scores למששחק
#""" משמש במקום לעשות גרשיים בכל תחילת וסוף שורה
# לכל משחק יהיה מזהה יחודי, כדי ששחקן יוכל לשחק כמה פעמיים,דרגת קושי כטקסט
create_table_query = """   
    CREATE TABLE IF NOT EXISTS guessingPicturegame (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        player_name VARCHAR(100),
        password VARCHAR(100), 
        CheckMoves INT,  
        Level VARCHAR(50)    
    )
"""
cursor.execute(create_table_query)

#----------------------------------------------------------------------------------------------------------
#אחראי על המנגינה
pygame.mixer.init() # מאתחל את רכיב השמע
def play_song():
    pygame.mixer.music.load("assets/Sakura-Girl-Lazy-Day.mp3")
    pygame.mixer.music.play(loops=-1) # לולאה אינסופית
# פונקציה להשמעת אפקט קול של הפסד
def play_failure_sound():
    pygame.mixer.music.load("assets/failure.mp3")
    pygame.mixer.music.play()
#פונקציה להצלחה
def success():
    pygame.mixer.music.load("assets/success.mp3")
    pygame.mixer.music.play() # לולאה אינסופית
# פונקציה לעצירת השיר
def stop_song():
    pygame.mixer.music.stop()
#

#--------------------------------------------------------------------------------------
#מחלקה עם תמונה/מיקום/ומספר מזהה
class ImageItem:
    def __init__(self, image_path, position,label,id):
        self.image_path = image_path  # הנתיב לתמונה
        self.position = position  # מיקום
        self.label = label # widgets - label לצורך שינוי מיקום
        self.id = id # לצורך התאמת הניחושים
    def update_position(self, new_position): # מעדכן שינוי של מיקום חדש
        self.position = new_position


# ---------------------------------------------------------------------------------------
    #label מחזיר מידע על מיקום של
def get_widget_bbox(widget):
        x = widget.winfo_x()
        y = widget.winfo_y()
        w = widget.winfo_width()
        h = widget.winfo_height()
        return (x, y, x + w, y + h)

    # בדוק האם הם נוגעים אחד בשני
def check_collision(widget1, widget2):
        x1, y1, x2, y2 = get_widget_bbox(widget1)
        x1_static, y1_static, x2_static, y2_static = get_widget_bbox(widget2)
        # Check if bounding boxes overlap
        return x1 < x2_static and x2 > x1_static and y1 < y2_static and y2 > y1_static
#---------------------------------------------------------------------------------------
#עכבר
def on_drag_start(event):
    """שומר את המיקום ההתחלתי של התמונה כאשר מתחילים לגרור."""
    widget = event.widget
    widget.startX = event.x
    widget.startY = event.y
    widget.lift()  # שומר שהתמונה תהיה בגרירה מעל כל שאר האלמנטים

def on_drag_motion(event):
    """מעביר את התמונה לפי תנועת העכבר."""
    widget = event.widget
    x = widget.winfo_x() - widget.startX + event.x
    y = widget.winfo_y() - widget.startY + event.y
    widget.place(x=x, y=y)



def on_drag_release(event):
    """מטפל בסיום הגרירה. מחזיר את התמונה למיקום המקורי אם נוגעת בתמונה אחרת."""
    widget = event.widget
    overlap = False
    overlap_count = 0


    # בדוק אם התמונה חופפת עם תמונה אחרת
    for other_widget in image_items:
        if other_widget.label != widget and is_overlapping(widget, other_widget.label):
            overlap = True
            break

    for guess_item in image_guesswork:
        if check_collision(widget, guess_item.label):
            overlap_count += 1


    if overlap or overlap_count>1:
        # החזר את התמונה למיקום המקורי
        widget.grid(row=widget.original_grid_row, column=widget.original_grid_column)
    else:
        # עדכון המיקום החדש בגריד
        widget.original_grid_row = widget.original_grid_row  # עדכון מיקום חדש - אפשר להוסיף כאן לוגיקה מתאימה אם נדרש
        widget.original_grid_column = widget.original_grid_column
        for img_item in image_items:  # מעדכן את תכונת המיקום במיקום החדש
            if img_item.label == widget: # label רק כך אפשר להשוות - השוואה של סוג
                img_item.update_position((widget.original_grid_row, widget.original_grid_column))
                # מעדכן את המיקום החדש
                break

def is_overlapping(widget1, widget2):
    """בודק אם שני ווידג'טים נוגעים זה בזה."""
    x1, y1 = widget1.winfo_x(), widget1.winfo_y()
    x2, y2 = x1 + widget1.winfo_width(), y1 + widget1.winfo_height()
    x3, y3 = widget2.winfo_x(), widget2.winfo_y()
    x4, y4 = x3 + widget2.winfo_width(), y3 + widget2.winfo_height()

    return not (x2 < x3 or x4 < x1 or y2 < y3 or y4 < y1)

def on_right_click(event):
    """מחזיר את התמונה למקומה המקורי בעת לחיצה על כפתור עכבר ימני."""
    widget = event.widget
    widget.grid(row=widget.original_grid_row, column=widget.original_grid_column)
    for img_item in image_items:  # עדכון תכונת המיקום במיקום המקורי
        if img_item.label == widget: # label רק כך אפשר להשוות - השוואה של סוג
            img_item.update_position((widget.original_grid_row, widget.original_grid_column))  # עדכון מיקום
            break

#------------------------------------------------------------------------------
        #פעולה בקיצור, לקידום כל החלונות שבמיקומים הלא נכונים בשביל כל שורה בנפרד
def same_line(positions,start, end):
    progress = 0
    for i in range(start, end):
        for image_item in image_items:
            if image_guesswork[i].id != image_item.id:  # בדוק את התמונה שלא מתאימה לניחוש אבל למקום
                if check_collision(image_guesswork[i].label, image_item.label):  # בדוק האם הם נוגעים אחד בשני
                    for j in range(start, end):
                        if positions[j] == image_item.id:
                            progress += 1
    return progress

#---------------------------------------------------------------------------------
#במקום לפתוח חלון חדש אפשר לנקות את המקור ולשנותו
def clear_root(root):
    for widget in root.winfo_children():
        widget.destroy()
#----------------------------------------------------------------------------------------------------------
#התחלת משחק שוב פעם
def resetGAME():
    #איפוס חובה לכל הרשימות
    image_items.clear()  # רשימה לתמונות
    image_guesswork.clear()  # רשימה לתמונות ניחוש
    Level_GAME()

# ---------------------------------------------------------------------תפריט שורות
def Menus():
    menubar = ttk.Menu(root)
    root.config(menu=menubar)
    fileMenu = ttk.Menu(menubar, tearoff=0, font=("MV Boli", 15))
    menubar.add_cascade(label="File", menu=fileMenu)
    fileMenu.add_command(label="reset", command=resetGAME, compound='left')
    fileMenu.add_command(label="StopMusic", command=stop_song, compound='left')  # הפסקת מנגינה
    fileMenu.add_command(label="PlaySong", command=play_song, compound='left')  # התחלת מנגינה
    fileMenu.add_separator()  # יוצר קו מפריד
    fileMenu.add_command(label="Exit", command=root.destroy, compound='left')  # אסור לעשות quit זה יגרום ל-EXE לקרוס

#--------------------------------------------------המיקומים לניחוש לפי הדרגה והצבתם
def LocationToGuess(Level,frame,positions,ResizedImage):
    counter = 0
    image_guess = Image.open('assets/QuestionMark.png') # תמונת המיקום
    image_guess = image_guess.resize(ResizedImage)
    # המר את התמונה ל-Tkinter
    image_guess = ImageTk.PhotoImage(image_guess)

    for i in range(Level):  # עד 3 שורות
        for j in range(3):  # תמיד 3 עמודות
            label = ttk.Label(frame, image=image_guess) # מוסיף לחלון
            label.grid(row=i, column=j, padx=20, pady=20)
            image_item = ImageItem(image_guess, (i, j), label, positions[counter])  # הכנסת ההגרלה
            print(str(image_item.position) + " , " + str(image_item.id))
            image_guesswork.append(image_item)  # הוספת האובייקט לרשימה
            counter +=1

# ---------------------------------שומר את התמונות ברשימה כעצמים,והצבת התמונות בחלון
def locationOfImage(frame,ResizedImage):
    for i in range(3):  # 3 שורות
        for j in range(3):  # 3 עמודות
            index = i * 3 + j  # מחזיר מספר מ- 0 עד 8
            image_path = Image.open(f'assets/animal{index+1}.png')  # יצירת שם קובץ עבור כל תמונה
            image_path = image_path.resize(ResizedImage)
            # המר את התמונה ל-Tkinter
            image_path = ImageTk.PhotoImage(image_path)
            label = ttk.Label(frame, image=image_path) # הכנסת המיקומים
            label.grid(row=i, column=j + 5, padx=20, pady=20)

            #מאתחל מיקום ראשוני
            label.original_grid_row = i
            label.original_grid_column = j + 5

            image_item = ImageItem(image_path, None, label, index)  # יצירת אובייקט תמונה חדש ללא מיקום עדיין,המיקום רק לאחר טעינת החלון
            image_items.append(image_item)  # הוספת האובייקט לרשימה

            label.bind("<Button-1>", on_drag_start)  # קליק על התמונה
            label.bind("<B1-Motion>", on_drag_motion) # החזקה בגרירה
            label.bind("<ButtonRelease-1>", on_drag_release) # שחרור
            label.bind("<Button-3>", on_right_click)  # הוספת קליק ימני להחזרה למקום המקורי

    # שמור את המיקום הנכון עבור כל תמונה
    root.update_idletasks() # המתן שהחלון יתעדכן ואז שמור את המיקומים, בלי זה המיקומים 0
    for i in range(len(image_items)): # המיקומים של התמונות
        image_items[i].position = (image_items[i].label.winfo_x(),image_items[i].label.winfo_y())
    for i in range(len(image_guesswork)): # המיקומים של הניחושים
        image_guesswork[i].position = (image_guesswork[i].label.winfo_x(),image_guesswork[i].label.winfo_y())

# --------------------------------------------------------------------חלון התקדמות
def ProgressBar(Level,frame):

    progress_bar = ttk.Progressbar(frame, length=120, orient=ttk.HORIZONTAL,style="Custom.Horizontal.TProgressbar")  # אופקי
    progress_bar.grid(row=Level, column=4, padx=90)
    multiProgressBar = [progress_bar] # רשימה שבתוכה יהיו כל החלונות התקדמות

    # משתנה לסטטוס התקדמות
    status_var = ttk.StringVar()
    status_var.set(f"0/{Level * 3}")
    # תווית סטטוס להצגת ההתקדמות
    status_label = ttk.Label(frame, textvariable=status_var,  style="orange.TLabel")
    status_label.grid(row=Level, column=4,sticky=ttk.E) # sticky=E ככה עושים שני דברים באותה שורה ועמודה

    # הוספת משתני התקדמות בשביל זיהוי תמונה לא במקום
    for rows in range(Level):
        progress_bar = ttk.Progressbar(frame, length=120, orient=ttk.HORIZONTAL,bootstyle="primary-striped")  # אופקי
        progress_bar.grid(row=rows, column=4, padx=10)
        multiProgressBar.append(progress_bar)

    return multiProgressBar,status_var
#חלק 3 -התחלת המשחק-------------------------------------------------------------------------------------
def START_GAME(Level):
    clear_root(root)
    root.title("!!! START !!!")  # כותרת החלון
    root.geometry("2800x1330")  # גודל החלון

    ResizedImage = (380, 350)  # משתנה שמחזיק שני מספרים של גודל  התמונות
    # תפריט שורות
    Menus()

    # -------------------------------------------מסגרת
    # כדי שתמונות לא ידרסו כאשר השורות מצטמצמות
    frame = ttk.Frame(root)
    frame.place(relwidth=1, relheight=1)

    # טעינת תמונת הרקע
    image = Image.open("assets/background.png")
    bg_image = ImageTk.PhotoImage(image.resize((3200, 1300)))

    # יצירת תווית לתמונת הרקע
    background_label = ttk.Label(frame, image=bg_image)
    background_label.place(relwidth=1, relheight=1)  # פריסת התמונה על כל החלון



    # -------------------------------------------הצבת התמונות והניחושים
    #הגרלה על המזהה של הניחושים
    positions = [i for i in range(0,9)] #הכנסת כל המספרים בקצרה
    random.shuffle(positions)  # עירבול המיקומים

    #המיקומים לניחוש לפי הדרגה והצבתם
    LocationToGuess(Level, frame, positions,ResizedImage)

    #שומר את התמונות ברשימה כעצמים,והצבת התמונות בחלון
    ResizedImage =(ResizedImage[0]-20,ResizedImage[1]-20) # הקטנה של התמונות ביותר
    locationOfImage(frame,ResizedImage)
    # יצירת משתנה התקדמות והתקן Progress Bar אופקי
    multiProgressBar,status_var = ProgressBar(Level, frame)

    print(positions)
#----------------------------------------------------------------------------------------------------------
    #מונה נסיונות
    status_Check =ttk.StringVar()
    counter_Check = ttk.Label(frame, textvariable=status_Check, style="orange.TLabel")
    counter_Check.grid(row=Level, column=1,sticky=ttk.E) # הידבק לחלק הימני של התא

    # מגבלת נסיונות
    Check_MAX = 20
    status_Check.set(f"{0}/{Check_MAX}")

    # כפתור "Check" לבדיקת המיקום
    doneButton = ttk.Button(frame, text="Check", command=lambda: Check(multiProgressBar, status_var, positions,status_Check,Check_MAX,Level,doneButton,image_guesswork,image_items))
    doneButton.grid(row=Level, column=1, padx=10)  # הזזת הכפתור שמאלה

    root.mainloop()

#-------------------------------------------------------------------------------------------------בודקת ומעדכנת את כל החלונות, ומכריזה על ניצחון/כישלון

def Check(multiProgressBar,status_var,positions,status_Check,Check_MAX,Level,doneButton,image_guesswork,image_items):
    global player_name,password,Check_Num # חייב להיות גלובלי כדי שיוכל להתקדם
    correct_positionsNum = 0
    # בדוק לכל ניחוש label ומצא את התמונה הזהה ID , ואז בדןק מגע לפי label
    for guess_item in image_guesswork:
        for image_item in image_items:
            if guess_item.id == image_item.id: # בדוק את התמונה שמתאימה לניחוש
                if check_collision(guess_item.label, image_item.label): # בדוק האם הם נוגעים אחד בשני
                        correct_positionsNum +=1

    # עדכון התקדמות החלון והנסיונות
    multiProgressBar[0]['value'] = (correct_positionsNum / (Level * 3)) * 100
    status_var.set(f"{correct_positionsNum}/{Level * 3}")
    Check_Num += 1
    status_Check.set(f"{Check_Num}/{Check_MAX}")
    root.update_idletasks()

    #בודק האם התמונה נמצאת בשורה הנכונה אבל לא במיקום הנכון
    index = 0; # משתנה עזר לבדיקת כל שורה מתחילתה ועד סופה
    for i in range(1,len(multiProgressBar)):
        multiProgressBar[i]['value'] = (same_line(positions,index,index+3) / 3) * 100
        index+=3

    #----------------------------------------------------------------------------------הצגת חלון של זכיה
    if correct_positionsNum == (Level * 3):
        success()
        # שמירה במסד הנתונים
        cursor.execute('''
                       INSERT INTO guessingPicturegame (player_name, password, CheckMoves,Level )
                       VALUES (%s, %s, %s, %s)
                       ''', (player_name, password, Check_Num, Level))
        connection.commit()  # שמירת השינויים

        doneButton.config(state="disabled") #השבת את הכפתור
        messagebox.showinfo("Congratulations", "All images are in the correct positions!")
        Check_Num = 0  # איפוס הנסיונות עובד רק כשהוא כאן

    # הצגת חלון של כישלון
    if Check_Num == Check_MAX:
        play_failure_sound()
        messagebox.showerror("Error", "You failed!")
        doneButton.config(state="disabled") #השבת את הכפתור
        Check_Num = 0  # איפוס הנסיונות עובד רק כשהוא כאן

#חלק 2 - חלון בחירת קושי------------------------------------------------------------------------------------
def Level_GAME():  # חלון רמת קושי
    play_song()
    clear_root(root)
    root.title("!!! Choose your level !!!")  # כותרת החלון
    root.geometry("1600x700")  # גודל החלון

    # יצירת Frame להכיל את ה-Label והכפתורים
    frame = ttk.Frame(root)
    frame.pack(pady=20)  # מרחק של 20 מעל תפריט ההכפתורים

    #טוען את התמונות, מקטין, וממיר Tkinter בשורה אחת
    images = [ImageTk.PhotoImage(Image.open(f'assets/Level{i}.png').resize((300, 300))) for i in range(1, 4)]

    # יצירת כותרת מעל הכפתורים בתוך ה-Frame
    ttk.Label(frame, text="💀 CHOOSE YOUR LEVEL 💀", font=("Dreadful", 30)).pack(pady=10)

    # יוצרת את הכפתורים עם הפונקציה המתאימה כ-command
    # lambda אם רוצים שהפעולה לא תופעל מיד צריך לרשום אותה ללא סוגריים, ובגלל שמעבירים ארגמנט צריך סוגריים ולכן הוספנו
    ttk.Button(frame, command=lambda: START_GAME(1), image=images[0], bootstyle="outline-warning").pack(side=ttk.LEFT, padx=70, pady=20)  # כפתור קל
    ttk.Button(frame, command=lambda: START_GAME(2), image=images[1], bootstyle="outline-warning").pack(side=ttk.LEFT, padx=70, pady=20)  # כפתור בינוני
    ttk.Button(frame, command=lambda: START_GAME(3), image=images[2], bootstyle="outline-warning").pack(side=ttk.LEFT, padx=70, pady=20)  # כפתור קשה

    root.mainloop()  # חובה כדי שהכל יעבוד טוב
#חלק 1 - פרטי השחקן-------------------------------------------------------------------------------------------
def open_registration_window():
    root.title("Registration")
    root.geometry("1000x1200")  # גודל החלון

    # מסגרת בעבור כל תיבה ותווית שלו, כדי שיהיו אחד מתחת לשני
    frame = ttk.Frame(root)
    frame.pack(pady=60)  # מרווח מלמעלה

    # טעינת תמונה
    try:
        original_image = Image.open("assets/registration.png")  # פתיחת התמונה באמצעות PIL
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
        global player_name, password
        player_name = entry_username.get() # קבלת הערך שבמשתנה הקלט
        password = entry_password.get()

        if player_name and password: # אם יש בשניהם ערך
            #לא להרוס או לנקות את החלון כי זה יהרוס את כל המשתנים של החלון הבא, אלא להרוס את המסגרת בלבד
            frame.destroy()
            Level_GAME()  # מעבר לפעולת ההתחלה
        else:
            messagebox.showwarning("Warning", "Please enter both first and last names.")
    # כפתור התחברות
    ttk.Button(frame, text="Login", bootstyle="outline-warning", width=20,command=submit_registration).pack(pady=20)  # כפתור התחברות עם עיצוב זורח
    # כפתור יציאה
    ttk.Button(frame, text="Exit", bootstyle="outline-danger", width=20, command=root.destroy).pack(pady=10)  # כפתור יציאה עם עיצוב אדום


root = ttk.Window(themename="superhero")
root.geometry("1000x1200")  # גודל החלון
root.title("Welcome to the guessing game !")  # כותרת החלון


try:
    image_icon = ttk.PhotoImage(file='assets/icon.png')  # אייקון
    root.iconphoto(False, image_icon)  # האייקון בכותרת החלון בצד שמאל
    # root.tk.call('wm', 'iconphoto', root._w, image_icon)  גם זה עובד כאשר האייקון לא נטען
except FileNotFoundError:
    pass  # אם אין אייקון, התוכנית לא תקרוס

image_items = [] # רשימה לתמונות
image_guesswork = [] # רשימה לתמונות ניחוש
Check_Num = 0 #מספר הנסיונות

#-------------------------------------------------------------------------העיצובים והאלמנטים
style = Style("superhero")  #  ערכת הנושא של ttkbootstrap היא העיקרית שקובעת את צבע החלון
style.configure("orange.TLabel",font=("Arial", 16, "bold"),foreground="orange",background="lightblue") # צבע רקע, ורווח פנימי, גודל גבול, וערך באמצע
style.configure(
    "Custom.Horizontal.TProgressbar",
    background="green",           # צבע ההתקדמות
    thickness=40                  # עובי הפרוגרס
)


open_registration_window()


root.mainloop()  # שומר על החלון המקורי פתוח עד ליציאה או התחלה
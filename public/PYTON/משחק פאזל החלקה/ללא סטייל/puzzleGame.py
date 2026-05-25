from tkinter import *
from PIL import Image, ImageTk
import random
import pygame
import time
import MySQLdb
from tkinter import messagebox


#MySQLdb-----------------------------------------------------------------------------------------------------

connection = MySQLdb.connect(
    host="localhost",
    user="root",
    password="11211121",
    db="gameScore"   #רק לאחר שנוצרה DATABASE כזו אפשר לרשום שורה זו, אז אפשר להריץ את הקוד שיוצר טבלה בלי שורה זו ואח''כ לחזור לזה
)
cursor = connection.cursor()
cursor.execute("CREATE DATABASE IF NOT EXISTS gameScore") # יוצר DATABASE רק אם לא קיימת כזו
# יצירת טבלת game_scores למשחק
#""" משמש במקום לעשות גרשיים בכל תחילת וסוף שורה
# לכל משחק יהיה מזהה יחודי, כדי ששחקן יוכל לשחק כמה פעמיים,דרגת קושי כטקסט
create_table_query = """   
    CREATE TABLE IF NOT EXISTS game_scores (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        password VARCHAR(100) NOT NULL,   
        player_name VARCHAR(100) NOT NULL,
        game_time TIME,           
        difficulty_level VARCHAR(50)    
    )
"""
cursor.execute(create_table_query)

#-----------------------------------------------------------------------------------------------------מנגינה
#אחראי על המנגינה
pygame.mixer.init() # מאתחל את רכיב השמע

#מנגינה ראשית
def play_song():
    pygame.mixer.music.load("assets/Sakura Girl - Jazzy Night.mp3")
    pygame.mixer.music.play(loops=-1) # לולאה אינסופית
# פונקציה להשמעת אפקט קול של לחיצה כשלוחצים על חלק
def play_ui_click():
    ui_click_sound = pygame.mixer.Sound("assets/ui-click.mp3")  # טוען את האפקט
    ui_click_sound.play()  # משמיע את האפקט
# פונקציה להשמעת אפקט קול של הפסד
#פונקציה להצלחה
def success():
    pygame.mixer.music.load("assets/success.mp3")
    pygame.mixer.music.play() # מבטל את המנגינה הראשית
# פונקציה לעצירת השיר
def stop_song():
    pygame.mixer.music.stop()
#----------------------------------------------------------------------------------------------------------

#--------------------------------------------------------------------------------------------משתנים גלובלים
delta_x =None
delta_y =None
empty_position = None

#--------------------------------------------------------------------------#מחלקה עם תמונה/מיקום/ומספר מזהה
class ImageItem:
    def __init__(self, image_path, position,label,id):
        self.image_path = image_path  # הנתיב לתמונה
        self.position = position  # מיקום
        self.label = label # widgets - label לצורך שינוי מיקום
        self.id = id # לצורך התאמת המיקומים
    def update_position(self, new_position): # מעדכן שינוי של מיקום חדש
        self.position = new_position
#-----------------------------------------------------------------------------------------------------#עכבר
# פונקציה להתחלת הגרירה
def on_drag_start(event):
    global delta_x,delta_y
    widget = event.widget  # מעביר את האובייקט שנלחץ לתוך משתנה
    widget.startX = event.x  # מאחסן את הקואורדינטה האופקית של נקודת הלחיצה בתוך הווידג'ט
    widget.startY = event.y  # מאחסן את הקואורדינטה האנכית של נקודת הלחיצה בתוך הווידג'ט

    # שינוי גבול למסגרת צהובה
    widget.config(borderwidth=3, relief="solid", highlightbackground="yellow", highlightthickness=3)
    play_ui_click() #רעש של לחיצה על החלק
    # הסיבה שצריך משתנים גלובליים כאן, כדי שאם המשתמש רק לחץ על חלק מבלי להוזיזו, החלק לא יזוז, בלי זה יהיה שגיאה בשחרור החלק כי אין ערכים
    delta_x=widget.startX
    delta_y = widget.startY

#פונקציה לעדכון הגרירה
def on_drag_motion(event):
    global  delta_x,delta_y
    widget = event.widget
    # חישוב שינוי במיקום העכבר
    delta_x = event.x - widget.startX
    delta_y = event.y - widget.startY

# פוקציה לשחרור העכבר,וגם להורדת המסגרת הצהובה כשהשחקן מפסיק ללחוץ על החלק
def on_drag_release(event,partsPuzzle,Level):
    widget = event.widget
    # מציאת האובייקט ברשימה
    for Part in partsPuzzle:
        if Part.label == widget:
            break

    # הסרת המסגרת הצהובה
    widget.config(borderwidth=0, highlightthickness=0)# מסיר כל מסגרת

    #פונקציה להוזזת החלק שעומד בתנאים
    MoveTo(Part,widget,Level,partsPuzzle)

# פונקציה לביצוע תזוזה על פי מיקומי grid
# יותר טוב מאשר פיקסלים, בגלל שאז לא צריך לבדוק שחלק לא נוגע בחלק אחר או שיש גלישה מחוץ לשורות ועמודות, כאן בודקים רק את החלק הריק לחלק שלחצו עליו
def MoveTo(Part,widget,Level,partsPuzzle):
    global  delta_x, delta_y,empty_position

    # חובה לאפס גם כאן כדי שלא ישאר ערך מהתזוזה הקודמת כאשר המשתמש לא הוזיז נכון או רק לחץ על החלק מבלי להוזיזו
    direction = None

    #  חישוב הפרשי המיקומים
    # בגלל שזה לא פיקסלים אז לאא צריך תנאי של חריגה מהשרורות והעמודות כי אפשר להוזיז רק למקום הריק, וגם לא צריך תנאי למנוע התנגשות
    col = empty_position.position[1] - Part.position[1] # עמודה
    row = empty_position.position[0] - Part.position[0] # שורה
    print(col)
    print(row)
    # בדיקת הכיוון לפי השוואת השינוי במיקום האופקי והאנכי
    # הוספתי תנאי בצדדים שבודק שהחלק נמצא עמודה ליד ולכן התוצאה 1, ובאותה השורה ולכן התוצאה 0, וההיפך בבדיקת למעלה ולמטה
    # המספר 160 משמש כדי שהמשתמש יצטרך לגרור גרירה משמעותית לכיוון הריק בשביל להוזיז

    # delta_x > 0 הסיבה לתנאי זה כדי למנוע מהחלק הנכון לזוז כאשר המשתמש גוררו לכיוון ההפוך
    #abs- משמש להפוך את החישוב לחיובי בכל מצב, ולא צריך לייבא בשבילו את הספרייה
    #abs(row) ==0 ,abs(col) == 0 מונע מחלקים קרובים לזוז באלכסון
    if abs(col) == 1 and abs(delta_x) > abs(delta_y) + 150: # הוזזה בעמודות
        if delta_x > 0 and col == 1 and abs(row) == 0:  # גרירה ימינה לכיוון המקום הריק delta_x > 0
            direction = "Right"
        elif delta_x < 0 and col == -1  and abs(row) == 0 :  # גרירה שמאלה לכיוון המקום הריק delta_x < 0
            direction = "Left"
    elif abs(row) == 1 and abs(delta_y) > abs(delta_x) + 150:  # הוזזה בשורות
        if delta_y > 0 and row == 1 and abs(col) == 0 :  # גרירה למטה לכיוון המקום הריק  delta_y < 0
            direction = "Down"
        elif delta_y < 0 and row == -1 and abs(col) == 0 :  # גרירה למעלה לכיוון המקום הריק  delta_y < 0
            direction = "Up"


    #print(f"Dragging {direction}") # הדפסת הכיוונים
    if direction != None:  # רק חלק שקרוב למקום הריק יזוז
        widget.grid(row=empty_position.position[0], column=empty_position.position[1])
        # עדכון המיקומים החדשים
        temp_position = empty_position.position
        empty_position.update_position(Part.position)
        Part.update_position(temp_position)

    #בכל הנחת חלק, יבדוק אם הכל במקום הנכון , ויקדם את חלון ההתקדמות
    Check(Level,partsPuzzle,empty_position)

def Check(Level,partsPuzzle,empty_position):
    correct_positionsID = 0 # מונה לחלקים במקום הנכון

    for row in range(Level):
        for col in range(Level):
            # קבלת הווידג'ט במיקום (row, col) בגריד
            #השתמשנו ב-grid_slaves() כדי לקבל את כל הווידג'טים שנמצאים בכל שורה ועמודה בגריד.
            widgets = root.grid_slaves(row=row, column=col)
            if widgets:
                widget = widgets[0]  # אמור להיות רק ווידג'ט אחד בכל תא בגריד

                # מציאת ה-part המתאים ברשימה `partsPuzzle` לפי ה-Label
                for part in partsPuzzle:
                    if part.label == widget:
                        # חישוב המיקום הצפוי של החלק לפי ה-ID
                        correct_row = part.id // Level
                        correct_col = part.id % Level

                        # השוואה בין המיקום הנוכחי של החלק למיקום הצפוי לפי ה-ID
                        if (row, col) == (correct_row, correct_col):
                            # שינוי גבול למסגרת ירוקה לגילוי מקום נכון
                            widget.config(borderwidth=0, relief="solid", highlightbackground="green",highlightthickness=3)
                            correct_positionsID += 1

        # בדיקה אם כל החלקים במקומות הנכונים
    if correct_positionsID == len(partsPuzzle):
        # מסיר את הצבע הירוק שמגלה מיקום נכון
        for widgets in partsPuzzle:
            widgets.label.config(borderwidth=0, highlightthickness=0)

        LockAllLabel(partsPuzzle) # פונקציה נעל את כל החלקים מלהיגרר שוב
        success() # פעולה למנגינה להצלחה
        print("All parts are in the correct position! Puzzle completed!")
        # הוספת החלק החסר להשלמת התמונה
        empty_position.label.grid(row=empty_position.position[0], column=empty_position.position[1])
    else:
        print(f"{correct_positionsID} parts are in the correct position.")

# פונקציה נעל את כל החלקים מלהיגרר שוב
def LockAllLabel(partsPuzzle):
    partsPuzzle.append(empty_position)
    for part in partsPuzzle:
        part.label.unbind("<Button-1>")
        part.label.unbind("<B1-Motion>")
        part.label.unbind("<ButtonRelease-1>")


# ----------------------------------------------------------------------פונקציה להצגת התמונה המלאה לפני ערבוב
def show_full_image_before_shuffle(Level,partsPuzzle):
    # הצגת התמונה המלאה לפני ערבוב
    for i in range(Level):  # 3 שורות
        for j in range(Level):  # 3 עמודות
            index = i * Level + j
            label = partsPuzzle[index].label
            label.grid(row=i, column=j)

#------------------------------------------------------------מניפולציות על התמונה-חיתוכה/הקטנתה/ושמירתה ברשימה
def Ima(Level,ResizedImage,image):
    # קבל את גודל התמונה
    width, height = image.size
    # חשב את גודל כל חלק
    part_width = width // Level  # חישוב רוחב כל חלק
    part_height = height // Level  # חישוב גובה כל חלק
    # רשימת עצמים לאחסון החלקים החתוכים
    index = 0  # מונה מזהה
    partsPuzzle = []  # רשימה לעצמים
    # חתוך את התמונה ל-Level * Level חלקים
    for row in range(Level):
        for col in range(Level):
            left = col * part_width
            upper = row * part_height
            right = (col + 1) * part_width
            lower = (row + 1) * part_height
            # חתוך את החלק
            part = image.crop((left, upper, right, lower))
            # מקטין את התמונה
            resized_image = part.resize(ResizedImage)
            # המר את התמונה ל-Tkinter
            tk_image = ImageTk.PhotoImage(resized_image)
            # שמור את התמונה
            label = Label(root, image=tk_image)
            image_item = ImageItem(tk_image, None, label, index)  # הכנסת ההגרלה
            partsPuzzle.append(image_item)  # הוספת האובייקט לרשימה
            index += 1
    return partsPuzzle

#-------------------------------------------------------------------------------------- החלת הוזזה עם העכבר
#label - מכניס אפשרות להוזיז עם העכבר את ה
def BindDrag(partsPuzzle ,Level):
    for part in partsPuzzle:
        part.label.bind("<Button-1>", on_drag_start)  # קליק על התמונה
        part.label.bind("<B1-Motion>", on_drag_motion)  # החזקה בגרירה
        part.label.bind("<ButtonRelease-1>", lambda event: on_drag_release(event, partsPuzzle, Level))  # שחרור
        # lambda event: ככה אפשר לשלוח ארגמנט לפעולת העכבר

#-------------------------------------------------------------------------------------- הצגת התמונה לחלון עם השהייה
def WindowShowLabel(Level,partsPuzzle):
    # שומר את מיקום התמונות ברשימה,והצבת התמונות בחלון
    for i in range(Level):  # 3 שורות
        for j in range(Level):  # 3 עמודות
            index = i * Level + j
            partsPuzzle[index].update_position((i, j)) # רק כאן לעדכן את המיקום אחרת לא יעבוד
            label = partsPuzzle[index].label
            # הצג את התמונה ב-Label
            label.grid(row=i, column=j)

            root.update()  # עידכון המסך להציג את התמונה המלאה
            time.sleep(0.2)  # השהייה של 0.2 שניות כדי להציג את העברת החלקים

#----------------------------------------------------------------------------------------------------------
#במקום לפתוח חלון חדש אפשר לנקות את המקור ולשנותו
def clear_window(root):
    for widget in root.winfo_children():
        widget.destroy()
#----------------------------------------------------------------------------------------------------------
#התחלת משחק שוב פעם
def resetGAME(partsPuzzle):
    #איפוס חובה לכל הרשימות
    partsPuzzle.clear()  # רשימה לתמונות
    clear_window(root)
    PlayerDetails()

# ----------------------------------------------------------------------------------------------תפריט שורות
def Menus():
    menubar = Menu(root)
    root.config(menu=menubar)
    #תפריט ראשון לפעולות
    #tearoff=0 מוריד את הקווקווים בהתחלה
    fileMenu = Menu(menubar, tearoff=0, font=("MV Boli", 15))
    menubar.add_cascade(label="File", menu=fileMenu)

    # command=lambda: גור לפעולה לא לפעול מיד אלא לחכות ללחיצה עליו
    fileMenu.add_command(label="reset", command=lambda: resetGAME(partsPuzzle), compound='left')
    fileMenu.add_command(label="StopMusic", command=stop_song, compound='left')  # הפסקת מנגינה
    fileMenu.add_command(label="PlaySong", command=play_song, compound='left')  # התחלת מנגינה
    fileMenu.add_separator()  # יוצר קו מפריד
    fileMenu.add_command(label="Exit", command=root.destroy, compound='left')  # אסור לעשות quit זה יגרום ל-EXE לקרוס

    #תפריט שני להדרכות
    #בגלל שהתמונה נשמרה במשתנה שנמצא בתוך פעולה, אז היא לא נשמרת בזיכרון החלון, ולכן צריך משתנה גלובלי או משתנה של החלון
    root.image = PhotoImage(file='assets/Tutorials.png')  # שמירה בזיכרון כדי שלא יימחק

    Tutorials =Menu(menubar, tearoff=0, font=("MV Boli", 15))
    menubar.add_cascade(label="Tutorials", menu=Tutorials)
    Tutorials.add_command( command=root.destroy,image= root.image)

    #הפעולות לתפריט הראשון

#חלק 3 - התחלת המשחק-------------------------------------------------------------------------------------
def START_GAME(Level):
    global empty_position,partsPuzzle
    clear_window(root)
    root.title("!!! START !!!")  # כותרת החלון
    root.geometry("900x830")  # גודל החלון
    root.config(background="#5cfcff")  # רקע אחורי תכלת

    # -------------------------------------------המשחק

    # טעינת התמונה
    image = Image.open('assets/image.png')
    # גודל חיתוך כל חלק
    if Level == 3:
        ResizedImage = (250, 250)
    elif Level == 4:
        ResizedImage = (220, 195)
    else:
        ResizedImage = (170, 155)
    # חיתוך התמונה והחזרתה ברשימה
    partsPuzzle = Ima(Level, ResizedImage, image)
    # הצגת התמונה המלאה לפני ערבוב
    show_full_image_before_shuffle(Level, partsPuzzle)
    root.update()  # עידכון המסך להציג את התמונה המלאה
    time.sleep(3)  # השהייה של 3 שניות כדי להציג את התמונה המלאה

    #הגרלה
    NumRandom = random.randint(0, len(partsPuzzle) - 1)  # מגריל מספר בין 0 ל-8 כולל
    # הסיבה שלא מוציאים את החלק שהוגרל כאן, כדי ליצור חור בחלון כל פעם במקום אחר

    #  הלולאה גורמת לערבוב ולהצגה בחלון להתבצע כמה פעמיים בשביל התחושה
    for i in range(2):
        random.shuffle(partsPuzzle)  # עירבול מיקום התמונות
        WindowShowLabel(Level,partsPuzzle)#  הצגת הרשימה בחלון

    # תפריט
    Menus() # יופיע כאן, כי בקוד לפניו פרטי החלון נמחקים, ובגלל התמונה שיש בתפריט יזרוק שגיאה

    #הוצאת החלק החסר שיושלם לבסוף
    empty_position = partsPuzzle.pop(NumRandom)
    empty_position.label.grid_forget() # הריסת החלק החסר מהחלון בלבד, ולא לגמרי
    #empty_position.label.grid_remove() # גם זה תקין ושקול לשורה מעל

    #החלת הוזזת העכבר על החלקים
    BindDrag(partsPuzzle, Level)
    root.mainloop()
#חלק 2 - הגדרת רמות קושי--------------------------------------------------------------------------------
#חלון שני של רמת קושי
def Level_GAME():  # חלון רמת קושי
    clear_window(root)

    root.geometry("900x380")  # גודל החלון
    root.title("Welcome to the puzzle game !")  # כותרת החלון

    # יצירת Frame להכיל את ה-Label והכפתורים
    frame = Frame(root)
    frame.pack(pady=20)  # מרחק של 20 מעל תפריט ההכפתורים

    # יצירת Label עם התמונה כרקע
    label = Label(frame, image=image_icon)
    label.place(x=0, y=0, relwidth=1, relheight=1) # צד התמונה שיוצג
    # טוען את התמונות
    image_Level1 = Image.open('assets/level1.png')
    image_Level2 = Image.open('assets/level2.png')
    image_Level3 = Image.open('assets/level3.png')

    # הקטן
    ResizedImage =(200,200) # משתנה שמחזיק שני מספרים של גודל  התמונות
    image_Level1 = image_Level1.resize(ResizedImage)
    image_Level2 = image_Level2.resize(ResizedImage)
    image_Level3 = image_Level3.resize(ResizedImage)
    # המר את התמונה ל-Tkinter
    image_Level1 = ImageTk.PhotoImage(image_Level1)
    image_Level2 = ImageTk.PhotoImage(image_Level2)
    image_Level3 = ImageTk.PhotoImage(image_Level3)

    # יצירת כותרת מעל הכפתורים בתוך ה-Frame
    transparent_label=Label(frame, text=" CHOOSE YOUR LEVEL ?", font=("Dreadful", 50), fg="#A0522D").pack(pady=10)

    # יוצרת את הכפתורים עם הפונקציה המתאימה כ-command
    Button(frame, command=lambda: START_GAME(3), image=image_Level1, relief=RAISED, bd=10, padx=20, pady=20).pack(
        side=LEFT, padx=(40, 20), pady=20)  # כפתור קל
    Button(frame, command=lambda: START_GAME(4), image=image_Level2, relief=RAISED, bd=10, padx=20, pady=20).pack(
        side=LEFT, padx=(40, 20), pady=20)  # כפתור בינוני
    Button(frame, command=lambda: START_GAME(5), image=image_Level3, relief=RAISED, bd=10, padx=20, pady=20).pack(
        side=LEFT,padx=(40, 20), pady=20)  # כפתור קשה

    root.mainloop()  # חובה כדי שלא יסגר החלון

#חלק 1 - פרטי השחקן-------------------------------------------------------------------------------------------
def submit(entry_name,entry_password):
    player_name = entry_name.get()
    password = entry_password.get()
    # אם לא הכניס שם וסיסמה
    if  player_name and password:
        Level_GAME()
    else:
        messagebox.showerror("Input Error", "Please enter both your name and password.")
        #PlayerDetails()


def toggle_password(entry_password,show_password_var):
    if show_password_var.get():
        entry_password.config(show="")
    else:
        entry_password.config(show="*")

def PlayerDetails():
    play_song() # נגן מנגינה
    clear_window(root)
    root.geometry("400x430")  # גודל החלון
    root.title("Enter your details !")  # כותרת החלון
    root.config(background="#5cfcff")  # רקע אחורי תכלת

    # יצירת מסגרת עבור שני המסגרות
    #מסגרת בעבור כל תיבה ותווית שלו, כדי שיהיו אחד מתחת לשני
    frame = Frame(root)
    frame.pack(pady=60)  # מרווח מלמעלה
    #מסגרת בעבור השם
    frame_name = Frame(frame)
    frame_name.pack(pady=10)  # מרווח מלמעלה
    # תווית ושדה קלט עבור השם
    label_name = Label(frame_name, text="Your name:").pack(side= LEFT,padx=10)  # יישור התווית לשמאל
    entry_name = Entry(frame_name)
    entry_name.pack(side= LEFT,pady=5)  # הוספת מרווח בין התווית לשדה הקלט
    #מסגרת בעבור הסיסמה
    frame_password = Frame(frame)
    frame_password.pack(padx=10)  # מרווח מלמעלה

    # תווית ושדה קלט עבור הסיסמה
    label_password = Label(frame_password, text="Your password:").pack(side= LEFT)  # יישור התווית לשמאל
    entry_password = Entry(frame_password, show="*")
    entry_password.pack(padx=5,side= LEFT)  # הוספת מרווח בין התווית לשדה הקלט
    # שדה הקלט עבור הסיסמה
    show_password_var = BooleanVar()  # משתנה לאחסן את מצב הכפתור
    show_password_checkbox =Checkbutton(frame, text="Show password", variable=show_password_var,command=lambda:toggle_password(entry_password,show_password_var))
    show_password_checkbox.pack(pady=5,)
    # כפתור לשליחת הנתונים
    submit_button = Button(frame, text="Send", command=lambda:submit(entry_name,entry_password))
    submit_button.pack()


    root.mainloop()  # חובה כדי שלא יסגר החלון
#חלק 1 - הגדרת החלון-------------------------------------------------------------------------------------------
# שים לב: חובה שהחלון יהיה מחוץ לכל פעולה, כדי שיהיה אפשר להתחיל משחק שוב פעם
root = Tk()
image_icon = PhotoImage(file='assets/Icon.png')  # אייקון
root.iconphoto(True, image_icon)  # האייקון בכותרת החלון בצד שמאל

PlayerDetails()


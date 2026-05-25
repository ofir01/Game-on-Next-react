#from tkinter import * # ספריה לחלון
from PIL import Image, ImageTk  # ספריה לתמונות
import random # ספריה להגרלה
import pygame # ספריה למוזיקה
import time # ספריה להשהייה
import MySQLdb # ספריה MYSQL
from tkinter import messagebox
import imageio # ספריה לסרטונים
import os # ספריה לקריאת קבצים

import ttkbootstrap as ttk
from ttkbootstrap.constants import *
from ttkbootstrap import Style

#חלק 0 - הגדרת החלון-------------------------------------------------------------------------------------------
# שים לב: חובה שהחלון יהיה מחוץ לכל פעולה, כדי שיהיה אפשר להתחיל משחק שוב פעם
#  יצירת ממשק משתמש ב-Tkinter עם סטייל
root = ttk.Window(themename="superhero")  # אפשר לשנות ערכת נושא   solar או superhero
# טעינת אייקון לחלון
try:
    image_icon = ttk.PhotoImage(file='assets/background.png')  # אייקון
    root.iconphoto(False, image_icon)  # האייקון בכותרת החלון בצד שמאל
    # root.tk.call('wm', 'iconphoto', root._w, image_icon)  גם זה עובד כאשר האייקון לא נטען
except FileNotFoundError:
    pass  # אם אין אייקון, התוכנית לא תקרוס

#MySQLdb-----------------------------------------------------------------------------------------------------

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
    CREATE TABLE IF NOT EXISTS puzzleSliding (
        id INT AUTO_INCREMENT PRIMARY KEY, 
        player_name VARCHAR(100),
        password VARCHAR(100), 
        counterMoves INT,  
        game_time TIME,           
        Level VARCHAR(50)    
    )
"""
cursor.execute(create_table_query)

#-----------------------------------------------------------------------------------------------------מנגינה
#אחראי על המנגינה
pygame.mixer.init() # מאתחל את רכיב השמע

#מנגינה ראשית
def play_song():
    pygame.mixer.music.load("assets/Sakura Girl - Jazzy Night.mp3") # הסיבה שצריך לטעון זה כדי שיהיה אפשר לעצור
    pygame.mixer.music.play(loops=-1) # לולאה אינסופית

# פונקציה להשמעת אפקט קול של לחיצה כשלוחצים על חלק
def play_ui_click():
    pygame.mixer.Sound("assets/ui-click.mp3").play()  # טוען את האפקט

# פונקציה להשמעת אפקט קול של הפסד

#פונקציה להצלחה
def success():
    pygame.mixer.music.load("assets/success.mp3")
    pygame.mixer.music.play() # מבטל את המנגינה הראשית
# פונקציה לעצירת השיר
def stop_song():
    pygame.mixer.music.stop()

def imagePush():
    pygame.mixer.Sound("assets/image-push.mp3").play() # טוען את האפקט
#--------------------------------------------------------------------------------------------משתנים גלובלים
delta_x =None
delta_y =None
empty_position = None # מחזיק את החלק החסר
#Check_MAX = 100 # מגבלה לנסיונות
counterMoves = 0 #מונה נסיונות הוזזה
status_Check = None  # מונה מקומות נכונים
player_name=None
password = None
Level=None # דרגת קושי
partsPuzzle=[] #רשימה לחלקי התמונה או המספרים
elapsed_time  =None # מונה זמן מתחילת המשחק
is_timer_running = True # דגל להפעלת וכיבוי הזמן
TutorialWindow = None  # משתנה לשמירת חלון העזר

#--------------------------------------------------------------------------#מחלקה עם תמונה/מיקום/ומספר מזהה
class ImageItem:
    def __init__(self, image_path, position,label,id):
        self.image_path = image_path  # הנתיב לתמונה
        self.position = position  # מיקום
        self.label = label # widgets - label לצורך שינוי מיקום
        self.id = id # לצורך התאמת המיקומים
    def update_position(self, new_position): # מעדכן שינוי של מיקום חדש
        self.position = new_position

#-----------------------------------------------------------מחלקה להפעלת סרטוני הדרכה עם תמונה כתצוגה מקדימה
class VideoPlayer:
    def __init__(self, root, video_path, label_text, row, column):
        self.root = root
        self.video_path = video_path
        self.video_reader = None

        # תווית עבור שם הסרטון
        self.label = ttk.Label(root, text=label_text)
        self.label.grid(row=row, column=column, pady=(10, 0),padx=(5, 10))  # רווח מעל התווית

        self.video_label = ttk.Label(root)
        self.video_label.grid(row=row + 1, column=column, pady=(5, 10),padx=(5, 10))  # רווח מעל ומתחת לתווית הווידאו

        # הצגת התמונה הראשונה של הסרטון
        self.frame_image = None
        self.show_initial_frame()

        self.is_playing = False
        self.current_frame = 0

        # לחצן התמונה להפעלת הסרטון
        self.video_label.bind("<Button-1>", self.toggle_video)

    def show_initial_frame(self):
        # הצגת התמונה הראשונה של הסרטון
        self.video_reader = imageio.get_reader(self.video_path)
        initial_frame = self.video_reader.get_data(0)
        image = Image.fromarray(initial_frame)
        image = image.resize((270, 200))  # הקטנת התמונה לגודל הרצוי
        self.frame_image = ImageTk.PhotoImage(image)

        self.video_label.config(image=self.frame_image)
        self.video_label.image = self.frame_image

    def toggle_video(self, event):
        if self.is_playing:
            self.stop_video()
        else:
            self.play_video()

    def play_video(self):
        if self.video_reader is None:
            self.video_reader = imageio.get_reader(self.video_path)
            self.current_frame = 0
        self.is_playing = True
        self.update_frame()

    def stop_video(self):
        self.is_playing = False
        if self.video_reader is not None:
            self.video_reader.close()
            self.video_reader = None

    def update_frame(self):
        if self.is_playing:
            try:
                frame = self.video_reader.get_data(self.current_frame)
                image = Image.fromarray(frame)
                image = image.resize((270, 200))  # הקטנת התמונה לגודל הרצוי
                photo = ImageTk.PhotoImage(image)

                self.video_label.config(image=photo)
                self.video_label.image = photo
                self.current_frame += 1

                # האטה של קצב הצגת המסגרת
                self.video_label.after(10, self.update_frame)
            except IndexError:
                # אם הגענו לסוף הווידאו
                self.stop_video()
#-----------------------------------------------------------------------------------------------------#עכבר
# פונקציה להתחלת הגרירה
def on_drag_start(event):
    global delta_x,delta_y
    widget = event.widget  # מעביר את האובייקט שנלחץ לתוך משתנה
    widget.startX = event.x  # מאחסן את הקואורדינטה האופקית של נקודת הלחיצה בתוך הווידג'ט
    widget.startY = event.y  # מאחסן את הקואורדינטה האנכית של נקודת הלחיצה בתוך הווידג'ט

    play_ui_click()  # רעש של לחיצה על החלק

    #widget.config(borderwidth=3, relief="solid", highlightbackground="yellow", highlightthickness=3) # שינוי גבול למסגרת צהובה

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

# פוקציה לשחרור העכבר
def on_drag_release(event):
    widget = event.widget
    # מציאת האובייקט ברשימה
    for Part in partsPuzzle:
        if Part.label == widget:
            break

    #widget.config(borderwidth=0, highlightthickness=0)# הסרת המסגרת הצהובה ע''י הסרת כל מסגרת

    #פונקציה להוזזת החלק שעומד בתנאים
    MoveTo(Part,widget)


# פונקציה להזזה חלקה
def smooth_move(widget, target_row, target_col):
    # המרה של מיקום ה-grid לפיקסלים
    current_x = widget.winfo_x()
    current_y = widget.winfo_y()

    target_x = target_col * widget.winfo_width()
    target_y = target_row * widget.winfo_height()

    # חישוב המרחק לתזוזה בכל צעד
    steps = 40  # מספר צעדים עד להגעה ליעד
    dx = (target_x - current_x) / steps
    dy = (target_y - current_y) / steps
    #פעולה רקורסיבית
    def step_animation(step=0):
        #nonlocal זה כמו גלובלי, רק שזה לא נגיש מחוץ לפונקציה החיצונית, אלא רק מתוך פונקציות פנימיות שלה
        nonlocal current_x, current_y

        if step < steps:
            current_x += dx
            current_y += dy
            widget.place(x=current_x, y=current_y)
            # המספר 10 זה מהירות מילישניות
            widget.after(10, step_animation, step + 1)
        else:
            #  חובה- החלק הגיע ליעד, מחזירים אותו ל-grid בלי זה השורות ידרסו את השורות שלפניהם
            widget.place_forget() #מחיקת אלמנט של
            widget.grid(row=target_row, column=target_col,sticky="nsew")

            # בכל הנחת חלק, יבדוק אם הכל במקום הנכון , ויקדם את חלון ההתקדמות
            Check() # חייבת להיות כאן כדי שבכל סיום הוזזה יהיה בדיקה מידית

    # התחלת האנימציה
    step_animation()

# פונקציה לביצוע תזוזה על פי מיקומי grid
# יותר טוב מאשר פיקסלים, בגלל שאז לא צריך לבדוק שחלק לא נוגע בחלק אחר או שיש גלישה מחוץ לשורות ועמודות, כאן בודקים רק את החלק הריק לחלק שלחצו עליו
def MoveTo(Part,widget):
    global  delta_x, delta_y,empty_position,counterMoves,status_Check

    # חובה לאפס גם כאן כדי שלא ישאר ערך מהתזוזה הקודמת כאשר המשתמש לא הוזיז נכון או רק לחץ על החלק מבלי להוזיזו
    direction = None

    #  חישוב הפרשי המיקומים
    # בגלל שזה לא פיקסלים אז לאא צריך תנאי של חריגה מהשרורות והעמודות כי אפשר להוזיז רק למקום הריק, וגם לא צריך תנאי למנוע התנגשות
    col = empty_position.position[1] - Part.position[1] # עמודה
    row = empty_position.position[0] - Part.position[0] # שורה

    # בדיקת הכיוון לפי השוואת השינוי במיקום האופקי והאנכי
    # הוספתי תנאי בצדדים שבודק שהחלק נמצא עמודה ליד ולכן התוצאה 1, ובאותה השורה ולכן התוצאה 0, וההיפך בבדיקת למעלה ולמטה
    # המספר 40 משמש כדי שהמשתמש יצטרך לגרור גרירה משמעותית לכיוון הריק בשביל להוזיז

    # delta_x > 0 הסיבה לתנאי זה כדי למנוע מהחלק הנכון לזוז כאשר המשתמש גוררו לכיוון ההפוך
    #abs- משמש להפוך את החישוב לחיובי בכל מצב, ולא צריך לייבא בשבילו את הספרייה
    #abs(row) ==0 ,abs(col) == 0 מונע מחלקים קרובים לזוז באלכסון
    if abs(col) == 1 and abs(delta_x) > abs(delta_y) + 40: # הוזזה בעמודות
        if delta_x > 0 and col == 1 and abs(row) == 0:  # גרירה ימינה לכיוון המקום הריק delta_x > 0
            direction = "Right"
        elif delta_x < 0 and col == -1  and abs(row) == 0 :  # גרירה שמאלה לכיוון המקום הריק delta_x < 0
            direction = "Left"
    elif abs(row) == 1 and abs(delta_y) > abs(delta_x) + 40:  # הוזזה בשורות
        if delta_y > 0 and row == 1 and abs(col) == 0 :  # גרירה למטה לכיוון המקום הריק  delta_y < 0
            direction = "Down"
        elif delta_y < 0 and row == -1 and abs(col) == 0 :  # גרירה למעלה לכיוון המקום הריק  delta_y < 0
            direction = "Up"


    #print(f"Dragging {direction}") # הדפסת הכיוונים
    if direction != None:  # רק חלק שקרוב למקום הריק יזוז
        imagePush()
        smooth_move(widget, empty_position.position[0], empty_position.position[1])

        #widget.grid(row=empty_position.position[0], column=empty_position.position[1]) #מעביר את החלק בקפיצה אחת
        # עדכון המיקומים החדשים
        temp_position = empty_position.position
        empty_position.update_position(Part.position)
        Part.update_position(temp_position)

        counterMoves += 1 # קדם את מונה הנסיונות
        status_Check.set(f"Mvs: {counterMoves}")





# פעולה שבודקת בכל שורה שהכל במקום הנכון ומסיימת את המשחק
def Check():
    global empty_position,partsPuzzle,Level,player_name,password,counterMoves,is_timer_running
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
                            #widget.config(borderwidth=0, relief="solid", highlightbackground="green",highlightthickness=1)# שינוי גבול למסגרת ירוקה לגילוי מקום נכון
                            correct_positionsID += 1

        # בדיקה אם כל החלקים במקומות הנכונים
    if correct_positionsID == len(partsPuzzle):
        # מסיר את הצבע הירוק שמגלה מיקום נכון
        #for widgets in partsPuzzle:
       #     widgets.label.config(borderwidth=0, highlightthickness=0)

        LockAllLabel(partsPuzzle) # פונקציה נעל את כל החלקים מלהיגרר שוב
        success() # פעולה למנגינה להצלחה
        print("All parts are in the correct position! Puzzle completed!")
        # הוספת החלק החסר להשלמת התמונה
        empty_position.label.grid(row=empty_position.position[0], column=empty_position.position[1],sticky="nsew")
        is_timer_running = False # עצירת הזמן
        # המרת הזמן לפורמט HH:MM:SS
        hours = int(elapsed_time // 3600)
        minutes = int((elapsed_time % 3600) // 60)
        seconds = int(elapsed_time % 60)
        formatted_time = f"{hours:02}:{minutes:02}:{seconds:02}"  # פורמט מתאים
        # שמירה במסד הנתונים
        cursor.execute('''
               INSERT INTO puzzleSliding (player_name, password, counterMoves, game_time,Level )
               VALUES (%s, %s, %s, %s, %s)
               ''', (player_name, password, counterMoves, formatted_time,Level))

        connection.commit()  # שמירת השינויים
    else:
        print(f"{correct_positionsID} parts are in the correct position.")

# פונקציה נעל את כל החלקים מלהיגרר שוב
def LockAllLabel(partsPuzzle):
    partsPuzzle.append(empty_position)
    for part in partsPuzzle:
        part.label.unbind("<Button-1>")
        part.label.unbind("<B1-Motion>")
        part.label.unbind("<ButtonRelease-1>")


#------------------------------------------------------------מניפולציות על התמונה-חיתוכה/הקטנתה/ושמירתה ברשימה
def Ima(Level,image):
    #resized_image = image.resize((1000, 1000))  # מקטין את התמנה לגודל החלון
    # חישוב גודל החלקים הדינמי
    width, height = image.size # קבל את גודל התמונה
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

            part = image.crop((left, upper, right, lower)) # חתוך את החלק
            tk_image = ImageTk.PhotoImage(part) # המר את התמונה ל-Tkinter
            #אם נוסיף padding=70 כאן זה יגרום לחלון להיראות כמו לוח איקס עיגול
            label = ttk.Label(root, image=tk_image) # שמור את התמונה
            image_item = ImageItem(tk_image, None, label, index)  # הכנסת ההגרלה
            partsPuzzle.append(image_item)  # הוספת האובייקט לרשימה
            index += 1
    return partsPuzzle

#------------------------------------------------------------------------------------יצירת ריבועים------
def MakeSquares(Level):
    partsPuzzle = []  # רשימה לעצמים
    number = 0
    #לא צריך לחשב גודל בגלל הגדרת השורות והעמודות שנעשתה בפעולה הקודמת
    padding_size = max(10, 110 - (Level * 10)) # חישוב גודל הריבועים
    print(padding_size)
    #frame.pack(padx=100, pady=100, fill="both", expand=True) # מסגרת לריבועים
    #label_size = 50  # גודל כל תווית
    #frame = ttk.Frame(root)
    #frame.pack()  # מונע מה-frame להשתנות בגודלו לפי תוכן
    for row in range(Level):
        for col in range(Level):
            # יצירת תווית עם מספר בתוך הריבוע
            #width=2 חשוב ביותר - הוא גורם שלא משנה כמה ספרות יהיו בתוך התווית היא תישאר בגודל של שני תווים
            label = ttk.Label(root, text=str(number+1), style="orange.TLabel",padding=padding_size, width=2) # יישור מרכזי
            image_item = ImageItem(None, None, label, number)  # הכנסת ההגרלה
            partsPuzzle.append(image_item)  # הוספת האובייקט לרשימה
            number += 1
    return partsPuzzle

#-------------------------------------------------------------------------------------- החלת הוזזה עם העכבר
#label - מכניס אפשרות להוזיז עם העכבר את ה
def BindDrag(partsPuzzle ,Level):
    for part in partsPuzzle:
        part.label.bind("<Button-1>", on_drag_start)  # קליק על התמונה
        part.label.bind("<B1-Motion>", on_drag_motion)  # החזקה בגרירה
        part.label.bind("<ButtonRelease-1>", on_drag_release)  # שחרור
        # lambda event: ככה אפשר לשלוח ארגמנט לפעולת העכבר


#-------------------------------------------------------------------------------------- הצגת התמונה לחלון עם השהייה
def WindowShowLabel(Level,partsPuzzle):
    # שומר את מיקום התמונות ברשימה,והצבת התמונות בחלון
    for i in range(Level):  # 3 שורות
        for j in range(Level):  # 3 עמודות
            index = i * Level + j
            partsPuzzle[index].update_position((i, j)) # רק כאן לעדכן את המיקום אחרת לא יעבוד
            label = partsPuzzle[index].label
            #label.place(x=260*i,y=330*j) # לא מדויק
            label.grid(row=i, column=j,sticky="nsew") #חובה sticky="nsew" כדי שלא יהיה רווחים
#----------------------------------------------------------------------------------------------------------
#במקום לפתוח חלון חדש אפשר לנקות את המקור ולשנותו
def clear_window(root):
    for widget in root.winfo_children():
        if not isinstance(widget, ttk.Menu): # הורס הכל חוץ מהתפריט למעלה
            widget.destroy()
#----------------------------------------------------------------------------------------------------------
#התחלת משחק שוב פעם
def resetGAME():
    global counterMoves,partsPuzzle,start_time
    #איפוס חובה לכל הרשימות
    partsPuzzle.clear()  # רשימה לתמונות
    clear_window(root)
    counterMoves = 0
    ChoosePictureOrNumbers()

#--------------------------------------------------------------------טוען קבצים מהתיקיה
def load_images_from_directory(directory, base_name, extension): # assets פעולה שטוענת תמונות מתיקיית
    images = []
    i = 1
    while True:
        file_name = f"{base_name}{i}.{extension}"
        file_path = os.path.join(directory, file_name) # שם הקובץ, והתיקייה
        if os.path.exists(file_path): # בודק אם קיים קובץ בעל שם כזה
            images.append(file_path)
            i += 1
        else:
            break
    return images
# ----------------------------------------------------------------------------------------------תפריט שורות
def Menus():
    menubar = ttk.Menu(root)
    root.config(menu=menubar)
    #תפריט ראשון לפעולות
    #tearoff=0 מוריד את הקווקווים בהתחלה
    fileMenu = ttk.Menu(menubar, tearoff=0, font=("MV Boli", 15))
    menubar.add_cascade(label="File", menu=fileMenu)

    fileMenu.add_command(label="reset", command= resetGAME, compound='left')
    fileMenu.add_command(label="StopMusic", command=stop_song, compound='left')  # הפסקת מנגינה
    fileMenu.add_command(label="PlaySong", command=play_song, compound='left')  # התחלת מנגינה
    fileMenu.add_separator()  # יוצר קו מפריד
    fileMenu.add_command(label="Exit", command=root.destroy, compound='left')  # אסור לעשות quit זה יגרום ל-EXE לקרוס

    #תפריט שני להדרכות
    #בגלל שהתמונה נשמרה במשתנה שנמצא בתוך פעולה, אז היא לא נשמרת בזיכרון החלון, ולכן צריך משתנה גלובלי או משתנה של החלון
    Image_Tutorials =Image.open('assets/Tutorials.png').resize((100,100))
    root.image = ImageTk.PhotoImage(Image_Tutorials) # שמירה בזיכרון כדי שלא יימחק

    Tutorials =ttk.Menu(menubar, tearoff=0, font=("MV Boli", 15))
    menubar.add_cascade(label="Tutorials", menu=Tutorials)
    Tutorials.add_command( command=TrainingVideos,image= root.image)
#-------------------------------------------------------------------------------------------
    #פעולת סרטוני הדרכה
def TrainingVideos():
    global TutorialWindow
    if TutorialWindow is None or not TutorialWindow.winfo_exists():  # אם חלון העזרה לא פתוח
        TutorialWindow = ttk.Toplevel(root)  # Toplevel יוצר חלון משני
        TutorialWindow.title("עזרה")
        # יצרו מופעים של VideoPlayer עם נתיב הסרטון ושם
        video_player_data = [
            ("assets/a.mp4", "סרטון 1"),
            ("assets/a.mp4", "סרטון 2"),
            ("assets/a.mp4", "סרטון 3"),

        ]
        # קובע את המיקום וגודל החלון לפי כמות הסרטונים
        # enumerate מביא ערכים ומיקום של פריט ברשימה
        NumberOfVideosPerRow = 5
        for index, (video_path, label_text) in enumerate(video_player_data):
            row = index // NumberOfVideosPerRow  # שורה
            column = index % NumberOfVideosPerRow  # עמודה
            VideoPlayer(TutorialWindow, video_path, label_text, row * 2,column)  # הוסף *2 לשורה עבור המרחק בין תוויות הווידאו
    else:
        TutorialWindow.lift()  # מביא את החלון קדימה במקרה שהוא מוסתר




#חלק 4 - התחלת המשחק-------------------------------------------------------------------------------------
def START_GAME(ChooseLevel,Choose,difficulty):
    global empty_position,partsPuzzle,status_Check,Level,start_time,is_timer_running
    clear_window(root)
    Level = ChooseLevel # שמירת הדרגה המתקבלת מהמשתמש במשתנה גלובלי
    root.title("!!! START !!!")  # כותרת החלון
    root.geometry("2100x1950")  # גודל החלון

    #הגדרת גודל השורות והעמודת בצורה אחידה, וככה הא מתאים את החלון לכל גודל שיתקבל
    #for i in range(Level):
        #root.grid_columnconfigure(i, weight=0, uniform="column")
        #root.grid_rowconfigure(i, weight=0, uniform="row")

    #רק אם בחר תמונה יטען התמונות ויגריל אחת, יחתוך כל חלק, אחרת יצור ריבועים----------------------
    if Choose == "ChooseImage" :
        partsImage = load_images_from_directory("assets", "image","png")    #assets קריאה לפונקציה לטעינת כל התמונות בתיקיית
        random.shuffle(partsImage)  # עירבול מיקום התמונות
        image = Image.open(partsImage[0])# טעינת התמונה
        partsPuzzle = Ima(Level, image) # פעולה לחיתוך התמונה והחזרתה ברשימה

    else:
        partsPuzzle = MakeSquares(Level) # אם לא בחר תמונה אלא  מספרים


    #הצגת התמונה לפני ואחרי הערבוב---------------------------------------------
    # הצגת התמונה המלאה לפני ערבוב
    WindowShowLabel(Level, partsPuzzle)
    root.update()  # עידכון המסך להציג את התמונה המלאה
    time.sleep(3)  # השהייה של 3 שניות כדי להציג את התמונה המלאה

    # הסיבה שלא מוציאים את החלק שהוגרל כאן, כדי ליצור חור בחלון כל פעם במקום אחר

    #  הלולאה גורמת לערבוב ולהצגה בחלון להתבצע כמה פעמיים בשביל התחושה
    for i in range(20):
        random.shuffle(partsPuzzle)  # עירבול מיקום התמונות
        WindowShowLabel(Level,partsPuzzle)#  הצגת הרשימה בחלון
        root.update()  # עידכון המסך להציג את התמונה המלאה
        time.sleep(0.1)  # השהייה של 0.2 שניות כדי להציג את העברת החלקים

    #הוצאת החלק החסר שיושלם לבסוף-----------------------------------------------------------------
    # אם בחר בקל אז החלק החסר יהיה תמיד המקום האחרון, אחרת יהיה הגרלה
    if difficulty == 1 :
        for i in range(len(partsPuzzle)):
            if partsPuzzle[i].id == Level * Level - 1: # המקום האחרון
                NumRandom = i
    else:
        NumRandom = random.randint(0, len(partsPuzzle) - 1)  # מגריל מספר בין 0 לאחרון כולל

    empty_position = partsPuzzle.pop(NumRandom)
    empty_position.label.grid_forget() # הריסת החלק החסר מהחלון בלבד, ולא לגמרי
    #empty_position.label.grid_remove() # גם זה תקין ושקול לשורה מעל

    #החלת הוזזת העכבר על החלקים
    BindDrag(partsPuzzle, Level)

    # ----------------------------------------------------מונה נסיונות
    #frame = ttk.Frame(root, padding=10, borderwidth=5, relief="ridge")
    #frame.grid()

    status_Check = ttk.StringVar()
    counter_Check = ttk.Label(root, textvariable=status_Check, style="Custom.TLabel")
    counter_Check.grid(row=Level +1, column=2,columnspan=Level,pady=20,padx=20)  # הידבק לחלק הימני של התא

    #status_Check.set(f"Moves {0}/{Check_MAX}")
    status_Check.set(f"Mvs: {0}")

    # ---------------------------------------------------משתנה כדי להציג את הזמן
    start_time = time.time()
    is_timer_running = True
    time_display_var = ttk.StringVar()  # משתנה דינמי
    time_display_var.set("00:00")  # ערך התחלתי
    time_label = ttk.Label(root, textvariable=time_display_var,  style="Custom.TLabel")
    time_label.grid(row=Level +1, column=0,columnspan=Level-2, pady=20)

    # פונקציה לעדכון הזמן
    def update_time():
        global is_timer_running,elapsed_time
        if is_timer_running:  # עדכון הזמן רק אם השעון פועל
            elapsed_time = time.time() - start_time  # חישוב הזמן שעבר
            minutes = int(elapsed_time // 60) # המרת שניות לדקות
            seconds = int(elapsed_time % 60)  # השאר הם שניות
            time_display_var.set(f"{minutes:02}:{seconds:02}")  # עדכון הטקסט
            root.after(100, update_time)  # קריאה חוזרת לפונקציה כל 100 מילישניות

    update_time()    # התחלת עדכון הזמן


    root.mainloop()
#חלק 3 - הגדרת רמות קושי--------------------------------------------------------------------------------
def Level_GAME(Choose):
    clear_window(root)
    root.geometry("1400x1300")  # גודל החלון
    root.title("Welcome to the puzzle game !")  # כותרת החלון

    # יצירת Frame להכיל את ה-Label והכפתורים
    frame = ttk.Frame(root)
    frame.pack(pady=20)  # מרחק של 20 מעל תפריט ההכפתורים

    # יצירת Label עם התמונה כרקע
    try:
        original_image = Image.open("assets/background.png")  # פתיחת התמונה באמצעות PIL
        resized_image = original_image.resize((800, 500))  # הקטנת התמונה
        image = ImageTk.PhotoImage(resized_image)  # המרת התמונה ל-PhotoImage
        ttk.Label(frame, image=image).pack(pady=20)
        frame.image = image  # שמור על התמונה בזיכרון

    except FileNotFoundError:
        ttk.Label(frame, text="No Image", style="Custom.TLabel").pack(pady=20)

    # מסגרת בעבור הכפתורים
    frame_Button = ttk.Frame(frame)
    frame_Button.pack()  # מרווח מלמעלה

    # יצירת כותרת מעל הכפתורים בתוך ה-Frame
    ttk.Label(frame_Button, text=" CHOOSE YOUR LEVEL ?",style="Custom.TLabel").pack(pady=10)

    # משתנה לשמירת הבחירה
    difficulty_var = ttk.IntVar(value=1) # ברירת מחדל דרגה קלה

    # יצירת Frame להכיל את כפתורי הרדיו
    frame_Radiobutton = ttk.Frame(root)
    frame_Radiobutton.pack(pady=60)

    # Frame עבור רמת קושי קל
    easy_frame = ttk.Frame(frame_Radiobutton)
    easy_frame.pack()
    ttk.Radiobutton(easy_frame, text="Easy", variable=difficulty_var, value=1,style="Green.TRadiobutton").grid(row=0, column=0, padx=250,sticky="nsew")  # רווחים בין הכפתורים
    ttk.Label(easy_frame,text="the missing piece will always be on the bottom right\nmaking it easier for the player to spot patterns to solve.",style="Green.TLabel").grid(row=1, column=0,pady=5, padx=50)
    ttk.Radiobutton(easy_frame, text="Hard", variable=difficulty_var, value=2,style="Red.TRadiobutton").grid(row=0, column=1, padx=180,sticky="nsew")  # רווחים בין הכפתורים
    ttk.Label(easy_frame, text="the missing part will be by lottery.",style="Red.TLabel").grid(row=1, column=1, padx=50,sticky="nsew") # כותרת מתחת

    # יוצרת את הכפתורים עם הפונקציה המתאימה כ-command
    # relief=RAISED כיתוב באמצע הכפתור
    # size= i חובה להגדיר משתנה אחר כדי שלכל כפתור יהיה את הערך שלו בנפרד
    for i in range(3, 10):  # יצירת כפתורים מ-3 עד 9 כולל
        ttk.Button(frame_Button,text=f"{i} * {i}",command=lambda size= i: START_GAME(size, Choose, difficulty_var.get()), width=7,bootstyle="outline-warning"
            ).pack(side=ttk.LEFT, padx=20, pady=20)


    root.mainloop()  # חובה כדי שלא יסגר החלון

#חלק 2 - הגדרת תמונה או מספרים--------------------------------------------------------------------------
def ChoosePictureOrNumbers():
    clear_window(root) # פעולה לניקוי אלמנטים בחלון
    root.geometry("1400x1400")  # גודל החלון
    root.title("Welcome to the puzzle game !")  # כותרת החלון

    play_song()  # נגן מנגינה
    # תפריט
    Menus()

    # יצירת Frame להכיל את ה-Label והכפתורים
    frame = ttk.Frame(root)
    frame.pack(pady=60)  # מרחק של 60 מעל תפריט ההכפתורים

    # יצירת Label עם התמונה כרקע
    try:
        original_image = Image.open("assets/background.png")  # פתיחת התמונה באמצעות PIL
        resized_image = original_image.resize((800, 500))  # הקטנת התמונה
        image = ImageTk.PhotoImage(resized_image)  # המרת התמונה ל-PhotoImage
        ttk.Label(frame, image=image).pack(pady=20)
        frame.image = image  # שמור על התמונה בזיכרון

    except FileNotFoundError:
        ttk.Label(frame, text="No Image", style="Custom.TLabel").pack(pady=20)


    # טוען את התמונות
    image_Level1 = Image.open('assets/Numbers.png')
    image_Level2 = Image.open('assets/SelectingImage.png')

    # הקטן
    ResizedImage =(500,400) # משתנה שמחזיק שני מספרים של גודל  התמונות
    image_Level1 = image_Level1.resize(ResizedImage)
    image_Level2 = image_Level2.resize(ResizedImage)
    # המר את התמונה ל-Tkinter
    image_Level1 = ImageTk.PhotoImage(image_Level1)
    image_Level2 = ImageTk.PhotoImage(image_Level2)

    # יצירת כותרת מעל הכפתורים בתוך ה-Frame
    ttk.Label(frame, text=" Choose Picture Or Numbers ?", style="Custom.TLabel").pack(pady=10)

    # יוצרת את הכפתורים עם הפונקציה המתאימה כ-command
    ttk.Button(frame,bootstyle="outline-warning", command=lambda: Level_GAME("ChooseNumbers"), image=image_Level1).pack(side=ttk.LEFT,padx=70, pady=30)  # כפתור מספרים
    ttk.Button(frame,bootstyle="outline-warning", command=lambda: Level_GAME("ChooseImage"), image=image_Level2).pack(side=ttk.LEFT,padx=50, pady=30)  # כפתור תמונה



    root.mainloop()  # חובה כדי שלא יסגר החלון
#חלק 1 - פרטי השחקן-------------------------------------------------------------------------------------------
def open_registration_window():
    root.title("Registration")
    root.geometry("1000x1200")  # גודל החלון

    # מסגרת בעבור כל תיבה ותווית שלו, כדי שיהיו אחד מתחת לשני
    frame = ttk.Frame(root)
    frame.pack(pady=60)  # מרווח מלמעלה

    # טעינת תמונה
    try:
        original_image = Image.open("assets/background2.png")  # פתיחת התמונה באמצעות PIL
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
            ChoosePictureOrNumbers()  # מעבר לפעולת ההתחלה
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
style.configure("orange.TLabel",font=("Arial", 30, "bold"),foreground="orange",background="lightblue",relief="ridge",borderwidth=5,anchor="center") # צבע רקע, ורווח פנימי, גודל גבול, וערך באמצע

style.configure("Red.TLabel", font=("Arial", 8, "bold"),foreground="red")  # סגנון עבור תוויות
style.configure("Green.TLabel", font=("Arial", 8, "bold"),foreground="green")  # סגנון עבור תוויות
style.configure("Red.TRadiobutton", font=("Arial", 14, "bold"),foreground="red")  # סגנון עבור תוויות
style.configure("Green.TRadiobutton", font=("Arial", 14, "bold"),foreground="green")  # סגנון עבור תוויות

#START_GAME(3,"ChooseImage",1)
open_registration_window()

root.mainloop()  # חובה כדי שלא יסגר החלון
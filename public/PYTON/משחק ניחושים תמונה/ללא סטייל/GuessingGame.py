from tkinter import *
from tkinter import ttk
from tkinter import messagebox
import random
import pygame

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
#----------------------------------------------------------------------------------------------------------
#משתנים גלובלים
window = None
image_items = [] # רשימה לתמונות
image_guesswork = [] # רשימה לתמונות ניחוש
Check_Num = 0 #מספר הנסיונות


#----------------------------------------------------------------------------------------------------------
#מחלקה עם תמונה/מיקום/ומספר מזהה
class ImageItem:
    def __init__(self, image_path, position,label,id):
        self.image_path = image_path  # הנתיב לתמונה
        self.position = position  # מיקום
        self.label = label # widgets - label לצורך שינוי מיקום
        self.id = id # לצורך התאמת הניחושים
    def update_position(self, new_position): # מעדכן שינוי של מיקום חדש
        self.position = new_position


# ----------------------------------------------------------------------------------------------------------
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
#----------------------------------------------------------------------------------------------------------
#עכבר
def on_drag_start(event):
    """שומר את המיקום ההתחלתי של התמונה כאשר מתחילים לגרור."""
    widget = event.widget
    widget.startX = event.x
    widget.startY = event.y
    widget.lift()  # שומר שהתמונה תהיה מעל כל שאר האלמנטים

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


#----------------------------------------------------------------------------------------------------------
#במקום לפתוח חלון חדש אפשר לנקות את המקור ולשנותו
def clear_window(window):
    for widget in window.winfo_children():
        widget.destroy()
#----------------------------------------------------------------------------------------------------------
#התחלת משחק שוב פעם
def resetGAME():
    #איפוס חובה לכל הרשימות
    image_items.clear()  # רשימה לתמונות
    image_guesswork.clear()  # רשימה לתמונות ניחוש
    Level_GAME()
#----------------------------------------------------------------------------------------------------------
#התחלת המשחק
def START_GAME(Level):
    global image_items,window,image_guesswork
    clear_window(window)
    window.title("!!! START !!!")  # כותרת החלון
    window.geometry("1800x900")  # גודל החלון
    window.config(background="#5cfcff")  # רקע אחורי תכלת

    # -------------------------------------------תפריט שורות
    menubar = Menu(window)
    window.config(menu=menubar)
    fileMenu = Menu(menubar, tearoff=0, font=("MV Boli", 15))
    menubar.add_cascade(label="File", menu=fileMenu)
    fileMenu.add_command(label="reset", command=resetGAME, compound='left')
    fileMenu.add_separator()  # יוצר קו מפריד
    fileMenu.add_command(label="Exit", command=window.destroy, compound='left') # אסור לעשות quit זה יגרום ל-EXE לקרוס

    # -------------------------------------------מסגרת
    # כדי שתמונות לא ידרסו כאשר השורות מצטמצמות
    frame = Frame(window)
    frame.pack(fill=BOTH, expand=True)

    bg_image = PhotoImage(file='assets/background.png')#תמונת רקע אחורי מאחורי המסגרת
    bg_label = Label(frame, image=bg_image)
    bg_label.place(relwidth=1, relheight=1)# שהתמונה תהיה על כל המסגרת

    # -------------------------------------------הצבת התמונות והניחושים
    #הגרלה על המזהה של הניחושים
    positions = [i for i in range(0,9)] #הכנסת כל המספרים בקצרה
    random.shuffle(positions)  # עירבול המיקומים

    #המיקומים לניחוש לפי הדרגה והצבתם
    counter = 0
    image_guess = PhotoImage(file='assets/QuestionMark.png')
    for i in range(Level):  # עד 3 שורות
        for j in range(3):  # תמיד 3 עמודות
            label = Label(frame, image=image_guess) # מוסיף לחלון
            label.grid(row=i, column=j, padx=20, pady=20)
            image_item = ImageItem(image_guess, (i, j), label, positions[counter])  # הכנסת ההגרלה
            print(str(image_item.position) + " , " + str(image_item.id))
            image_guesswork.append(image_item)  # הוספת האובייקט לרשימה
            counter +=1

    # שומר את התמונות ברשימה כעצמים,והצבת התמונות בחלון
    for i in range(3):  # 3 שורות
        for j in range(3):  # 3 עמודות
            index = i * 3 + j  # מחזיר מספר מ- 0 עד 8
            image_path = PhotoImage(file=f'assets/animal{index+1}.png')  # יצירת שם קובץ עבור כל תמונה

            label = Label(frame, image=image_path, bg="#ffffff") # הכנסת המיקומים
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
    window.update_idletasks() # המתן שהחלון יתעדכן ואז שמור את המיקומים, בלי זה המיקומים 0
    for i in range(len(image_items)): # המיקומים של התמונות
        image_items[i].position = (image_items[i].label.winfo_x(),image_items[i].label.winfo_y())
    for i in range(len(image_guesswork)): # המיקומים של הניחושים
        image_guesswork[i].position = (image_guesswork[i].label.winfo_x(),image_guesswork[i].label.winfo_y())



    #----------------------------------------------------------------------------------------------------------
    # יצירת משתנה התקדמות והתקן Progress Bar אופקי
    progress_bar = ttk.Progressbar(frame, length=200, orient=HORIZONTAL)  # אופקי
    progress_bar.grid(row=Level, column=4, padx=30)
    # משתנה לסטטוס התקדמות
    status_var = StringVar()
    status_var.set(f"0/{Level * 3}")
    # תווית סטטוס להצגת ההתקדמות
    status_label = Label(frame, textvariable=status_var, bg="#5cfcff", font=("Arial", 16))
    status_label.grid(row=Level, column=4,sticky=E) # sticky=E ככה עושים שני דברים באותה שורה ועמודה

    #----------------------------------------------------------------------------------------------------------
    #3 משתנים התקדמות בשביל זיהוי תמונה לא במקום
    progress_bar1 = ttk.Progressbar(frame, length=200, orient=HORIZONTAL)  # אופקי
    progress_bar1.grid(row=0, column=4, padx=10)
    if  Level >=2:
        progress_bar2 = ttk.Progressbar(frame, length=200, orient=HORIZONTAL)  # אופקי
        progress_bar2.grid(row=1, column=4, padx=10)
    if  Level ==3:
        progress_bar3 = ttk.Progressbar(frame, length=200, orient=HORIZONTAL)  # אופקי
        progress_bar3.grid(row=2, column=4, padx=10)

    print(positions)
#----------------------------------------------------------------------------------------------------------
    #מונה נסיונות
    status_Check =StringVar()
    counter_Check = Label(frame, textvariable=status_Check, bg="#5cfcff", font=("Arial", 20))
    counter_Check.grid(row=Level, column=1,sticky=E) # הידבק לחלק הימני של התא
# ----------------------------------------------------------------------------------------------------------
    Check_MAX = 20 # מגבלת נסיונות
    status_Check.set(f"{0}/{Check_MAX}")

#-----------------------------------------------------------------------------------------------------------

    def Check():
        global Check_Num,image_guesswork,image_items
        correct_positionsNum = 0  # אפס את מספר המיקומים הנכונים
        correct_positionsNum1 =0
        correct_positionsNum2 =0
        correct_positionsNum3 =0

        # בדוק לכל ניחוש label ומצא את התמונה הזהה ID , ואז בדןק מגע לפי label
        for guess_item in image_guesswork:
            for image_item in image_items:
                if guess_item.id == image_item.id: # בדוק את התמונה שמתאימה לניחוש
                    if check_collision(guess_item.label, image_item.label): # בדוק האם הם נוגעים אחד בשני
                        correct_positionsNum +=1

       # עדכון התקדמות החלון והנסיונות
        progress_bar['value'] = (correct_positionsNum / (Level * 3)) * 100
        status_var.set(f"{correct_positionsNum}/{Level * 3}")
        Check_Num += 1
        status_Check.set(f"{Check_Num}/{Check_MAX}")
        window.update_idletasks()

#--------------------------------------------------------------------------------------------
        #פעולה בקיצור, לקידום כל החלונות שבמיקומים הלא נכונים בשביל כל שורה בנפרד
        def same_line(start, end, progress):
            for i in range(start, end):
                for image_item in image_items:
                    if image_guesswork[i].id != image_item.id:  # בדוק את התמונה שלא מתאימה לניחוש אבל למקום
                        if check_collision(image_guesswork[i].label, image_item.label):  # בדוק האם הם נוגעים אחד בשני
                            for j in range(start, end):
                                if positions[j] == image_item.id:
                                    progress += 1
            return progress

        progress_bar1['value'] = (same_line(0,3,correct_positionsNum1) / 3) * 100
        if Level >=2:
            progress_bar2['value'] = (same_line(3, 6, correct_positionsNum2) / 3) * 100
        if Level ==3:
            progress_bar3['value'] = (same_line(6, 9, correct_positionsNum3) / 3) * 100
#-----------------------------------------------------------------------------------------------------

        # הצגת חלון של זכיה
        if correct_positionsNum == (Level * 3):
            success()
            doneButton.config(state="disabled") #השבת את הכפתור
            messagebox.showinfo("Congratulations", "All images are in the correct positions!")
            Check_Num = 0  # איפוס הנסיונות עובד רק כשהוא כאן

        # הצגת חלון של כישלון
        if Check_Num == Check_MAX:
            play_failure_sound()
            messagebox.showerror("Error", "You failed!")
            doneButton.config(state="disabled") #השבת את הכפתור
            Check_Num = 0  # איפוס הנסיונות עובד רק כשהוא כאן
#--------------------------------------------------------------------------------------------

    # כפתור "Check" לבדיקת המיקום
    doneButton = Button(frame, text="Check", command=Check)
    doneButton.grid(row=Level, column=1, padx=10)  # הזזת הכפתור שמאלה

    window.mainloop()
#----------------------------------------------------------------------------------------------------------
#חלון שני של רמת קושי
def Level_GAME():  # חלון רמת קושי
    play_song()
    clear_window(window)
    window.title("!!! Choose your level !!!")  # כותרת החלון
    window.geometry("900x500")  # גודל החלון
    window.config(background="#5cfcff")  # רקע אחורי תכלת

    # יצירת Frame להכיל את ה-Label והכפתורים
    frame = Frame(window, background="#5cfcff")
    frame.pack(pady=20)  # מרחק של 20 מעל תפריט ההכפתורים

    # טוען את התמונות
    image_Level1 = PhotoImage(file='assets/Level1.png')
    image_Level2 = PhotoImage(file='assets/Level2.png')
    image_Level3 = PhotoImage(file='assets/Level3.png')

    # יצירת כותרת מעל הכפתורים בתוך ה-Frame
    Label(frame, text="💀 CHOOSE YOUR LEVEL 💀", font=("Dreadful", 50), bg="#5cfcff", fg="#ff0000").pack(pady=10)

    # יוצרת את הכפתורים עם הפונקציה המתאימה כ-command
    Button(frame, command=lambda: START_GAME(1), image=image_Level1, relief=RAISED, bd=10, padx=20, pady=20).pack(
        side=LEFT, padx=20, pady=20)  # כפתור קל
    Button(frame, command=lambda: START_GAME(2), image=image_Level2, relief=RAISED, bd=10, padx=20, pady=20).pack(
        side=LEFT, padx=20, pady=20)  # כפתור בינוני
    Button(frame, command=lambda: START_GAME(3), image=image_Level3, relief=RAISED, bd=10, padx=20, pady=20).pack(
        side=LEFT, padx=20, pady=20)  # כפתור קשה

    window.mainloop()  # חובה כדי שהכל יעבוד טוב
#----------------------------------------------------------------------------------------------------------

window = Tk()  # החלון הראשי
window.geometry("620x480")  # גודל החלון
window.title("Welcome to the guessing game !")  # כותרת החלון
window.config(background="#5cfcff")  # רקע אחורי תכלת

# טוען את התמונות
image_START = PhotoImage(file='assets/Starting.png') #תמונת התחלה
image_exit = PhotoImage(file='assets/exit.png') #תמונת יציאה
image_icon = PhotoImage(file='assets/icon.png') #אייקון
window.iconphoto(True, image_icon)  # האייקון בכותרת החלון בצד שמאל



# יוצרת את הכפתורים
Button(window, command=Level_GAME, image=image_START, relief=RAISED, bd=10, padx=20, pady=20).pack(padx=20, pady=20)  # כפתור התחלה
Button(window, command=window.destroy, image=image_exit, relief=RAISED, bd=10, padx=20,pady=20).pack()  # כפתור יציאה

window.mainloop()  # שומר על החלון המקורי פתוח עד ליציאה או התחלה
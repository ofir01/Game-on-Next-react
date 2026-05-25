from tkinter import *
from tkinter import ttk
import random



# הגדרת המשתנים הגלובליים
original_positions = {}  # משתנה גלובלי לאחסון מיקומים מקוריים
guess_count = 0  # משתנה גלובלי לספירת מספר הניחושים
labels = []  # רשימה גלובלית לאחסון תוויות
correct_positions =0 # משתנה שמחזיק את המקום ההתחלתי
correct_positionsNum =0
progress_bar =None
Check_Num = 0



#----------------------------------------------------------------------------------------------------------
#במקום לפתוח חלון חדש אפשר לנקות את המקור ולשנותו
def clear_window(window):
    for widget in window.winfo_children():
        widget.destroy()
#----------------------------------------------------------------------------------------------------------
#התחלת משחק שוב פעם
def resetGAME():
    Level_GAME()

#----------------------------------------------------------------------------------------------------------
#התחלת המשחק
def START_GAME(Level):
    global  original_positions, labels, progress_var, status_var,image_position_dict,dictionaries  # משתנים גלובליים
    clear_window(window)
    window.title("!!! START !!!")  # כותרת החלון
    window.geometry("1800x900")  # גודל החלון
    window.config(background="#5cfcff")  # רקע אחורי תכלת

# ----------------------------------------------------------------------------------------------------------
    # תפריט שורות
    menubar = Menu(window)
    window.config(menu=menubar)
    fileMenu = Menu(menubar, tearoff=0, font=("MV Boli", 15))
    menubar.add_cascade(label="File", menu=fileMenu)
    fileMenu.add_command(label="reset", command=resetGAME, compound='left')
    fileMenu.add_separator()  # יוצר קו מפריד
    fileMenu.add_command(label="Exit", command=quit, compound='left')

# ----------------------------------------------------------------------------------------------------------
    image_background = PhotoImage(file='assets/QuestionMark.png')
    for i in range(Level):  # 3 שורות
        for j in range(3):  # 3 עמודות
            label = Label(window, image=image_background)
            label.grid(row=i, column=j, padx=20, pady=20)

# ----------------------------------------------------------------------------------------------------------
    # יצירת מילון ריק ורשימה ריקה עבור התמונות
    dictionaries = {}
    image_list = []
    # הוספת התמונות לרשימה
    for i in range(1, 10):
        image = PhotoImage(file=f'animal{i}.png')
        image_list.append(image)




    def create_image_position_dict():
        # קואורדינטות אפשריות עבור התמונות
        positions = [(i, j) for i in range(Level) for j in range(3)]
        random.shuffle(positions)  # עירבול המיקומים
        # יצירת מילון עם מפתחות וערכים
        return {f'image_{i + 1}': positions[i] for i in range(len(positions))}

    # שימוש בפונקציה כדי ליצור את המילון
    image_position_dict = create_image_position_dict()

# ----------------------------------------------------------------------------------------------------------
    # פונקציות לגרירה ושחרור
    def on_drag_start(event):
        widget = event.widget
        widget._drag_data = {'x': event.x, 'y': event.y}
        if widget not in original_positions:
            original_positions[widget] = widget.grid_info()  # שמירה של מיקום הגריד המקורי רק אם הוא לא שמור כבר

    def on_drag_motion(event):
        widget = event.widget
        x = widget.winfo_x() - widget._drag_data['x'] + event.x
        y = widget.winfo_y() - widget._drag_data['y'] + event.y
        widget.place(x=x, y=y)  # שימוש ב-place כדי לאפשר מיקום חופשי

    def on_drag_release(event):
        widget = event.widget

        # בדיקה אם יש חפיפה עם תוויות אחרות
        for label in labels:
            if label == widget:
                continue
            if widget.winfo_x() < label.winfo_x() + label.winfo_width() and \
               widget.winfo_x() + widget.winfo_width() > label.winfo_x() and \
               widget.winfo_y() < label.winfo_y() + label.winfo_height() and \
               widget.winfo_y() + widget.winfo_height() > label.winfo_y():
                widget.place_forget()  # החזרה למיקום המקורי במקרה של חפיפה
                widget.grid(**original_positions[widget])
                return

        # אם אין חפיפה, אפשר לשחרר את התמונה במקום החדש
        # שמירת המיקום החדש
        widget.place(x=widget.winfo_x(), y=widget.winfo_y())

# ----------------------------------------------------------------------------------------------------------
    # הצגת התמונות בתצורת גריד עם אפשרות גרירה
    for i in range(3):  # 3 שורות
        for j in range(3):  # 3 עמודות
            index = i * 3 + j
            if index < len(image_list): #שלא יהיה חריגה בפחות תמונות
                label = Label(window, image=image_list[index], bg="#ffffff")
                label.grid(row=i, column=j + 3, padx=20, pady=20)
                label.bind("<Button-1>", on_drag_start)
                label.bind("<B1-Motion>", on_drag_motion)
                label.bind("<ButtonRelease-1>", on_drag_release)
                labels.append(label)
    # עכשיו נערבב את התמונות ונחבר להם מפתחות, הסיבה שעושים את זה עכשיו, זה כדי שלא יופיע במסך התמונות במיקומים שונים
    random.shuffle(image_list) # ערבוב התמונות ברשימה
    for i, image in enumerate(image_list, start=1):  # הוספת התמונות המעורבבות למילון עם מפתחות ייחודיים
        dictionaries[f'image_{i}'] = image

#----------------------------------------------------------------------------------------------------------
    # יצירת משתנה התקדמות והתקן Progress Bar אופקי
    progress_bar = ttk.Progressbar(window, length=300, orient=HORIZONTAL)  # אופקי
    progress_bar.grid(row=4, column=0, padx=20, pady=20)  # מיקום ליד הכפתור משמאל
    # משתנה לסטטוס התקדמות
    status_var = StringVar()
    status_var.set(f"0 תמונות במיקומים הנכונים {len(dictionaries)} מתוך ")
    # תווית סטטוס להצגת ההתקדמות
    status_label = Label(window, textvariable=status_var, bg="#5cfcff", font=("Arial", 20))
    status_label.grid(row=4, column=3)
#----------------------------------------------------------------------------------------------------------
    #מונה נסיונות
    status_Check =StringVar()
    counter_Check = Label(window, textvariable=status_Check, bg="#5cfcff", font=("Arial", 20))
    counter_Check.grid(row=4, column=5)
# ----------------------------------------------------------------------------------------------------------
    Check_MAX =8 # מגבלת נסיונות
    status_Check.set(f"{Check_MAX} מספר נסיונות {0} מתוך ")
# ----------------------------------------------------------------------------------------------------------
    def Check():
        global correct_positionsNum, Check_Num
        correct_positionsNum = 0  # אפס את מספר המיקומים הנכונים
        total_images = len(image_position_dict)

        for label in labels:
            current_position = (label.winfo_x(), label.winfo_y())
            # מציאת התמונה במילון ובדיקת המיקום הנכון שלה
            for key, correct_position in image_position_dict.items():
                if dictionaries[key] == label.cget('image'):
                    expected_position = (
                    correct_position[1] * 120 + 20, correct_position[0] * 120 + 20)  # מיקום מבוסס על הגריד
                    # השוואת המיקום הנוכחי למיקום הצפוי
                    if (abs(current_position[0] - expected_position[0]) < 10 and
                            abs(current_position[1] - expected_position[1]) < 10):
                        correct_positionsNum += 1
                    break

        progress_bar['value'] = (correct_positionsNum / total_images) * 100
        status_var.set(f"{correct_positionsNum} תמונות במיקומים הנכונים מתוך {total_images}")
        Check_Num += 1
        status_Check.set(f"{Check_MAX} מספר נסיונות {Check_Num} מתוך ")
        window.update_idletasks()

    # כפתור "Check" לבדיקת המיקום
    doneButton = Button(window, text="Check", command=Check)
    doneButton.grid(row=4, column=1, padx=10,columnspan=2)  # הזזת הכפתור שמאלה

    window.mainloop()  # חובה כדי שהכל יעבוד טוב







#----------------------------------------------------------------------------------------------------------
#חלון שני של רמת קושי
def Level_GAME():  # חלון רמת קושי
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
    Button(frame, command=lambda: START_GAME(1), image=image_Level1, relief=RAISED, bd=10, padx=20, pady=20).pack(side=LEFT, padx=20, pady=20)  # כפתור קל
    Button(frame, command=lambda: START_GAME(2), image=image_Level2, relief=RAISED, bd=10, padx=20, pady=20).pack(side=LEFT, padx=20, pady=20)  # כפתור בינוני
    Button(frame, command=lambda: START_GAME(3), image=image_Level3, relief=RAISED, bd=10, padx=20, pady=20).pack(side=LEFT, padx=20, pady=20)  # כפתור קשה

    window.mainloop()  # חובה כדי שהכל יעבוד טוב


#----------------------------------------------------------------------------------------------------------

window = Tk()  # החלון הראשי
window.geometry("620x480")  # גודל החלון
window.title("Welcome to the guessing game !")  # כותרת החלון
window.config(background="#5cfcff")  # רקע אחורי תכלת

# טוען את התמונות
image_START = PhotoImage(file='assets/Starting a game.png')
image_exit = PhotoImage(file='assets/exit.png')
image_icon = PhotoImage(file='assets/icon.png')
window.iconphoto(True, image_icon)  # האייקון בכותרת החלון בצד שמאל


# יוצרת את הכפתורים
Button(window, command=Level_GAME, image=image_START, relief=RAISED, bd=10, padx=20, pady=20).pack(padx=20, pady=20)  # כפתור התחלה
Button(window, command=window.destroy, image=image_exit, relief=RAISED, bd=10, padx=20, pady=20).pack()  # כפתור יציאה

window.mainloop()  # שומר על החלון המקורי פתוח עד ליציאה או התחלה

from tkinter import *

def update_progress(value):
    # עדכון התקדמות
    progress_bar_canvas.coords(fill, 0, 0, value*2, 20)

# יצירת חלון
window = Tk()
window.geometry("300x200")

# יצירת Frame עם צבע רקע תכלת
frame = Frame(window, bg="#87CEEB")
frame.grid(row=0, column=0, padx=20, pady=20, sticky=N+S+E+W)  # ממקם את ה-Frame בתוך grid

# יצירת Canvas עבור ה-Progressbar
progress_bar_canvas = Canvas(frame, width=200, height=20, bg="white", bd=0, highlightthickness=0)
progress_bar_canvas.grid(row=0, column=0, padx=20, pady=20)  # ממקם את ה-Canvas בתוך grid

# יצירת ריבוע צהוב לצורך התקדמות
fill = progress_bar_canvas.create_rectangle(0, 0, 0, 20, fill="yellow", outline="")

# דוגמה לערך של ה-Progressbar
update_progress(50)  # הגדרת הערך הנוכחי ל-50 מתוך 100

# הגדרת הפרופורציות של השורות והעמודות
frame.grid_rowconfigure(0, weight=1)
frame.grid_columnconfigure(0, weight=1)
update_progress(10)  # הגדרת הערך הנוכחי ל-50 מתוך 100

window.mainloop()

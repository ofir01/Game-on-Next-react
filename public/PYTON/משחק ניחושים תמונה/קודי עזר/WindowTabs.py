import tkinter as tk

# מילון המכיל מיקומים רצויים לכל ריבוע
position_dict = {
    "square1": {"row": 1, "column": 1},
    "square2": {"row": 2, "column": 2},
    "square3": {"row": 3, "column": 3},
}

# מילון שיכיל את הריבועים
squares_dict = {}


def check_positions():
    # בדיקת מיקומים לכל ריבוע
    for square_id, position in position_dict.items():
        # קבלת הריבוע לפי ה-ID שלו מהמילון squares_dict
        square_label = squares_dict[square_id]
        grid_info = square_label.grid_info()
        current_row = grid_info['row']
        current_column = grid_info['column']

        # קבלת המיקום הרצוי מהמילון position_dict
        target_row = position["row"]
        target_column = position["column"]

        # בדיקת התאמה בין המיקום הנוכחי למיקום הרצוי
        if current_row == target_row and current_column == target_column:
            print(f"{square_id} is in the correct position.")
        else:
            print(f"{square_id} is NOT in the correct position.")


root = tk.Tk()
root.title("Check Multiple Squares' Grid Positions")

# יצירת ריבועים והצבתם במילון squares_dict וב-Grid
squares_dict["square1"] = tk.Label(root, text="Square 1", bg="blue", width=10, height=5)
squares_dict["square1"].grid(row=1, column=1)

squares_dict["square2"] = tk.Label(root, text="Square 2", bg="red", width=10, height=5)
squares_dict["square2"].grid(row=2, column=2)

squares_dict["square3"] = tk.Label(root, text="Square 3", bg="green", width=10, height=5)
squares_dict["square3"].grid(row=3, column=3)

# יצירת כפתור לבדיקת מיקומים
button = tk.Button(root, text="Check Positions", command=check_positions)
button.grid(row=0, column=0, columnspan=2)

root.mainloop()

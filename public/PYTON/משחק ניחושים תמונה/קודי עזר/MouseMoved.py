# מילון עם תמונות (לצורך הדוגמה, נשתמש במחרוזות כדי לייצג תמונות)
images_dict = {
    'A': 'image1',
    'B': 'image2',
    'C': 'image3'
}

# מילון עם המיקומים הנכונים (שורה, עמודה)
positions_dict = {
    'A': (1, 1),
    'B': (2, 3),
    'C': (3, 2)
}

# מיקום נוכחי של תמונות על הלוח (שורה, עמודה)
current_positions = {
    'A': (1, 1),  # 'A' בתמונה היא במקום הנכון
    'B': (2, 3),  # 'B' בתמונה היא במקום הנכון
    'C': (2, 2)  # 'C' בתמונה היא לא במקום הנכון
}


# פונקציה לבדיקה אם כל תמונה במקום הנכון
def check_images_positions(images_dict, positions_dict, current_positions):
    correct_positions = 0
    total_images = len(images_dict)

    for key in images_dict:
        correct_position = positions_dict[key]
        current_position = current_positions.get(key)

        if current_position == correct_position:
            print(f"Image {key} is in the correct position.")
            correct_positions += 1
        else:
            print(f"Image {key} is NOT in the correct position.")

    print(f"{correct_positions} out of {total_images} images are in the correct position.")


# הפעלת הפונקציה
check_images_positions(images_dict, positions_dict, current_positions)

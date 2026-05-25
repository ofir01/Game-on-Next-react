import tkinter as tk

def on_drag(event):
    """Update the position of draggable label and check for collision with any static label."""
    # Update position of draggable label
    draggable_label.place(x=event.x_root - root.winfo_rootx(), y=event.y_root - root.winfo_rooty())

    # Check for collision with each static label
    for idx, static_label in enumerate(static_labels):
        if check_collision(draggable_label, static_label):
            print(f"Collision detected with Static Label {idx + 1}!")

def check_collision(widget1, widget2):
    """Check if two widgets collide."""
    x1, y1, x2, y2 = get_widget_bbox(widget1)
    x1_static, y1_static, x2_static, y2_static = get_widget_bbox(widget2)

    # Check if bounding boxes overlap
    return x1 < x2_static and x2 > x1_static and y1 < y2_static and y2 > y1_static

def get_widget_bbox(widget):
    """Get bounding box of a widget."""
    x = widget.winfo_x()
    y = widget.winfo_y()
    w = widget.winfo_width()
    h = widget.winfo_height()
    return (x, y, x + w, y + h)

root = tk.Tk()
root.geometry("400x400")

# Create static labels
static_labels = []
positions = [(100, 100), (200, 100), (150, 200)]  # Define positions for static labels

for i, pos in enumerate(positions):
    static_label = tk.Label(root, text=f"Static Label {i + 1}", bg="red")
    static_label.place(x=pos[0], y=pos[1])
    static_labels.append(static_label)

# Create draggable label
draggable_label = tk.Label(root, text="Drag Me", bg="blue")
draggable_label.place(x=50, y=50)

# Bind the draggable label to mouse drag event
draggable_label.bind("<B1-Motion>", on_drag)

root.mainloop()

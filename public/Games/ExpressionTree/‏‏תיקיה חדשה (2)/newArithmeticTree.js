

class BinaryTreeNode {
    constructor(id, value, left = null, right = null) {
        this.id = id; // מזהה ייחודי לצומת
        this.value = value; // ערך הצומת
        this.left = left; // צומת שמאלי
        this.right = right; // צומת ימני
    }
}

class BinaryTree {
    constructor(id, value) {
        this.root = new BinaryTreeNode(id, value); // יצירת שורש העץ
    }

    // פעולה להוספת צומת חדש בתור צאצא ימין או שמאל
    addNode(parentId, side, id, value) {
        const parent = this.findNodeById(parentId, this.root);
        if (!parent) {
            console.log(`Parent node with ID "${parentId}" not found.`);
            return false;
        }

        if (side === "left") {
            if (parent.left === null) {
                parent.left = new BinaryTreeNode(id, value);
                console.log(`Added node "${id}" to the left of "${parentId}".`);
            } else {
                console.log(`Left child of node "${parentId}" already exists.`);
                return false;
            }
        } else if (side === "right") {
            if (parent.right === null) {
                parent.right = new BinaryTreeNode(id, value);
                console.log(`Added node "${id}" to the right of "${parentId}".`);
            } else {
                console.log(`Right child of node "${parentId}" already exists.`);
                return false;
            }
        } else {
            console.log(`Invalid side "${side}". Use "left" or "right".`);
            return false;
        }
        return true;
    }

    // פעולה שמוחקת צומת וכל הצאצאים שלו
    deleteNode(id, node = this.root, parent = null, side = null) {
        if (!node) return false;

        // מצאנו את הצומת למחיקה
        if (node.id === id) {
            if (parent) {
                // עדכון ההורה כדי לנתק את הצומת מהעץ
                if (side === "left") parent.left = null;
                if (side === "right") parent.right = null;
            } else {
                // אי אפשר למחוק את שורש העץ אם הוא הצומת הנבחר
                console.log("Cannot delete the root node.");
                return false;
            }
            console.log(`Deleted node "${id}" and all its descendants.`);
            return true;
        }

        // חפש בצומת השמאלי
        if (this.deleteNode(id, node.left, node, "left")) return true;

        // חפש בצומת הימני
        return this.deleteNode(id, node.right, node, "right");
    }

    // פעולה שמחזירה צומת לפי ID
    findNodeById(id, node = this.root) {
        if (!node) return null;
        if (node.id === id) return node;

        // חפש בצומת השמאלי
        const leftResult = this.findNodeById(id, node.left);
        if (leftResult) return leftResult;

        // חפש בצומת הימני
        return this.findNodeById(id, node.right);
    }

    // הדפסת העץ (In-order Traversal)
    printTree(node = this.root) {
        if (!node) return;
        this.printTree(node.left);
        console.log(`ID: ${node.id}, Value: ${node.value}`);
        this.printTree(node.right);
    }
}

// דוגמת שימוש
const tree = new BinaryTree("root", 10);

// הוספת צמתים
tree.addNode("root", "left", "left1", 5);
tree.addNode("root", "right", "right1", 15);
tree.addNode("left1", "left", "left2", 3);
tree.addNode("left1", "right", "right2", 7);

// הדפסת העץ
tree.printTree();

// מציאת צומת לפי ID
const foundNode = tree.findNodeById("right1");
console.log(foundNode);

// מחיקת צומת
tree.deleteNode("left1");

// הדפסת העץ לאחר מחיקה
tree.printTree();

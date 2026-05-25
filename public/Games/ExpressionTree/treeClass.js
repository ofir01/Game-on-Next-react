const Level = sessionStorage.getItem("level"); //הגבול של האורך


class TreeNode {
    constructor(id, value, left = null, right = null) {
        this.id = id;
        this.value = value;
        this.left = left;
        this.right = right;
    }

    addChild(side, id, value) {
        if (side === 'left') {
            this.left = new TreeNode(id, value);
        } else if (side === 'right') {
            this.right = new TreeNode(id, value);
        }
    }

    deleteChildById(id) {
        if (this.left && this.left.id === id) {
            this.left = null;
        } else if (this.right && this.right.id === id) {
            this.right = null;
        } else {
            if (this.left) this.left.deleteChildById(id);
            if (this.right) this.right.deleteChildById(id);
        }
    }

    findNodeById(id) {
        if (this.id === id) return this;
        let found = null;
        if (this.left) found = this.left.findNodeById(id);
        if (!found && this.right) found = this.right.findNodeById(id);
        return found;
    }

    // פונקציה למציאת הורה של צומת לפי ID
    findParentById(childId) {
        if ((this.left && this.left.id === childId) || (this.right && this.right.id === childId)) {
            return this;
        }

        if (this.left) {
            const leftSearch = this.left.findParentById(childId);
            if (leftSearch) return leftSearch;
        }

        if (this.right) {
            const rightSearch = this.right.findParentById(childId);
            if (rightSearch) return rightSearch;
        }

        return null; // אם לא נמצא הורה
    }
}

function calc(root) {
    if (!root) return 0;
    if (!root.left && !root.right) return parseInt(root.value, 10);

    const left = calc(root.left);
    const right = calc(root.right);

    switch (root.value) {
        case '+':
            return left + right;
        case '-':
            return left - right;
        case '*':
            return left * right;
        case '/':
            return left / right;
        default:
            return 0;
    }
}


function countRightChildren(node) {
    if (!node) return 0;
    let rightChildrenCount = 0;
    if (node.right) { // אם יש בן ימין, סופרים אותו
        rightChildrenCount = 1;
    }
    return (rightChildrenCount + countRightChildren(node.left) + countRightChildren(node.right));
}

function countLeftChildren(node) {
    if (!node) return 0;
    let leftChildrenCount = 0;
    if (node.left) { // אם יש בן ימין, סופרים אותו
        leftChildrenCount = 1;
    }
    return (leftChildrenCount + countLeftChildren(node.left) + countLeftChildren(node.right));
}


 


/////////////////////

function getRandomNumber(Level) {
    if(Level == 7){
        return Math.floor(Math.random() * 100);  // מחזיר מספר אקראי בין 1 ל-100
    }
    return Math.floor(Math.random() * 10);  // מחזיר מספר אקראי בין 1 ל-9
}

function getRandomOperator() {
    const operators = ['+', '-', '*', '/'];
    return operators[Math.floor(Math.random() * operators.length)];  // מחזיר פעולה אקראית
}

function generateExpression(Level) {
    let resultString = "";  // המשתנה שמכיל את המחרוזת
    for (let i = 0; i < Level; i++) {  // למשל, 5 סיבובים (אפשר לשנות את המספר לפי הצורך)
        if(i <Level-1)// לא מוסיפים אופרטור אחרי המספר האחרון
            resultString += `${getRandomNumber(Level)}${getRandomOperator()}` ;  
        else
            resultString += getRandomNumber(Level);
    }
    return resultString;  // מסיר את הרווח בסוף
}

// המרת המחרוזת לתוצאה של חישוב
function evaluateExpression(expression) {
    try {
        const result = eval(expression);  // מחשב את התוצאה של הביטוי
        return result;
    } catch (e) {
        console.error("Error in expression evaluation", e);
        return null;  // במקרה של טעות בביטוי
    }
}

let length = 0;
let result = 0;
while(true){
    let expression = generateExpression(Level);
    console.log("Expression:", expression);  // הצגת הביטוי שנוצר
    console.log("length:", expression.length);  // הצגת התוצאה של אורך
    result = evaluateExpression(expression);
    console.log("Result:", result);  // הצגת התוצאה של החישוב

    if(result !=null){
        length =expression.length;
        let randomIndex = Math.floor(Math.random() * length);// בחר אינדקס רנדומלי במחרוזת
        // החלף את התו ברווח
        let modifiedExpression = expression.slice(0, randomIndex) + ' ' + expression.slice(randomIndex + 1);
        document.getElementById("exercise").innerHTML = modifiedExpression + " =";
        if(Level == 5){
            document.getElementById("exercise").innerHTML = expression + " =";
        }
        break;
    }
}





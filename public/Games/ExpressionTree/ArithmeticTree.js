
// משתנה שיתעד את הצומת הנבחר
let previousSelectedNode = null;
let experience = 5;//מספר נסיונות

// משתנה גלובלי לשימור הערך שנבחר
const display = document.getElementById("calculator-display");

const treeRoot = new TreeNode("root", "");
const svg = document.getElementById("tree-svg");
let selectedNodeId = "root";
// משתנים גלובליים למעקב אחרי הצמתים שנותרו בכל צד
const leftCount = Math.floor(length / 2);  // התחל קבוע עם הערך של הכפתור
const rightCount = leftCount; // התחל קבוע עם הערך של הכפתור

let leftCounts = leftCount; // שינוי הערך של הכפתור
let rightCounts = rightCount; // שינוי הערך של הכפתור

refreshTree();

// מאזין לאירוע קליק על צומת
function onNodeClick(node, group) {
// אם יש צומת קודם, נסיר את ה-SHDO ממנו
if (previousSelectedNode) {
    const previousNodeGroup = svg.querySelector(`[data-id='${previousSelectedNode.id}']`);
    if (previousNodeGroup) {
        previousNodeGroup.querySelector('circle').setAttribute('stroke', 'none');
    }
}

// הגדרת הצומת החדש כצומת הנבחר
selectedNodeId = node.id;
console.log(`Selected node: ${selectedNodeId}`);

 // הוספת קו מסביב לצומת החדש
group.querySelector('circle').setAttribute('stroke', 'orange');
group.querySelector('circle').setAttribute('stroke-width', '8');


// עדכון הצומת הנבחר
previousSelectedNode = node;
}   




function updateCounters() {
    // עדכון תצוגת המונים בכפתורים
    document.querySelector(".counterL").textContent = leftCounts = leftCount -countLeftChildren(treeRoot) ;
    document.querySelector(".counterR").textContent = rightCounts = rightCount - countRightChildren(treeRoot);
}



function renderTree(node, x, y, parentX = null, parentY = null, depth = 0) {
    if (!node) return;

    // יצירת קו מחבר אם יש הורה
    if (parentX !== null && parentY !== null) {
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", parentX);
        line.setAttribute("y1", parentY);
        line.setAttribute("x2", x);
        line.setAttribute("y2", y);
        line.setAttribute("stroke", "black");
        svg.appendChild(line);
    }

    // יצירת קבוצה חדשה עבור הצומת הנוכחי
    const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
    group.setAttribute("data-id", node.id);

    // יצירת המעגל המייצג את הצומת
    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", "30");
    circle.setAttribute("fill", node.id === "root" ? "green" : "blue");
    group.appendChild(circle);

    // יצירת הטקסט שמייצג את הערך בצומת
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y + 12);
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "40");

    text.textContent = node.value;
    group.appendChild(text);

    // מאזין לאירוע קליק
    group.addEventListener("click", (e) => {
        e.stopPropagation();
        onNodeClick(node, group); // קריאה לפונקציה לעדכון הצומת הנבחר
    });

    svg.appendChild(group);

    // הגדלת המרחק עד לרמה 5
    const childOffset = depth < 2 ? (depth === 0 ? 300 : 100) : 100;

    // קריאה לפונקציה עבור הצאצאים
    renderTree(node.left, x - childOffset, y + 80, x, y, depth + 1);
    renderTree(node.right, x + childOffset, y + 80, x, y, depth + 1);
}

function refreshTree() {
    svg.innerHTML = "";
    renderTree(treeRoot, 635, 60);
    updateCounters();
}

document.getElementById("add-left").addEventListener("click", () => {
const parentNode = treeRoot.findNodeById(selectedNodeId);
if(leftCounts === 0) {
    alert("No more left children available!");
}
else if (parentNode && !parentNode.left) {
    // שימוש ב- display.value אם יש או ברירת מחדל "0"
    parentNode.addChild("left", `${selectedNodeId}-left`, display.value || "0");
    refreshTree();
}
});

document.getElementById("add-right").addEventListener("click", () => {
const parentNode = treeRoot.findNodeById(selectedNodeId);
if(rightCounts === 0){
    alert("No more right children available!");
}
else if (parentNode && !parentNode.right) {
    // שימוש ב- display.value אם יש או ברירת מחדל "0"
    parentNode.addChild("right", `${selectedNodeId}-right`, display.value || "0");
        refreshTree();
    } 
});

document.getElementById("delete").addEventListener("click", () => {
    if (selectedNodeId === "root") {
        alert("Cannot delete root node!");
        return;
    }
    treeRoot.deleteChildById(selectedNodeId);
    selectedNodeId = "root";
    refreshTree();
});


// מאזינים לכפתורי חישוב
document.querySelectorAll(".calc-btn").forEach(button => {
    button.addEventListener("click", () => {
        const value = button.textContent;
        if(value === "C"){
            display.value = ""
        }else{
            if (/[+\-*/]/.test(display.value) || ['+', '-', '*', '/'].includes(value) || display.value === '0') {
                display.value = "";
            } 
            // אם הערך המלא גדול מ-100, איפוס
            if (display.value + value > 99 ) {
                alert("Value cannot exceed 99!");
            }
            else if(Level <7 && display.value + value > 9){
                alert("Value cannot exceed 9!");

            }
            else{
                display.value += value;
            }
        }
    });
});



document.getElementById("update-value").addEventListener("click", () => {
const node = treeRoot.findNodeById(selectedNodeId);
if (node) {
    if (display.value === "") {
        alert("Please select a value from the calculator first.");
        return;
    }
    node.value = display.value; // עדכון הערך בצומת הנבחר
    refreshTree(); // רענון העץ להצגת השינוי
} else {
    alert("No node selected or node does not exist.");
}
});

document.getElementById("Check").addEventListener("click", () => {
    if(experience != 0){
        if (result == calc(treeRoot)) {
            alert("✅ Correct! The result matches the calculation.");
            document.getElementById("exercise").innerHTML += " " +result;
            VictoryGame();//אתחול המשחק
        } else {
            alert(`❌ Incorrect! The result does not match the calculation.\nAttempts left: ${experience}`);
            experience--;
        }
    } else{
        alert("❌ The number of attempts is over, start a new game 🎮!!!");
        VictoryGame()
    }
    
});




//ניצחון
function VictoryGame() {
    window.location.href = "GameMenu.html"; //מעבר לדף הניצחון
}
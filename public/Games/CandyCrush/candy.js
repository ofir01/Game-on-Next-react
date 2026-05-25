
var candies = ["Blue", "Orange", "Green", "Yellow", "Red", "Purple"]; // מגדיר את סוגי הסוכריות
var board = []; // לוח המשחק
var rows = 9; // מספר השורות בלוח
var columns = 9; // מספר העמודות בלוח
var score = 0; // אתחול ניקוד המשחק

var currTile; // משתנה שיתפוס את הסוכריה שנגררת
var otherTile; // משתנה שיתפוס את הסוכריה שגוררים עליה

var isSwapping = false; // דגל כדי למנוע החלפות נוספות בזמן שמבצעת החלפה
let FindPossibleMove = true; //מגלה לשחקן איזה חלק אפשר להוזיז לקבלת רצף
let findMove;

let goalCandy = randomCandy(); // סוכריה אקראית כמשימה
let goalCount = 20; // כמה יש להשמיד
let goal;


//הנסיונות
let attempts;
let attemptsCount = 20;





async function finishGame(result, message) {
    await finishGameSession(result);

    alert(message);
    resetGoal();
    gameSessionActions?.start();//התחלת ההקלטה מחדש
}



// הפעלת המשחק כאשר הדף נטען
window.onload = function () {
    //התחלת הנתונים .1
    gameSessionActions = window.GameSessionEvents?.createActions({
        getData: () => ({
            score: score,
            goalLeft: goalCount,
            attemptsLeft: attemptsCount,
        }),
    });

    //רק לאחר שהדף נטען אפשר להחזיר ערך אחרת יהיה ריק ושגיאה
    // אין לעדכן את הערך וגם את האלמנט באותה שורה זה יגרום לא לעבוד
    //goal = document.getElementById("goal-count").innerText = goalCount;
    document.getElementById("goal-image").src = `./images/${goalCandy}.png`;
    goal = document.getElementById("goal-count");
    goal.innerText = goalCount
    attempts = document.getElementById("attempts-count");
    attempts.innerText = attemptsCount;

    startGame();

    // כל 1/10 שניה
    intervalId = window.setInterval(function () {
        crushCandy(); // לבדוק אם יש סוכריות שנשברות
        document.getElementById("score").innerText = score; // עדכון ניקוד

        slideAndGenerateCandy(); // להזיז את הסוכריות וליצור סוכריות חדשות במידה וצריך  
        if (FindPossibleMove) {
            FindPossibleMove = false;
            setTimeout(findPossibleMove, 5000); // השהיה של 2 שניות לפני הפעלת findPossibleMove
        }
        if (isSwapping || gameSessionActions?.isClosing()) return;//isSwapping נועד לאפשר הזדמנות אחרונה כשיש ניצחון במהלך האחרון
        if (goalCount <= 0) {
            finishGame('win', "Congratulations! You completed the goal.");
        } else if (attemptsCount <= 0) {
            finishGame('loss', "Game Over! You have run out of attempts.");
        }
    }, 100);

    //clearInterval(intervalId);  עוצר את הפעולה

}


function randomCandy() {
    return candies[Math.floor(Math.random() * candies.length)]; // בוחר סוכריה אקראית מתוך הרשימה
}

//=======================================================================================
//בדיקת הלוח ע''י AI
//=======================================================================================

function findPossibleMove() {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let currentCandy = getCandyType(board[r][c]); // סוג הסוכרייה הנוכחית

            if (currentCandy.includes("blank")) continue; // מדלג על מקומות ריקים

            let directions = [
                { dr: -1, dc: 0 }, // למעלה
                { dr: 1, dc: 0 },  // למטה
                { dr: 0, dc: -1 }, // שמאלה
                { dr: 0, dc: 1 }   // ימינה
            ];

            for (let { dr, dc } of directions) {
                let newRow = r + dr;
                let newCol = c + dc;

                // לבדוק שהמיקום החדש חוקי
                if (newRow < 0 || newRow >= rows || newCol < 0 || newCol >= columns) continue;

                let neighborCandy = getCandyType(board[newRow][newCol]); // סוג השכן

                if (neighborCandy.includes("blank")) continue; // לא מזיזים לריק

                // לבדוק אם הזזה תיצור רצף
                // לבדוק אם הזזה תיצור רצף
                if (checkPotentialMatch(r, c, newRow, newCol)) {
                    console.log({ from: { r, c }, to: { r: newRow, c: newCol } });
                    findMove = [r, c];
                    board[r][c].classList.add('bounce');
                    return;
                }
            }
        }
    }
    return null; // אין מהלך אפשרי
}

function checkPotentialMatch(r1, c1, r2, c2) {
    let tempBoard = board.map(row => row.map(cell => getCandyType(cell))); // יצירת העתק של הלוח

    // ביצוע "החלפה זמנית" על ההעתק
    [tempBoard[r1][c1], tempBoard[r2][c2]] = [tempBoard[r2][c2], tempBoard[r1][c1]];

    // בדיקה אם נוצר רצף אופקי או אנכי
    return checkMatchInBoard(tempBoard);
}

function checkMatchInBoard(tempBoard) {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            if (tempBoard[r][c] === tempBoard[r][c + 1] && tempBoard[r][c] === tempBoard[r][c + 2] && !tempBoard[r][c].includes("blank")) {
                return true;
            }
        }
    }

    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            if (tempBoard[r][c] === tempBoard[r + 1][c] && tempBoard[r][c] === tempBoard[r + 2][c] && !tempBoard[r][c].includes("blank")) {
                return true;
            }
        }
    }
    return false;
}






//=======================================================================================
//יצירת הלוח
//=======================================================================================

//יצירת האלמנטים בלוח
function startGame() {
    for (let r = 0; r < rows; r++) { // עבור כל שורה
        let row = []; // יצירת שורה חדשה
        for (let c = 0; c < columns; c++) { // עבור כל עמודה בשורה
            let tile = document.createElement("img"); // יצירת אלמנט img (תמונה)
            tile.id = r.toString() + "-" + c.toString(); // קביעת מזהה ייחודי לכל סוכריה לפי מיקומה
            tile.src = "./images/" + randomCandy() + ".png"; // הגדרת תמונה אקראית לכל סוכריה

            // פונקציות לגרירת סוכריות
            tile.addEventListener("click", click); // לחיצה על סוכריה
            tile.addEventListener("dragstart", dragStart); // התחלת גרירה של סוכריה
            tile.addEventListener("dragover", dragOver);  // גרירת סוכריה לעבר סוכריה אחרת
            tile.addEventListener("dragenter", dragEnter); // הגעת סוכריה לאזור של סוכריה אחרת
            tile.addEventListener("dragleave", dragLeave); // עזיבת סוכריה
            tile.addEventListener("drop", dragDrop); // הורדת סוכריה מעל סוכריה אחרת
            tile.addEventListener("dragend", dragEnd); // סיום תהליך הגרירה

            document.getElementById("board").append(tile); // הוספת התמונה ללוח המשחק
            row.push(tile); // הוספת התמונה לשורה
        }
        board.push(row); // הוספת השורה ללוח
    }

    console.log(board); // הדפסת הלוח למעקב
}
function click() {

    this.classList.add('bounce');
    setTimeout(() => {
        this.classList.remove('bounce');
    }, 500);
}

function dragStart() {
    if (!isSwapping) {  //התנאי מונע מצב שבו האובייקט נדרס בזמן ההמתנה להחלפה
        currTile = this; // שמירת הסוכריה שמתחילים לגרור
    }
    if (findMove && !FindPossibleMove) {
        board[findMove[0]][findMove[1]].classList.remove('bounce');
    }
}

function dragOver(e) {
    e.preventDefault(); // מניעת ברירת המחדל של הדפדפן (הסוכריה לא תיפול בצורה אוטומטית)
}

function dragEnter(e) {
    e.preventDefault(); // מניעת ברירת המחדל של הדפדפן (כדי שנוכל לגרור)
}

function dragLeave() {
    // אין פעולה ספציפית כאן
}

function dragDrop() {
    if (!isSwapping) { //התנאי מונע מצב שבו האובייקט נדרס בזמן ההמתנה להחלפה
        otherTile = this; // הסוכריה שנגרר עליה
    }

}


//הוזזה אלמנט ידנית
async function dragEnd() {
    if (currTile.src.includes("blank") || otherTile.src.includes("blank")) { // אם יש סוכריה ריקה (blank), לא נבצע כלום
        return;
    }

    FindPossibleMove = true;

    let currCoords = currTile.id.split("-"); // מזהה את המיקום של הסוכריה שנגררה
    let r = parseInt(currCoords[0]); // שורה של הסוכריה הנגררת
    let c = parseInt(currCoords[1]); // עמודה של הסוכריה הנגררת

    let otherCoords = otherTile.id.split("-"); // מזהה את המיקום של הסוכריה שנפלה עליה
    let r2 = parseInt(otherCoords[0]); // שורה של הסוכריה שהשארת עליה
    let c2 = parseInt(otherCoords[1]); // עמודה של הסוכריה שהשארת עליה

    let moveLeft = c2 == c - 1 && r == r2; // בדיקה אם נגרר שמאלה
    let moveRight = c2 == c + 1 && r == r2; // בדיקה אם נגרר ימינה
    let moveUp = r2 == r - 1 && c == c2; // בדיקה אם נגרר למעלה
    let moveDown = r2 == r + 1 && c == c2; // בדיקה אם נגרר למטה

    let isAdjacent = moveLeft || moveRight || moveUp || moveDown; // האם הסוכריות צמודות אחת לשניה?

    if (isAdjacent && !isSwapping) { // אם הסוכריות צמודות, נבצע את ההחלפה
        attempts.innerText = --attemptsCount;// הורדת ניסיון
        isSwapping = true; // נועל כניסה עד שיסתיים הפעולה
        await swapImages(currTile, otherTile); // מחכה להשלמת האנימציה
        let validMove = checkValid(); // לבדוק אם ההחלפה חוקית

        if (currTile.src.includes("Choco") && otherTile.src.includes("Choco")) {//Choco שלא יהיה שגיאה כששניהם 
            await swapImages(currTile, otherTile);
        }
        else if (currTile.src.includes("Choco") || otherTile.src.includes("Choco")) {
            if (currTile.src.includes("Choco")) {
                findMatchingCandies(otherTile, currTile);
            }
            else {
                findMatchingCandies(currTile, otherTile);
            }
        }


        if (!validMove) { // אם ההחלפה לא חוקית, נחזיר את המצב לקדמותו
            await swapImages(currTile, otherTile);
        }
        isSwapping = false; // מאפשר כניסה חדשה
    }
}

// Choco רץ על כל הלוח למצוא התאמה בשביל סוכריה 
function findMatchingCandies(targetColor, Choco) {
    if (Choco && Choco.src) {
        Choco.src = "./images/blank.png";
    }
    targetColor = getCandyType(targetColor);
    let candiesToCrush = new Set();

    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let candySrc = getCandyType(board[r][c]);// שמירת סוג הסוכריה הנוכחית
            if (candySrc.includes("blank")) { // אם זה תא ריק (blank), ממשיכים הלאה
                continue;
            }
            if (candySrc.includes(targetColor)) { // בדיקה אם הצבע תואם
                let position = `${r}-${c}`;
                candiesToCrush.add(position);
            }
        }
    }
    CandiesToCrush(candiesToCrush, HorizontalOrVertical = null, flagStriped = false, flagChoco = false);
}

//תזוזה חלקה ואיטית לפי פיקסלים
function swapImages(currTile, otherTile) {
    return new Promise((resolve) => { // יצירת Promise כדי שנוכל לחכות להשלמת האנימציה
        const currRect = currTile.getBoundingClientRect();
        const otherRect = otherTile.getBoundingClientRect();

        const deltaX = otherRect.left - currRect.left;
        const deltaY = otherRect.top - currRect.top;

        let step = 0;
        let steps = 20; // מספר השלבים עד שהתזוזה תושלם
        let animationSpeed = 10; // כל כמה מילי-שניות לרענן את התנועה

        function animate() {
            if (step >= steps) {
                // סיום האנימציה, מחליפים את התמונות ומנקים את הטרנספורמציה
                let currImg = currTile.src;
                let otherImg = otherTile.src;
                currTile.src = otherImg;
                otherTile.src = currImg;

                currTile.style.transform = "";
                otherTile.style.transform = "";

                resolve(); // מסמן שהאנימציה הסתיימה
                return;
            }

            let progress = step / steps; // התקדמות חלקה בין 0 ל-1
            currTile.style.transform = `translate(${deltaX * progress}px, ${deltaY * progress}px)`;
            otherTile.style.transform = `translate(${-deltaX * progress}px, ${-deltaY * progress}px)`;

            step++;
            setTimeout(() => requestAnimationFrame(animate), animationSpeed);
        }
        animate();
    });
}

function findCandySequences(direction, candiesToCrush) {
    // 'horizontal' או 'vertical' כדי לקבוע אם מחפשים לפי שורות או עמודות
    //אובייקט שיכיל את שלושת הנתונים שיחזרו מהפעולה ויגלו היכן נמצא הרצף
    let result = {
        HorizontalOrVertical: '',
        flagStriped: false,
        flagChoco: false
    };
    const limitPrimary = direction === 'horizontal' ? rows : columns;
    const limit = direction === 'horizontal' ? columns : rows;// הגדרת גבולות החיפוש לפי כיוון
    for (let i = 0; i < limitPrimary; i++) {
        let start = 0; // משתנה שמתחיל את החיפוש
        while (start < limit) { //  מעבר על כל השורה או העמודה הנוכחית
            let candySrc = getCandyType(direction === 'horizontal' ? board[i][start] : board[start][i]);

            if (candySrc.includes("blank")) { // אם זה תא ריק (blank), ממשיכים הלאה
                start++;
                continue;
            }

            let end = start; // משתנה שימצא את סוף הרצף של הסוכריות הזהות
            while (end < limit && (direction === 'horizontal' ? board[i][end].src.includes(candySrc) : board[end][i].src.includes(candySrc))) {
                end++;
            }

            if (end - start >= 3) { // אם מצאנו רצף של 3 סוכריות או יותר
                for (let idx = start; idx < end; idx++) {
                    candiesToCrush.add(`${direction === 'horizontal' ? i : idx}-${direction === 'horizontal' ? idx : i}`);
                }

                // עדכון ה-flag בהתאם לכיוון
                result.HorizontalOrVertical = direction === 'horizontal' ? 'Horizontal' : 'Vertical';

                if (end - start >= 4)
                    result.flagStriped = true;
                if (end - start >= 5)
                    result.flagChoco = true;
            }
            start = end;
        }
    }
    return result; // מחזירים את האובייקט
}




// נבדוק אם יש סוכריות ברציפות - כמה שיש עד הסוף
//O(N × M) סיבוכיות זמן
function crushCandy() {
    let candiesToCrush = new Set(); //  יצירת קבוצה (Set) לשמירת מיקומי הסוכריות שצריך למחוק (למניעת כפילויות)
    let HorizontalOrVertical; // משתנה ששומר בשביל ליצור לאורך ולרוחב את הסוכריה המיוחדת בהרס של 4
    let flagStriped = false;//משתנה בשביל סוכריה מיוחדת לאחר שנהרסו 4 מאותו הסוג
    let flagChoco = false; //לאחר שנהרסו 5 מאותו סוג Choco משתנה בשביל סוכריה
    let resultHorizontal = findCandySequences('horizontal', candiesToCrush);
    let resultVertical = findCandySequences('vertical', candiesToCrush);
    // עדכון המשתנים לפי התוצאות
    HorizontalOrVertical = resultHorizontal.HorizontalOrVertical || resultVertical.HorizontalOrVertical;
    flagStriped = resultHorizontal.flagStriped || resultVertical.flagStriped;
    flagChoco = resultHorizontal.flagChoco || resultVertical.flagChoco;
    //  מחיקת כל הסוכריות שסומנו
    CandiesToCrush(candiesToCrush, HorizontalOrVertical, flagStriped, flagChoco);

    score += candiesToCrush.size * 10; // עדכון הניקוד (10 נקודות לכל סוכריה)
    goal.innerText = goalCount;
}

//  מחיקת כל הסוכריות שסומנו
function CandiesToCrush(candiesToCrush, HorizontalOrVertical, flagStriped, flagChoco) {
    let CountCandiesToCrush = 0; //שדרוג הסוכריה תהיה בכל פעם במיקום שונה
    let randomIndex = Math.floor(Math.random() * candiesToCrush.size);

    let flag = true;
    candiesToCrush.forEach(pos => {
        let [r, c] = pos.split("-").map(Number); // פירוק מחרוזת המיקום לשורה ועמודה
        let candySrc = board[r][c]; // שמירה של סוג הסוכריה שנמצאת במיקום
        if (candySrc.src.includes("blank")) { // אם זה תא ריק (blank), ממשיכים הלאה
            return;
        }

        if (candySrc.src.includes(goalCandy)) { // אם הסוכריה היא מסוג שצריך במשחק למחוק
            goalCount--; // עדכון המונה
        }

        if (candySrc.src.includes("Striped")) { //אם כבר הסוכריה היא סופר שלא יהיה שגיאה בהמשך
            flag = false;
            Striped(candiesToCrush, candySrc, r, c);
        }
        // סוכריה שנוצרת בהרס 5 מאותו סוג, וכשנהרסת היא הורסת את אותו הסוג בכל הלוח
        if (flagChoco && randomIndex == CountCandiesToCrush && flag) {
            candySrc.src = `./images/Choco.png`;
            flag = false;
            score += 20;//תוספת ניקוד
        }
        // רק פעם אחת שדרוג לסוכריה מיוחדת
        else if (flagStriped && randomIndex == CountCandiesToCrush && flag) {
            let color = candySrc.src.split('/').pop().split('.')[0]; // חילוץ הצבע מהשם
            candySrc.src = `./images/${color}-Striped-${HorizontalOrVertical}.png`;
            score += 10;//תוספת ניקוד
            flag = false;
        }
        else {
            candySrc.src = "./images/blank.png"; // מחיקת הסוכריה (החלפתה בתמונה ריקה)
            candySrc.style.opacity = 0.5;  // שקוף אחרי החלפת התמונה
        }
        CountCandiesToCrush++;
    });
}

//סוכריה מיוחדת שהורסת את כל השורה או העמודה
function Striped(candiesToCrush, candySrc, r, c) {
    if (candySrc.src.includes("Horizontal")) {
        for (let col = 0; col < columns; col++) {
            let position = `${r}-${col}`;
            if (board[r][col].src.includes("blank")) { // אם זה תא ריק (blank), ממשיכים הלאה
                continue;
            }
            if (board[r][col].src.includes('Choco')) { //Choco שולח את הסוכריה שהרסה את  
                findMatchingCandies(candySrc);
            }
            if (!candiesToCrush.has(position)) { //דלג על מקום שכבר קיים באוסף נתונים
                candiesToCrush.add(position);
                candySrc.src = "./images/blank.png"; // מחיקת הסוכריה (החלפתה בתמונה ריקה)
                candySrc.style.opacity = 0.5;  // שקוף אחרי החלפת התמונה
            }
        }
    }
    else if (candySrc.src.includes("Striped-Vertical")) {
        for (let row = 0; row < rows; row++) {
            let position = `${row}-${c}`;
            if (board[row][c].src.includes("blank")) { // אם זה תא ריק (blank), ממשיכים הלאה
                continue;
            }
            if (board[row][c].src.includes('Choco')) {
                findMatchingCandies(candySrc);
            }
            if (!candiesToCrush.has(position)) {
                candiesToCrush.add(position);
                candySrc.src = "./images/blank.png"; // מחיקת הסוכריה (החלפתה בתמונה ריקה)
                candySrc.style.opacity = 0.5;  // שקוף אחרי החלפת התמונה
            }
        }
    }
}

//
function checkBoardForTriggeredCandies(triggerSource) {
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
            let candySrc = board[r][c].src.split('/').pop().split('.')[0];
            let candyType = getCandyType(candySrc);

            if (candyType.includes(triggerSource)) {
                if (candySrc.includes('Striped')) {
                    if (candySrc.src.includes("Horizontal")) {
                        for (let col = 0; col < columns; col++) {
                            let position = `${r}-${col}`;
                            if (!candiesToCrush.has(position)) { //דלג על מקום שכבר קיים באוסף נתונים
                                candiesToCrush.add(position);
                            }
                        }
                    }
                    else if (candySrc.src.includes("Striped-Vertical")) {
                        for (let row = 0; row < rows; row++) {
                            let position = `${row}-${c}`;
                            if (!candiesToCrush.has(position)) {
                                candiesToCrush.add(position);
                            }
                        }
                    }
                }

                candySrc.src = "./images/blank.png"; // מחיקת הסוכריה (החלפתה בתמונה ריקה)
                candySrc.style.opacity = 0.5;  // שקוף אחרי החלפת התמונה
            }
        }
    }
}






// בדיקת חוקיות ההחלפה
function checkValid() {
    //בדיקה לשורות
    for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns - 2; c++) {
            let candy1 = getCandyType(board[r][c]);
            let candy2 = getCandyType(board[r][c + 1]);
            let candy3 = getCandyType(board[r][c + 2]);
            if (candy1 == candy2 && candy2 == candy3 && !candy1.includes("blank")) {
                return true; // אם מצאנו רצף, ההחלפה חוקית
            }

            //סוכריה קוקו
            if ((candy1.includes('Choco') || candy2.includes('Choco') || candy3.includes('Choco')) && !candy1.includes("blank")) {
                if (candy1 == candy2 || candy2 == candy3 || candy1 == candy3) {
                    return true;

                }
            }

        }
    }

    // בדיקה לעמודות
    for (let c = 0; c < columns; c++) {
        for (let r = 0; r < rows - 2; r++) {
            let candy1 = getCandyType(board[r][c]);
            let candy2 = getCandyType(board[r + 1][c]);
            let candy3 = getCandyType(board[r + 2][c]);
            if (candy1 == candy2 && candy2 == candy3 && !candy1.includes("blank")) {
                return true; // אם מצאנו רצף, ההחלפה חוקית
            }

            //סוכריה קוקו
            if ((candy1.includes('Choco') || candy2.includes('Choco') || candy3.includes('Choco')) && !candy1.includes("blank")) {
                if (candy1 == candy2 || candy2 == candy3 || candy1 == candy3) {
                    return true;

                }
            }
        }
    }
    return false; // אם לא מצאנו רצפים, ההחלפה לא חוקית
}

//מחזיר את שם הסוכריה
function getCandyType(candy) {
    candy = candy.src.split('/').pop().split('.')[0];
    if (candy.includes('-')) { // אם זה סוכריה מיוחדת
        candy = candy.split('-')[0]; // מחלק לפי "-" ומחזיר את המילה הראשונה
    }
    return candy;
}

function slideAndGenerateCandy() {
    for (let c = 0; c < columns; c++) {
        let ind = rows - 1; // האינדקס שבו הסוכריות יתחילו להתפנות
        for (let r = columns - 1; r >= 0; r--) { // עבור כל עמודה
            if (!board[r][c].src.includes("blank")) { // אם התמונה אינה ריקה
                board[ind][c].src = board[r][c].src; // הזז את הסוכריה למקום פנוי
                board[r][c].style.opacity = 1;  // שקוף אחרי החלפת התמונה

                ind -= 1; // עדכון אינדקס
            }
        }

        for (let r = ind; r >= 0; r--) {
            board[r][c].src = "./images/blank.png"; // מלא את המקום הפנוי בסוכריה ריקה
            board[r][c].style.opacity = 0.5;  // שקוף אחרי החלפת התמונה
        }
    }


    for (let c = 0; c < columns; c++) {
        if (board[0][c].src.includes("blank")) { // אם יש מקום פנוי למעלה
            board[0][c].src = "./images/" + randomCandy() + ".png"; // הנח סוכריה חדשה
        }
    }
}








// פונקציה להתחלת משימה חדשה
function resetGoal() {
    goalCandy = randomCandy();
    goalCount = 20;
    score = 0;
    document.getElementById("goal-image").src = `./images/${goalCandy}.png`;
    goal.innerText = goalCount;

    attemptsCount = 20;
    attempts.innerText = attemptsCount;


}

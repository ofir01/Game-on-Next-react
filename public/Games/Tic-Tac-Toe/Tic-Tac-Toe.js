// משתני המשחק
let currentPlayer = Math.random() < 0.5 ? 'X' : 'O'; // הגרלה ראשונית מי מתחיל
let board = new Array(9).fill(null); // ריבועי הלוח
let scores = { 'X': 0, 'O': 0, 'draws': 0 }; // שומר תוצאות המשחק
let selectedPiece = null; // תור השחקן
let availablePieces = {  // כמות הכלים לכל שחקן
    'X': [1, 2, 3, 4, 5],
    'O': [1, 2, 3, 4, 5]
};

// האלמנטים
const boardElement = document.getElementById("board"); // מרכז המשחק - הריבועים 
const statusElement = document.getElementById("status"); // הכרזה בסיום המשחק
const scoreElement = document.getElementById("score"); // כותרת הניקוד
const playerXPanel = document.getElementById("playerX-panel"); // החלקים בצדדים
const playerOPanel = document.getElementById("playerO-panel"); // החלקים בצדדים
let gameActive = true; // עוצר את המשחק

// מכריז תור של מי
function updateStatus() {
    statusElement.textContent = `תור של ${currentPlayer}`;
    statusElement.className = currentPlayer === 'X' ? 'x-turn' : 'o-turn';
}

// יוצר את ריבועי הלוח 
function createBoard() {
    boardElement.innerHTML = ''; // ניקוי מקום הריבועים
    // יצירת ריבועי הלוח
    board.forEach((cell, index) => {
        const cellElement = document.createElement("div");
        cellElement.classList.add("cell");
        cellElement.dataset.index = index;
        if (cell) {
            cellElement.textContent = cell.player;
            cellElement.style.fontSize = `${cell.value + 1}em`;
            cellElement.classList.add(cell.player.toLowerCase());
        }
        cellElement.addEventListener("click", handleMove); // מוסיף מאזין ללחיצה
        boardElement.appendChild(cellElement);
    });
}

// יוצר את החלקים בצדדים
function createPieces() {
    playerXPanel.innerHTML = '';
    playerOPanel.innerHTML = '';
    availablePieces['X'].forEach(size => {
        const piece = document.createElement("div");
        piece.textContent = 'X';
        piece.classList.add("piece", "x");
        piece.style.fontSize = `${size + 0.5}em`; // גודל
        piece.addEventListener("click", () => selectPiece('X', size, piece));
        playerXPanel.appendChild(piece);
    });
    availablePieces['O'].forEach(size => {
        const piece = document.createElement("div");
        piece.textContent = 'O';
        piece.classList.add("piece", "o");
        piece.style.fontSize = `${size + 0.5}em`;
        piece.addEventListener("click", () => selectPiece('O', size, piece));
        playerOPanel.appendChild(piece);
    });
}

// מאשר את הבחירה כאשר תורו של אותו שחקן
function selectPiece(player, size, element) {
    if (currentPlayer === player) {
        // מסירים הדגשה מכל החתיכות של אותו שחקן
        const pieces = document.querySelectorAll(`.piece.${player.toLowerCase()}`);
        pieces.forEach(piece => piece.classList.remove("selected"));
        
        // מוסיפים הדגשה לחתיכה שנלחצה
        element.classList.add("selected");
        selectedPiece = { player, size, element };
    } else {
        // אם נלחץ על חתיכה שלא שייכת לתור הנוכחי 
        element.classList.add("error");
        setTimeout(() => element.classList.remove("error"), 500);
    }
}


//פעולה שמבצעת את החישובים בהנחת הכלי על הלוח

function handleMove(event) {
    const index = event.target.dataset.index;
    if (!gameActive || !selectedPiece) return;
    // בדיקה אם התא פנוי או שניתן להחליף לפי גודל החתיכה
    if (!board[index] || (board[index].player !== selectedPiece.player && board[index].value < selectedPiece.size)) {
        board[index] = { player: selectedPiece.player, value: selectedPiece.size };//יצירת אובייקט
        createBoard(); //מסמן את החלק שהונח
        selectedPiece.element.classList.remove("selected");//הסרת הדגש לאחר הנחת החלק

        const winnerCells = checkWinner();
        selectedPiece.element.classList.add("disabled");  // מסמנים את החלק ששומש ולא מאפשרים לחיצה נוספת עליו
        availablePieces[selectedPiece.player] = availablePieces[selectedPiece.player].filter(s => s !== selectedPiece.size);

        // טיפול במצב ניצחון
        if (winnerCells.length > 0) {
            gameActive = false;
            updateScore(); // עדכון הניקוד
            highlightWinner(winnerCells); // צבע הסט
            scores[selectedPiece.player]++;
            selectedPiece = null;
            statusElement.textContent = `! ${currentPlayer} ניצח השחקן!`;
            lockAllPieces();// נעילת הכלים
            return;
        }
        // לבדיקת תיקו - בודקים שנגמרו הכלים לשני השחקנים
        if (availablePieces['X'].length == 0 && availablePieces['O'].length == 0) {
            statusElement.textContent = "תיקו!";
            statusElement.className = "draw"; // צבע אפור
            scores.draws++;
            updateScore();
            gameActive = false;
            selectedPiece = null;
            return;
        }

        
        currentPlayer = currentPlayer === 'X' ? 'O' : 'X';// מעבר לתור השחקן הבא
        selectedPiece = null;//איפוס המשתנה שמחזיק את החלק שהונח
        updateStatus();
    }
}

//בלבד player  פונקציה לבדיקת ניצחון - השוואה לפי מאפיין 
//בגלל שאי אפשר להשוות בגדלים שונים, לכן נבדוק את תכונת הסימן
function checkWinner() {
    const winningCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];
    let winningCells = [];
    winningCombinations.forEach(combination => {
        const [a, b, c] = combination;
        if (
            board[a] && board[b] && board[c] &&
            board[a].player === board[b].player &&
            board[a].player === board[c].player
        ) {
            winningCells = [...winningCells, ...combination];
        }
    });
    return [...new Set(winningCells)];
}

// מסמן את תאי הניצחון בצהוב
function highlightWinner(cells) {
    cells.forEach(index => {
        const cell = document.querySelector(`[data-index='${index}']`);
        cell.classList.add("winner");
    });
}

// עדכון ניקוד
function updateScore() {
    scoreElement.textContent = `X: ${scores['X']} | O: ${scores['O']} | תיקו: ${scores['draws']}`;
}

// איפוס המשחק ושחרור החסימה של האלמנטים
function resetGame() {
    board = new Array(9).fill(null);
    // אתחול מחודש של החלקים
    availablePieces = {
        'X': [1, 2, 3, 4, 5],
        'O': [1, 2, 3, 4, 5]
    };
    currentPlayer = Math.random() < 0.5 ? 'X' : 'O';
    gameActive = true;
    updateStatus();
    createBoard();
    createPieces();
}

//נעילת כל החלקים
const lockAllPieces = () => {
    const allPieces = document.querySelectorAll("#playerX-panel .piece, #playerO-panel .piece");
    allPieces.forEach(piece => {
        piece.classList.add("disabled");
    });
};

updateStatus();
createBoard();
createPieces();

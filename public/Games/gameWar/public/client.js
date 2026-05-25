let myPlayerNumber = null;

const socket = io();
socket.on('joined', (data) => {
    console.log('You joined as a player: ', data.playerNumber);
    myPlayerNumber = data.playerNumber;
    //const player = new Player(socket.id, `Player ${data.playerNumber}`);

});

socket.on('full', () => {
    alert('החדר מלא!');
});

socket.on('onePlayer', () => {
    alert('Waiting for the second player to connect');
});



socket.on("startGame", ({ myDeck, opponentDeck }) => {
    // שמור מי אני ומי היריב
    const me = myPlayerNumber;
    const opponent = myPlayerNumber === 1 ? 2 : 1;

    console.log('Starting game for player:', me, 'against player:', opponent);
    // נניח containerRight זה הצד שלי, containerLeft זה היריב
    myDeck.forEach((imgPath) => {
        createSquare(imgPath, containerRight, 'red 2px solid', opponent);
    });

    opponentDeck.forEach((imgPath) => {
        createSquare(imgPath, containerLeft, 'blue 2px solid', me);
    });

    // הסתר קלפים של היריב
    const enemyCards = document.querySelectorAll(`.square[data-owner="${opponent}"] img`);
    enemyCards.forEach(img => img.style.visibility = 'hidden');

    // חשוף קלפים שלי
    const myCards = document.querySelectorAll(`.square[data-owner="${me}"] img`);
    myCards.forEach(img => img.style.visibility = 'visible');
});





const containerRight = document.querySelector('.right');
const containerLeft = document.querySelector('.left');





//let player1 = new Player(1, 'Player 1'); // יצירת שחקן 1
//let player2 = new Player(2, 'Player 2'); // יצירת שחקן 2





// פונקציה ליצירת ריבועי המשחק
function createSquare(image, container, borderColor, ownerPlayer) {
    const square = document.createElement('div');
    square.classList.add('square');
    square.setAttribute('data-id', image.match(/\d+/)); // הוספת מזהה ייחודי לכל ריבוע
    square.style.border = `${borderColor}`;
    square.setAttribute('data-owner', ownerPlayer); // מי הבעלים של הקלף
    if (borderColor === 'blue 2px solid') {
        square.classList.add('active');
    }
    const imgs = document.createElement('img');
    imgs.src = `${image}`;

    square.appendChild(imgs);
    container.appendChild(square);
    addClickListener(square); // הוספת מאזין ללחיצה על התמונה

}

//פונקציה להוספת מאזין לכל תמונה
function addClickListener(square) {
    square.addEventListener('click', () => {
        const cardId = square.getAttribute('data-id');
        const owner = parseInt(square.getAttribute('data-owner'));

        // אם זה הקלף של היריב, נחשוף רק אצלנו
        if (owner !== myPlayerNumber) {
            square.classList.add('active');
            square.classList.add('exposed');
            square.querySelector('img').style.visibility = 'visible';
            return;
        }

        // אם זה הקלף שלנו, נשלח לשרת כדי שייחשף אצל היריב
        socket.emit('card-flipped', { cardId, owner });

    });
}


// מצא את הקלף עם ה-id המתאים וחשוף אותו
socket.on('card-flipped', ({ cardId, owner }) => {
    // נמצא את הקלף של היריב בלבד (כלומר: זה שלא שלי)
    const otherCard = document.querySelector(`.square[data-id="${cardId}"][data-owner="${myPlayerNumber === 1 ? 2 : 1}"]`);
    if (otherCard && !otherCard.classList.contains('active')) {
        otherCard.classList.add('active');
        otherCard.classList.add('exposed');
        otherCard.querySelector('img').style.visibility = 'visible';
        
    }
});



socket.on('opponent-disconnected', () => {
    alert("היריב שלך התנתק מהמשחק.");
});

// החלק של יצירת אפקט אור-----------------------------------------------------------------------------------------
let currentGlow = null;

const playerPositions = {
    1: { x: 930, y: 370 },
    2: { x: 550, y: 370 }
};

// פונקציה ליצירת אפקט אור
function createGlow(x, y, size = 100) {
    const glow = document.createElement("div");
    glow.className = "glow-effect";

    glow.style.width = `${size}px`;
    glow.style.height = `${size}px`;
    glow.style.left = `${x - size / 2}px`;
    glow.style.top = `${y - size / 2}px`;

    document.body.appendChild(glow);
    return glow;
}

//החלפת תורות
function switchTurn() {
    // הסרת האור הקודם אם קיים
    if (currentGlow) {
        currentGlow.remove();
        currentGlow = null;
    }

    // החלפת תור
    if (myPlayerNumber === 1) {
        myPlayerNumber = 2;
    } else {
        myPlayerNumber = 1;
    }

    // יצירת אור חדש לשחקן החדש
    const pos = playerPositions[myPlayerNumber];
    currentGlow = createGlow(pos.x, pos.y);

    console.log(`It's now player ${myPlayerNumber}'s turn.`);
}


switchTurn()
// כל שנייה מחליפים תור
//setInterval(switchTurn, 3000);

//--------------------------------------------------------------------------------------------------------------


/*
function switchTurn() {
    const activeSquares = document.querySelectorAll('.square.active');
    activeSquares.forEach(square => {
        square.classList.remove('active');
        square.querySelector('img').style.visibility = 'hidden'; // הסתר את התמונה
    });

    // החלפת תור בין השחקנים
    myPlayerNumber = myPlayerNumber === 1 ? 2 : 1;
    console.log(`It's now player ${myPlayerNumber}'s turn.`);
    const borderColor = myPlayerNumber === 1 ? 'red 2px solid' : 'blue 2px solid';
    const squares = document.querySelectorAll(`.square[data-owner="${myPlayerNumber}"]`);
    squares.forEach(square => {
        square.style.border = borderColor; // שינוי צבע הגבול של הקלפים של השחקן בתור
        square.classList.add('active'); // הוספת מחלקת הפעיל
        square.querySelector('img').style.visibility = 'visible'; // חשיפת התמונה
    }
    );
    createGlow(Math.random() * window.innerWidth, Math.random() * window.innerHeight);
    console.log('Glow effect created at random position.');
    socket.emit('turn-switched', { playerNumber: myPlayerNumber }); // שליחת הודעה לשרת על החלפת התור
    // הוספת אפקט אור
    const glowSize = 100; // גודל האפקט
    createGlow(Math.random() * window.innerWidth, Math.random() * window.innerHeight, glowSize);
    console.log(`Glow effect created at random position for player ${myPlayerNumber}.`);    

}
    */

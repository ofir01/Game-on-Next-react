
class CardItem {
    constructor(name, image) {
        this.name = name; // שם הזוג
        this.image = image; // נתיב התמונה או אימוג'י
    }
}


//מגביל רק לכמות מסוימת את החלקים
function getRandomItems(arr, count) {
    const shuffled = arr.slice().sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}


function Mode(difficulty) {
    let titleElement = document.getElementById('Title');
    let mode;
    if (difficulty === "easy") {
        mode = [
            new CardItem("smile", "😊"),
            new CardItem("grin", "😁"),
            new CardItem("cry", "😢"),
            new CardItem("heart", "❤"),
            new CardItem("rose", "🌹"),
            new CardItem("peace", "✌"),
            new CardItem("laugh", "😂"),
            new CardItem("wink", "😉"),
            new CardItem("thumbs_up", "👍"),
            new CardItem("thumbs_down", "👎"),
            new CardItem("clap", "👏"),
            new CardItem("fire", "🔥"),
            new CardItem("star", "⭐"),
            new CardItem("ok_hand", "👌"),
            new CardItem("sunglasses", "😎"),
            new CardItem("thinking", "🤔"),
            new CardItem("sleeping", "😴"),
            new CardItem("angry", "😠"),
            new CardItem("surprised", "😮"),
            new CardItem("confused", "😕"),
            new CardItem("kiss", "😘"),
            new CardItem("hug", "🤗"),
            new CardItem("party", "🥳"),
            new CardItem("cool", "🆒"),
            new CardItem("poop", "💩"),
            new CardItem("rocket", "🚀"),
            new CardItem("check", "✅"),
            new CardItem("cross", "❌"),
            new CardItem("bell", "🔔"),
            new CardItem("gift", "🎁"),
            new CardItem("music", "🎵"),
            new CardItem("camera", "📷"),
            new CardItem("game", "🎮"),
            new CardItem("ball", "⚽"),
            new CardItem("lightbulb", "💡"),
            new CardItem("lock", "🔒"),
            new CardItem("unlock", "🔓")
        ];
        titleElement.innerText = 'memory Game'; //הוא מאפשר גם עיצובים , textContent בשונה מ
        mode = getRandomItems(mode, 6); // הגבלה לבחור רק כמה מהרשימה
        mode = mode.concat(mode); // שכפול המערך
        // mode = mode.flatMap(card => [card, new CardItem(card.name, card.image)]); // שכפול כל אובייקט בנפרד
    } else {
        mode = [
            new CardItem("compass", "hardMode/compass_1.jpg"),
            new CardItem("compass", "hardMode/compass_2.jpg"),
            new CardItem("laptop", "hardMode/laptop_1.jpg"),
            new CardItem("laptop", "hardMode/laptop_2.jpg"),
            new CardItem("helicopter", "hardMode/helicopter_1.jpg"),
            new CardItem("helicopter", "hardMode/helicopter_2.jpg"),
            new CardItem("key", "hardMode/key_1.jpg"),
            new CardItem("key", "hardMode/key_2.jpg"),
            new CardItem("toothbrush", "hardMode/toothbrush_1.jpg"),
            new CardItem("toothbrush", "hardMode/toothbrush_2.jpg"),
            new CardItem("wheel", "hardMode/wheel_1.jpg"),
            new CardItem("wheel", "hardMode/wheel_2.jpg"),
        ];
        titleElement.innerText = 'Match Flip';

    }
    return mode;
}

let difficulty = sessionStorage.getItem("level");
let cardSet = Mode(difficulty);
let shuffledCards, attemptsCount, successesCount, flippedCards;
const attempts = document.getElementById('attempts');
const successes = document.getElementById('successes');
gameSessionActions = window.GameSessionEvents?.createActions({
    getData: () => ({
        difficulty,
        attemptsLeft: attemptsCount,
        matches: successesCount,
        totalPairs: shuffledCards?.length ? shuffledCards.length / 2 : 0,
    }),
});

//ההגרלה
function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

function initGame() {
    shuffledCards = shuffleArray([...cardSet]);
    attemptsCount = shuffledCards.length;
    successesCount = 0;
    flippedCards = [];
    attempts.textContent = `ניסיונות: ${attemptsCount}`;
    successes.textContent = `התאמות: 0/${shuffledCards.length / 2}`;

    const gameBoard = document.querySelector('.game');
    gameBoard.innerHTML = '';
    gameBoard.classList.remove('gameOver');

    for (let i = 0; i < shuffledCards.length; i++) {
        let card = document.createElement('div');
        card.className = 'card';
        card.dataset.name = shuffledCards[i].name;

        let front = document.createElement('div');
        front.className = 'front';
        front.innerHTML = difficulty === "easy" ? shuffledCards[i].image : `<img src="${shuffledCards[i].image}" alt="${shuffledCards[i].name}">`;

        let back = document.createElement('div');
        back.className = 'back';

        card.appendChild(front);
        card.appendChild(back);

        card.addEventListener('click', () => flipCard(card));
        gameBoard.appendChild(card);
    }
}

function flipCard(card) {
    if (flippedCards.length < 2 && !card.classList.contains('flip')) {
        card.classList.add('flip');
        flippedCards.push(card);
    }

    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 500);
    }
}

function checkMatch() {
    let [first, second] = flippedCards;

    if (first.dataset.name === second.dataset.name) {
        first.classList.add('matched');
        second.classList.add('matched');
        successes.textContent = `התאמות: ${++successesCount}/${shuffledCards.length / 2}`;
    } else {
        first.classList.remove('flip');
        second.classList.remove('flip');
        attempts.textContent = `ניסיונות: ${--attemptsCount}`;

        if (attemptsCount <= 0) {
            gameSessionActions?.finish('loss', {
                difficulty,
                attemptsLeft: attemptsCount,
                matches: successesCount,
            });
            alert('המשחק נגמר! 😢');
            document.querySelector('.game').classList.add('gameOver');
        }
    }
    flippedCards = [];

    if (document.querySelectorAll('.matched').length === shuffledCards.length) {
        gameSessionActions?.finish('win', {
            difficulty,
            attemptsLeft: attemptsCount,
            matches: successesCount,
        });
        alert('Win! 🎉');
    }
}

function resetGame() {
    initGame();
    gameSessionActions?.start();
}

initGame();

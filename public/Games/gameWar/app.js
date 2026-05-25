const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'public')));


const controllersIndex = require('./controllers/Index');


app.get('/', controllersIndex.index);


let players = [];
let maxPlayers = 2; // מספר השחקנים המקסימלי בחדר
let amount = 9;
const deck = loding();

// פונקציה לטעינת התמונות
function loding() {
    const deck = [];
    for (let i = 0; i < amount; i++) {
        deck.push(`/image/${i}.webp`);
    }
    return deck;
}

// פונקציה לערבוב מערך התמונות
function shuffleDeck(originalDeck) {
    const deck = [...originalDeck]; // שכפול — חובה!
    for (let i = deck.length - 1; i > 0; i--) {
        let random = Math.floor(Math.random() * (i + 1));
        [deck[i], deck[random]] = [deck[random], deck[i]];
    }
    return deck;
}







io.on('connection', (socket) => {
    console.log('Player Login:', socket.id);
    console.log('Remaining players:', players.length);

    socket.on('disconnect', () => {
        console.log('Player has logged out:', socket.id);
        players = players.filter(p => p !== socket);
        players.forEach(p => {
            if (p !== socket) {
                p.emit('opponent-disconnected');
            }
        });
    });

    // כשהשחקן חושף קלף שלו => נשלח את החשיפה רק ליריב
    socket.on('card-flipped', ({ cardId, owner }) => {
        const opponent = players.find(p => p !== socket);
        if (opponent) {
            opponent.emit('card-flipped', { cardId, owner });
        }
    });

    if (players.length >= maxPlayers) {
        //socket.emit('full');
        //socket.disconnect();
        //return;
    }
    else if (players.length < maxPlayers) {
        players.push(socket);
        const playerNumber = players.length;
        socket.playerNumber = playerNumber; // שמירת המספר על הסוקט
        socket.emit('joined', { playerNumber });
        console.log('players:', players.map(p => p.id));
        if (players.length == maxPlayers) {
            // אם זה השחקן השני, נשלח הודעה לשניהם שהחדר מלא
            // players.forEach(p => p.emit('full'));
            const deck1 = shuffleDeck(deck);
            const deck2 = shuffleDeck(deck);
            players[0].emit("startGame", {
                myDeck: deck1,
                opponentDeck: deck2
            });

            players[1].emit("startGame", {
                myDeck: deck2,
                opponentDeck: deck1
            });



        } else {
            // אם זה השחקן הראשון, נשלח הודעה  לחכות
            socket.emit('onePlayer');
            return;
        }
    }










});

server.listen(3000, () => {
    console.log('🔥 Server is running on http://localhost:3000');
});

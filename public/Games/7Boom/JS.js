// הוספת מאזין ללחיצה על כל ריבוע
const squares = document.querySelectorAll('.square');
let ArrayPlaces = []; // מערך שמחזיק את המספרים המוגרלים
let numberTags = document.querySelectorAll('.numberTag'); // כל ה-span עם הקלאס "numberTag"
const Level = sessionStorage.getItem("level"); //הגבול של המספרים
let Boomlayer1 = 0;//ניקוד לשחקנים
let WonPlayer1 = 0;//ניקוד לשחקנים
let BoomPlayer2 = 0;//ניקוד לשחקנים
let WonPlayer2 = 0;//ניקוד לשחקנים
let divisibleBy7 = 0;// אפשר ליצור משתנה שמונה מספרים שמתחלקים ב- 7 ללא שארית, ואם אין כאלה בהגרלה אז נרוקן את המערך ושוב פעם נגריל מערך חדש





// קריאה לפונקציה start כשדף נטען
document.addEventListener('DOMContentLoaded', () => {
    gameSessionActions = window.GameSessionEvents?.createActions({
        getData: () => ({
            score: WonPlayer1,
            level: Level,
            boom: Boomlayer1,
        }),
    });


    // הוספת קלאס עם רקע התמונה
    squares.forEach((square) => {
        square.classList.add('img');
    });

    start();

    
});


//פעולה שמגרילה מספרים ושמה במערך
function start() {
    // ביטול הקליקים על הריבוע עד להתחלת המשחק
    squares.forEach((square) => {
        square.style.pointerEvents = "none"; // מניעת קליקים נוספים
    });
    // פעולה שתבוצע אחרי 3 שניות
    setTimeout(() => {
        // הצגת המספרים בריבועים
        numberTags.forEach((square, index) => {
            // חפש מספר אקראי שלא קיים במערך
            while (true) {
                let randomNumber = Math.floor(Math.random() * Level) + 1; // מספר אקראי בין 1 ל-100
                // אם המספר לא נמצא במערך, הוצא אותו מהלולאה
                if (!ArrayPlaces.includes(randomNumber)) {
                    squares[index].style.pointerEvents = "auto"; // במשחק שני יפעיל את הכפתורים ללחיצה
                    squares[index].style.backgroundImage = "";
                    squares[index].style.backgroundColor = "#333333df";
                    squares[index].classList.toggle('active'); // הוספת/הסרת מחלקת 'active'

                    console.log(randomNumber);
                    ArrayPlaces.push(randomNumber); // הוספת המספר למערך
                    square.textContent = randomNumber; // הכנסת המספר המוגרל לכל span
                    break; // יצא מהלולאת while
                }
            }

        });

    }, 3000); // 3000 מילישניות (3 שניות)
}


//  square.classList.toggle('active'); // הוספת סיבוב כשנלחץ
// הוספת מאזין ללחיצה על כל ריבוע
squares.forEach((square) => {
    square.addEventListener('click', () => {
        square.classList.toggle('active'); // הוספת סיבוב כשנלחץ
        const numberTag = square.querySelector('.numberTag'); // גישה ל-span בתוך הריבוע
        const number = parseInt(numberTag.textContent, 10); // המרה למספר שלם
        if (number % 7 === 0) {
            square.style.backgroundImage = "url('image/BOOM.webp')";
            //אם הלחיצה הגיעה מהשחקן הראשון תוסיף לו ניקוד
            document.getElementById('Boom-player1').textContent = ++Boomlayer1;//מונה נצחונות
        } else {
            //הורדת ניקוד על שגיאה עד לאפס
            if (Boomlayer1 > 0) {
                document.getElementById('Boom-player1').textContent = --Boomlayer1;//מונה נצחונות
            }
            square.classList.add('img'); // הוספת קלאס עם רקע התמונה
            square.style.backgroundImage = "url('image/Failure.webp')";
        }
        //לאחר שהתגלה התשובה , המספר ימחק כדי שלא ילחץ שוב
        ArrayPlaces.pop();
        // ביטול אירוע הקליק על הריבוע
        square.style.pointerEvents = "none"; // מניעת קליקים נוספים
        //אם המערך התרוקן, הגרל מספרים חדשים
        if (ArrayPlaces.length == 0)
            start();
    });
});


// הוסף מאזין לאירוע contextmenu (לחיצה על העכבר הימני)
squares.forEach((square) => {
    square.addEventListener("contextmenu", (event) => {
        event.preventDefault(); // מונע את תפריט ההקשר המובנה של הדפדפן
        square.classList.toggle('active'); // הוספת סיבוב כשנלחץ
        const numberTag = square.querySelector('.numberTag'); // גישה ל-span בתוך הריבוע
        const number = parseInt(numberTag.textContent, 10); // המרה למספר שלם
        if (number % 7 !== 0) {
            square.style.backgroundImage = "url('image/WON.webp')";
            //אם הלחיצה הגיעה מהשחקן הראשון תוסיף לו ניקוד
            document.getElementById('Won-player1').textContent = ++WonPlayer1;//מונה נצחונות
            //Boom - אם צבר 5 ניצחונות רגיליים, המר ל
            if (WonPlayer1 == 5) {
                document.getElementById('Boom-player1').textContent = ++Boomlayer1;//מונה נצחונות
                document.getElementById('Won-player1').textContent = WonPlayer1 = 0;//מונה נצחונות
                win();
            }
        } else {
            //הורדת ניקוד על שגיאה עד לאפס
            if (WonPlayer1 > 0) {
                document.getElementById('Won-player1').textContent = --WonPlayer1;//מונה נצחונות
            }
            square.classList.add('img'); // הוספת קלאס עם רקע התמונה
            square.style.backgroundImage = "url('image/FAIL.webp')";
        }
        ArrayPlaces.pop();
        square.style.pointerEvents = "none"; // מניעת קליקים נוספים

        //אם המערך התרוקן, הגרל מספרים חדשים
        if (ArrayPlaces.length == 0)
            start();
    });
});


async function win() {
    await gameSessionActions?.finish('win');
}


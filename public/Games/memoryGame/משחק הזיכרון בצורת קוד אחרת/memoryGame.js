const emojis = ["😊","😁","😁","😊","😢","😢","❤","❤","🌹","🌹","✌","✌"];
var shuf_emojis = emojis.sort(() => (Math.random() > .5) ? 2 : -1); // ערבוב אקראי של האמוג'ים
let attemptsCount = 12;
const attempts = document.getElementById('attempts');
attempts.textContent = `ניסיונות: ${emojis.length}`;    
const successes = document.getElementById('successes');
let successesCount = 0;
successes.textContent = `התאמות: 0/${emojis.length/2}`;    




for (let i = 0; i < emojis.length; i++) {
    let box = document.createElement('div'); // יצירת div חדש לכל קלף
    box.className = 'item'; // הוספת מחלקה עבור CSS
    box.innerHTML = shuf_emojis[i]; // הכנסת האמוג'י לקלף

    box.onclick = function() { // אירוע לחיצה על קלף
        this.classList.add('boxOpen'); // פתיחת הקלף
        setTimeout(function() {
            let openBoxes = document.querySelectorAll('.boxOpen'); // בחירת הקלפים הפתוחים
            if (openBoxes.length > 1) { // אם יש יותר מקלף אחד פתוח
                if (openBoxes[0].innerHTML == openBoxes[1].innerHTML) { // בדיקת התאמה
                    openBoxes[0].classList.add('boxMatch');
                    openBoxes[1].classList.add('boxMatch');
                    openBoxes[0].classList.remove('boxOpen');
                    openBoxes[1].classList.remove('boxOpen');
                    openBoxes[0].classList.add('locked'); // נעילת הקלף
                    openBoxes[1].classList.add('locked'); // נעילת הקלף
                    successes.textContent = `התאמות: ${++successesCount}/${emojis.length/2}`;               

                    if (document.querySelectorAll('.boxMatch').length == emojis.length) {
                        alert('Win'); // ניצחון כאשר כל הקלפים הותאמו
                    }
                } else {
                    openBoxes[0].classList.remove('boxOpen');
                    openBoxes[1].classList.remove('boxOpen'); // סגירת קלפים לא תואמים
                    attempts.textContent = `ניסיונות: ${--attemptsCount}`;               
                 }
            }
        }, 500);
    };
    document.querySelector('.game').appendChild(box); // הוספת הקלף ללוח המשחק

}
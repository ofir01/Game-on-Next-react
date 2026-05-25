let currentOpenSubMenu = null; // משתנה גלובלי לתפריט הפעיל
let clickCount = 0;// משתנה למעקב אחר מספר הלחיצות


/*התפריט הראשון*/
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.toggle('open');
}


/*תת תפריט*/
// פונקציה לניהול לחיצה על תפריט
function toggleSubButtons(button) {
    const parent = button.parentElement;
    let subButtons = parent.querySelector('.sub-buttons'); // חיפוש התת-תפריט של הכפתור

    // סגירת כל התפריטים הפתוחים חוץ מהתפריט שנלחץ
    if (currentOpenSubMenu && currentOpenSubMenu !== subButtons) {
        currentOpenSubMenu.classList.remove('open');
    }

    // הצגת או הסתרת תת-תפריט
    subButtons.classList.toggle('open');
    currentOpenSubMenu = subButtons.classList.contains('open') ? subButtons : null;
}



// פונקציה לסינון הדמויות לפי ערך בתת-תפריט
function filterByAttribute(attribute, value, button) {
    button.disabled = true; // הופך את הכפתור ללא לחיץ, וככה המונה לא מונה כפתור שכבר נלחץ
    document.getElementById('click-counter').textContent = ++clickCount;//מונה נסיונות
    // בדיקה אם הערך שנלחץ תואם לערך של ההגרלה
    characters.forEach((character, index) => {
        const tile = document.getElementById(`tile-${index}`);
        
        if (selectedCharacter[attribute] === value) {
            // אם הערך תואם, השאר את התמונה ללא שינוי והשחר את השאר
            if (character[attribute] !== value) {
                filterCharacters(character);
            }
            // הפיכת הכפתור לירוק
            //button.style.backgroundColor = 'green';
            button.classList.add('button-green'); // כפתור ירוק אם הערך תואם

        } else {
            // אם הערך אינו תואם, השחר רק את התמונות שתואמות לערך שנלחץ
            if (character[attribute] === value) {
                filterCharacters(character);
            }
            // הפיכת הכפתור לאדום
            //button.style.backgroundColor = 'red';
            button.classList.add('button-red'); // כפתור אדום אם הערך לא תואם

        }
    });
}


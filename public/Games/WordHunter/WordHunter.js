
document.addEventListener("DOMContentLoaded", () => {
    const level = sessionStorage.getItem("level") || "easy"; // ברירת מחדל
    const grid = document.querySelector("ul");
    let count = 0;
    if (grid) {
        if (level === "Easy") {
            grid.style.gridTemplateColumns = "repeat(4, 1fr)";
            count = 4;
        } else if (level === "Normal") {
            grid.style.gridTemplateColumns = "repeat(6, 1fr)";
            count = 8;
        } else if (level === "Hard") {
            grid.style.gridTemplateColumns = "repeat(8, 1fr)";
            count = 12;
        }
    }



    // אפשר להוסיף/לשנות קטגוריות כאן בנוחות
    const chosenCategories = ["animals", "fruits", "colors", "countries", "sports", "vehicles"];

    // צבעים לפי קטגוריה - תוכל להוסיף כאן עוד קטגוריות וצבעים
    const categoryStyles = {
        animals: "#1e90ff",
        fruits: "#32cd32",
        colors: "#ff8c00",
        countries: "#8a2be2",
        sports: "#dc143c",
        vehicles: "#ff1493"
    };

    // שמות קטגוריות בעברית להציג בתוצאות, אם לא יכנס שם יוצג השם באנגלית של הקטגוריה
    const categoryNames = {
        animals: 'חיות',
        fruits: 'פירות',
        colors: 'צבעים',
        countries: 'מדינות',
        sports: 'ספורט',
        vehicles: 'רכב'
    };

    //ניקוד ופסילה
    let score = 0;
    let fails = 0;

    let currentSelection = [];
    let currentCategory = null;

    fetch('list.json')
        .then(response => response.json()) // ממיר את המסמך לגייסון
        .then(data => { //מבצע פעולה לאחר שהתקבל המסמך
            const list = document.getElementById('animal-list');
            let allItems = [];//מערך בעבור כל המילים

            chosenCategories.forEach(category => {
                //בודק שהקטגוריה קיימת במסמך
                if (!data[category]) {
                    console.warn(`קטגוריה "${category}" לא קיימת ב־JSON`);
                    return;
                }
                //פעולה שמגרילה רק כמה מילים מתוך הקטגוריה במסמך
                const items = getRandomUniqueItems(data[category], count);
                items.forEach(item => {
                    allItems.push({ word: item, category });
                });
            });

            allItems = shuffleArray(allItems);

            //לכל מילה היא תופיע בעמוד ויתווסף לה מחלקה בשביל צבע ושיוך
            allItems.forEach(({ word, category }) => {
                const li = document.createElement('li');
                li.textContent = word;
                li.classList.add(category);
                // הגדרת צבע גבול דינמית
                //li.style.borderColor = categoryStyles[category] || '#444';

                li.addEventListener('click', () => onClickItem(li, category));
                list.appendChild(li);
            });
        })
        .catch(error => console.error('בעיה בטעינת JSON:', error)); // תופס אם יש שגיאה

    //פעולה שמגרילה רק כמה מילים מתוך הקטגוריה במסמך
    function getRandomUniqueItems(array, count) {
        const copy = [...array];//עותק של מערך
        const result = [];
        for (let i = 0; i < count && copy.length > 0; i++) {
            const index = Math.floor(Math.random() * copy.length); // הגרלה
            result.push(copy[index]); // הכנסת האיבר המוגרל
            copy.splice(index, 1); // הסרת האיבר שהוגרל מהמערך
        }
        return result;
    }

    function shuffleArray(array) {
        let m = array.length, t, i;
        while (m) {
            i = Math.floor(Math.random() * m--);
            t = array[m];
            array[m] = array[i];
            array[i] = t;
        }
        return array;
    }

    //פעולה לניהול הלחיצות -בדיקה זהות והצגת ניצחון
    function onClickItem(li, category) {
        if (li.classList.contains('disabled') || li.classList.contains('matched')) {
            return;
        }

        if (currentSelection.length === 0) {
            currentCategory = category;
            li.classList.add('selected');
            currentSelection.push(li);
            return;
        }

        if (category !== currentCategory) {
            fails++;
            updateScore();
            clearSelection();
            return;
        }

        if (!currentSelection.includes(li)) {
            li.classList.add('selected');
            currentSelection.push(li);
        }

        if (currentSelection.length === count) {
            score += count;
            updateScore();
            markAsMatched(currentSelection, category);
            addResultRow(category, currentSelection.map(li => li.textContent));
            clearSelection();
            setTimeout(checkIfGameFinished, 500); // עיכוב קל להצגת הצבע לפני ההודעה
        }
    }

    function updateScore() {
        document.getElementById('score').textContent = `נקודות: ${score} | פסילות: ${fails}`;
    }

    function markAsMatched(items, category) {
        items.forEach(li => {
            li.classList.remove('selected');
            li.classList.add('matched', 'disabled');
            li.style.backgroundColor = categoryStyles[category] || '#555';
            li.style.color = 'white';
            li.style.cursor = 'default';
        });
    }

    function clearSelection() {
        currentSelection.forEach(li => li.classList.remove('selected'));
        currentSelection = [];
        currentCategory = null;
    }

    function checkIfGameFinished() {
        const list = document.getElementById('animal-list');
        const remaining = list.querySelectorAll('li:not(.matched)').length;
        if (remaining === 0) {
            alert(`כל הפריטים נמצאו! ניצחת!\nנקודות: ${score}\nפסילות: ${fails}`);
            const playAgain = confirm("האם ברצונך לשחק שוב?");
            if (playAgain) {
                window.location.href = "GameMenu.html"; 
            }
        }
    }

    function addResultRow(category, words) {
        const resultsDiv = document.getElementById('results');

        const div = document.createElement('div');
        div.classList.add('result-set');
        div.style.backgroundColor = categoryStyles[category] || '#666';

        const title = document.createElement('strong');
        title.textContent = `${categoryNames[category] || category} - `;

        const text = document.createTextNode(words.join(', '));

        div.appendChild(title);
        div.appendChild(text);

        resultsDiv.appendChild(div);
    }













});








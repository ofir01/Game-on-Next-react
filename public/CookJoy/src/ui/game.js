import { api_getTaste, api_random, api_tasteWidget_png, api_guessNutrition } from '../api/api.js'
import { getScore, getAttempts, SetScore, SetAttempts } from './favourites.js';


/*המשחקים*/
const tasteWidget = document.getElementById('tasteWidget');
const guessNutrition = document.getElementById('guessNutrition');
//טעם שולט
tasteWidget.addEventListener('click', () => {
    game_tasteWidget();
});


//ניחוש הקלוריות
guessNutrition.addEventListener('click', () => {
    game_guessNutrition();
});


// פונקציה ליצירת overlay ולוח משחק
function createGameOverlay() {
    // אם כבר קיים overlay – לנקות אותו
    let oldOverlay = document.querySelector(".overlay");
    let oldPanel = document.querySelector(".panel");
    if (oldOverlay) oldOverlay.remove();
    if (oldPanel) oldPanel.remove();

    // יצירת Overlay
    const overlay = document.createElement("div");
    overlay.classList.add("overlay");

    // יצירת חלונית המשחק
    const panel = document.createElement("section");
    panel.classList.add("panel");

    // תוכן פנימי
    const inner = document.createElement("div");
    inner.classList.add("panel__inner");

    // כפתור סגירה
    const closeBtn = document.createElement("button");
    closeBtn.classList.add("close-x");
    closeBtn.type = "button";


    inner.appendChild(closeBtn);
    panel.appendChild(inner);


    document.body.appendChild(overlay);
    overlay.appendChild(panel);


    const open = () => {
        overlay.classList.add("show");
    };


    const close = () => {
        overlay.classList.remove("show");
        overlay.remove();
    };

    // מניעת סגירה בלחיצה על התיבה עצמה (panel)
    panel.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    closeBtn.addEventListener("click", close);
    overlay.addEventListener("click", close);


    open();


    return { overlay, panel, inner, close };
}





// משחק הטעם השולט==========================================================================================================
//אובייקט הגדרות המשחק
const gameData = {
    options: ['bitterness', 'fattiness', 'saltiness', 'savoriness', 'sourness', 'spiciness', 'sweetness'],
    title: 'Who is the dominant taste?',
    score: getScore(),
    attempts: getAttempts(),
};

//מחזיר את הטעם השולט
function getMaxKeyValue(obj) {
    let maxKey = null;
    let maxValue = 0;

    for (const [key, value] of Object.entries(obj)) {
        if (value > maxValue) {
            maxValue = value;
            maxKey = key;
        }
    }
    return { key: maxKey, value: maxValue };
}

// משחק הטעם השולט
export async function game_tasteWidget() {
    const { inner, overlay } = createGameOverlay();//יוצר את לוח המשחק

    const recipe = await api_random(1);//מחזיר מתכון ראנדומלי
    console.log(recipe);
    const data = recipe.recipes[0];
    const img = await api_tasteWidget_png(data);//מחזיר תמונה


    const taste = await api_getTaste(data.id); // מחזיר את כל הטעמים במנה
    const maxTaste = getMaxKeyValue(taste); // מחזיר את הטעם השולט באובייקט
    //console.log(taste);
    //console.log(maxTaste);

    gameData.attempts += 1;
    let experience = 0;
    let Maximum_attempts = 4;

    // יצירת אלמנטים
    const scoreWrap = document.createElement('div');
    scoreWrap.classList.add('score');
    scoreWrap.textContent = 'score: ' + gameData.score + '/' + gameData.attempts;  // הצגת הניקוד
    const title = document.createElement('h2');
    title.classList.add('title-game');
    title.textContent = data.title;
    //
    //מפצל את התמונה לשני חלקים
    const imagesRow = document.createElement('div');
    imagesRow.classList.add('images-row');

    const hero = document.createElement('div');
    hero.classList.add('hero');
    const heroImg = document.createElement('img');
    heroImg.alt = 'Main image';
    heroImg.src = data.image;
    hero.appendChild(heroImg);

    const subtitle = document.createElement('div');
    subtitle.classList.add('subtitle');
    subtitle.textContent = gameData.subtitle;

    const row = document.createElement('div');
    row.classList.add('row');

    // הוספת האופציות לתפריט
    const select = document.createElement('select');
    const options = gameData.options;
    options.forEach((opt) => {
        const o = document.createElement('option');
        o.textContent = opt;
        o.value = opt;
        select.appendChild(o);
    });


    // מדפיס את הערך של הטעם שהמשתמש בחר
    const selectedValue_Text = document.createElement('p');
    selectedValue_Text.classList.add('message_Text');

    // כפתור הבדיקה
    const actionBtn = document.createElement('button');
    actionBtn.classList.add('action-btn');
    actionBtn.type = 'button';
    actionBtn.textContent = 'Choose Taste';
    actionBtn.addEventListener('click', () => {
        const selectedValue = select.value;
        experience++;
        inlineExperience.textContent = 'experience: ' + experience;
        if (selectedValue === maxTaste.key) {
            gameData.score += Maximum_attempts - experience;
            scoreWrap.textContent = 'score: ' + gameData.score + '/' + gameData.attempts;  // עדכון הניקוד
            actionBtn.disabled = true; // השבתת הכפתור
            extraImg.classList.add('visible');// גילוי התמונה
            message_Text.textContent = 'true it is: ' + selectedValue;// הדפסת התוצאה
            SetScore(gameData.score); // שמירת הניקוד ב-localStorage
            SetAttempts(gameData.attempts); // שמירת הניסיונות ב-localStorage
        } else if (experience === Maximum_attempts) {
            extraImg.classList.add('visible');// גילוי התמונה
            actionBtn.disabled = true; // השבתת הכפתור
            message_Text.textContent = 'you lost it was: ' + maxTaste.key;// הדפסת התוצאה
            SetAttempts(gameData.attempts); // שמירת הניסיונות ב-localStorage
        }
        //console.log("נבחר:", selectedValue);
        selectedValue_Text.textContent = `You selected: ${selectedValue}: ${taste[selectedValue]}`; // הצגת הערך הנבחר
    });

    // שחק שוב
    const resetBtn = document.createElement('button');
    resetBtn.classList.add('reset-btn');
    resetBtn.type = 'button';
    resetBtn.textContent = 'Play again';
    resetBtn.addEventListener('click', async () => {
        overlay.classList.remove("show");
        overlay.remove();
        game_tasteWidget();//חוזר על המשחק שוב
    });




    // ניקוד 
    const inlineExperience = document.createElement('span');
    inlineExperience.classList.add('inline-experience');
    inlineExperience.textContent = 'experience: ' + experience;


    //התמונה הנכונה של הטעמים
    const extra = document.createElement('div');
    extra.classList.add('extra');
    const extraImg = document.createElement('img');
    extraImg.alt = 'Extra image';
    extraImg.src = img;
    extra.appendChild(extraImg);


    //הדפסת המצרכים והכמות
    const ingredientsList = document.createElement('ul');
    ingredientsList.classList.add('ingredients-list');
    data.extendedIngredients.forEach(ingredient => {
        const listItem = document.createElement('li');
        listItem.textContent = `${ingredient.original}`;
        ingredientsList.appendChild(listItem);
    });
    //console.log(data.extendedIngredients.map(i => `${i.amount} ${i.name}`));

    const br = document.createElement('br');
    ingredientsList.appendChild(br);









    //הדפסת התוצאה 
    const message_Text = document.createElement('p');
    message_Text.classList.add('message_Text');



    // הוספת כל האלמנטים לשכבת המשחק
    row.appendChild(actionBtn);
    row.appendChild(select);
    row.appendChild(resetBtn);
    row.appendChild(inlineExperience);


    imagesRow.appendChild(hero);
    imagesRow.appendChild(extra);


    inner.appendChild(title);
    inner.appendChild(scoreWrap);
    inner.appendChild(imagesRow);
    inner.appendChild(subtitle);
    inner.appendChild(row);
    inner.appendChild(selectedValue_Text);
    inner.appendChild(message_Text);
    inner.appendChild(ingredientsList);
}





//================================================================================================================================================
//ניחוש מידע תזונתי לפי כותרת
export async function game_guessNutrition() {
    const { inner } = createGameOverlay();

    const recipe = await api_random(1);//מחזיר מתכון ראנדומלי
    console.log(recipe);
    const data = await api_guessNutrition(recipe.recipes[0].title);
    //console.log(data);


    Object.keys(data).forEach((key) => {
        if (key === "recipesUsed") return;


        const item = data[key];
        const min = item.confidenceRange95Percent.min;
        const max = item.confidenceRange95Percent.max;
        const mid = (min + max) / 2;


        const wrapper = document.createElement("div");
        wrapper.classList.add("guess-item");


        const label = document.createElement("label");
        label.classList.add("guess-label");

        label.textContent = `${key.toUpperCase()} (${item.unit})`;



        const rangeInput = document.createElement("input");
        rangeInput.classList.add("guess-rangeInput");

        rangeInput.type = "range";
        rangeInput.min = min;
        rangeInput.max = max;
        rangeInput.step = 0.01;


        const numberInput = document.createElement("input");
        numberInput.classList.add("guess-numberInput");
        numberInput.type = "number";
        numberInput.min = min;
        numberInput.max = max;
        numberInput.step = 0.01;
        numberInput.value = ((min + max) / 2).toFixed(2);


        rangeInput.value = numberInput.value;


        // sync inputs
        rangeInput.addEventListener("input", () => {
            numberInput.value = rangeInput.value;
        });
        numberInput.addEventListener("input", () => {
            rangeInput.value = numberInput.value;
        });


        // feedback button
        const checkBtn = document.createElement("button");
        checkBtn.classList.add("guess-checkBtn");
        checkBtn.textContent = "Check";


        const result = document.createElement("span");
        result.classList.add("guess-result");


        checkBtn.addEventListener("click", () => {
            const guess = parseFloat(numberInput.value);
            const diff = Math.abs(guess - mid).toFixed(2);
            result.textContent = ` Mid: ${mid.toFixed(2)} → Your guess is off by ${diff}`;
        });





        wrapper.appendChild(label);
        wrapper.appendChild(rangeInput);
        wrapper.appendChild(numberInput);
        wrapper.appendChild(checkBtn);
        wrapper.appendChild(result);
        inner.appendChild(wrapper);
    });


    const resetBtn = document.createElement('button');
    resetBtn.classList.add('reset-btn');
    resetBtn.type = 'button';
    resetBtn.textContent = 'Play again';
    resetBtn.addEventListener('click', async () => {
        game_guessNutrition();//מתחיל משחק חדש
    });

    inner.appendChild(resetBtn);

}











/*
<div class="overlay">
  <div class="panel">
    <div class="panel__inner">
      <h2 class="title">בחר אפשרות</h2>
      <p class="subtitle">כפתורים </p>
      <div class="row">
        <button class="action-btn">Action 1</button>
        <button class="action-btn">Action 2</button>
        <button class="reset-btn">Reset</button>
        <select>
          <option value="1">Option 1</option>
          <option value="2">Option 2</option>
        </select>
      </div>
      <div class="extra">
        <p>תיבה אחורית לכל הכפתורים</p>
      </div>
      <button class="close-x"></button>
    </div>
  </div>
</div>
*/









//עזרה בקבלת תשובה
/*
    const ingredientFlavorMap = {
        // חלבונים / בשר
        "chicken": "savoriness",
        "beef": "savoriness",
        "pork": "savoriness",
        "bacon": "fattiness",
        "ham": "fattiness",
        "salmon": "savoriness",

        // שומנים / שמנים
        "butter": "fattiness",
        "oil": "fattiness",
        "cream": "fattiness",
        "cheese": "fattiness",

        // פירות / מתוק
        "sugar": "sweetness",
        "honey": "sweetness",
        "maple syrup": "sweetness",
        "pineapple": "sweetness",
        "apple": "sweetness",
        "banana": "sweetness",

        // ירקות / ירוקים
        "garlic": "spiciness",
        "onion": "savoriness",
        "scallions": "savoriness",
        "ginger": "spiciness",
        "cauliflower": "savoriness",
        "pepper": "spiciness",

        // תבלינים / מלח
        "salt": "saltiness",
        "soy sauce": "saltiness",
        "cinnamon": "sweetness",
        "red pepper flakes": "spiciness",

        // אגוזים / שקדים
        "walnuts": "fattiness",
        "almonds": "fattiness",
        "pecans": "fattiness",

        // חמצמץ / חומצי
        "lemon": "sourness",
        "lime": "sourness",
        "vinegar": "sourness"
    };

    // דוגמה לשימוש:
    const recipeIngredients = data.extendedIngredients.map(i => i.name);
    //console.log(recipeIngredients);
    const flavorCount = {};

    recipeIngredients.forEach(i => {
        const flavor = ingredientFlavorMap[i.toLowerCase()];
        if (flavor) {
            flavorCount[flavor] = (flavorCount[flavor] || 0) + 1;
        }
    });

    // מציאת הטעם השולט
    const flavors = Object.keys(flavorCount);
    let dominantFlavor = null;
    if (flavors.length > 0) {
        dominantFlavor = flavors.reduce((a, b) => flavorCount[a] > flavorCount[b] ? a : b);
    }
    console.log(dominantFlavor); // תחזיר 'fattiness'

*/
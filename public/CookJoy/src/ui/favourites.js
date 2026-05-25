import { information } from './information.js';



//המועדפים
const but_cookbook = document.getElementById('but_cookbook');
const result_cookbook = document.getElementById('result_cookbook');
const close_btn = document.getElementById('close-btn');
const but_Ingredients = document.getElementById('but_Ingredients');
const div_cookbook = document.getElementById('div_cookbook');

let currentOpener = null; // שומר מי פתח את החלון

but_cookbook.addEventListener('click', () => {
    if (result_cookbook.classList.contains('open')) {
        if (currentOpener === 'cookbook') {
            // אם אותו כפתור לחץ – סוגר את החלון
            result_cookbook.classList.remove('open');
            currentOpener = null;
        } else {
            // אם כפתור אחר לחץ – רק מעדכן תוכן
            loadRecipes();
            currentOpener = 'cookbook';
        }
    } else {
        // אם החלון סגור – פותח אותו עם תוכן מתאים
        loadRecipes();
        result_cookbook.classList.add('open');
        currentOpener = 'cookbook';
    }
});

but_Ingredients.addEventListener('click', () => {
    if (result_cookbook.classList.contains('open')) {
        if (currentOpener === 'ingredients') {
            // אם אותו כפתור לחץ – סוגר את החלון
            result_cookbook.classList.remove('open');
            currentOpener = null;
        } else {
            // אם כפתור אחר לחץ – רק מעדכן תוכן
            loadIngredients();
            currentOpener = 'ingredients';
        }
    } else {
        // אם החלון סגור – פותח אותו עם תוכן מתאים
        loadIngredients();
        result_cookbook.classList.add('open');
        currentOpener = 'ingredients';
    }
});


close_btn.addEventListener('click', () => {
    result_cookbook.classList.toggle('open');
})


//==================================================================================================================================
//פעולה לאתחול הנתונים
export function initCookbookData() {
    let cookbookData = JSON.parse(localStorage.getItem("cookbookData")) || {
        settings: {
            darkMode: false,
        },
        user: {
            recipes: {},
            ingredients: {},
            score: 0,
            attempts: 0
        }
    };
    localStorage.setItem("cookbookData", JSON.stringify(cookbookData));
    return cookbookData;
}



//שומר רקע מוחשך
export function setDarkMode(mode) {
    let data = initCookbookData();
    data.settings.darkMode = mode;
    localStorage.setItem("cookbookData", JSON.stringify(data));
}


//מתכונים============================================================================================
//טעינת מתכונים
export function loadDataRecipes() {
    const data = initCookbookData();
    return data.user.recipes;
}
//Object.values(data.user.recipes)

//שמירת מתכון חדש
export function saveRecipe(recipe) {
    let data = initCookbookData();
    data.user.recipes[recipe.id] = {
        title: recipe.title,
        image: recipe.image
    };
    localStorage.setItem("cookbookData", JSON.stringify(data));
    loadRecipes();
}

//מחיקת מתכון
export function deleteRecipe(id) {
    //console.log(id);
    let data = initCookbookData();
    delete data.user.recipes[id];
    localStorage.setItem("cookbookData", JSON.stringify(data));
    loadRecipes();
}

//ניקוי כל המתכונים
export function clearAllRecipes() {
    let data = initCookbookData();
    data.user.recipes = {};
    localStorage.setItem("cookbookData", JSON.stringify(data));
    loadRecipes();
}


//מצרכים============================================================================================
//טעינת מצרכים
export function loadDataIngredients() {
    const data = initCookbookData();
    return data.user.ingredients;
}

//שמירת מצרכים
export function saveIngredients(ingredient) {
    let data = initCookbookData();
    for (let key in ingredient) {
        if (!data.user.ingredients[key]) {
            data.user.ingredients[key] = parseFloat(ingredient[key]);
        } else {
            data.user.ingredients[key] += parseFloat(ingredient[key]);
        }
    }
    localStorage.setItem("cookbookData", JSON.stringify(data));
    loadIngredients();
}


//מחיקת מצרך
export function deleteIngredient(name) {
    let data = initCookbookData();
    delete data.user.ingredients[name];
    localStorage.setItem("cookbookData", JSON.stringify(data));
    loadIngredients();
}

//ניקוי כל המצרכים
export function clearAllIngredients() {
    let data = initCookbookData();
    data.user.ingredients = {};
    localStorage.setItem("cookbookData", JSON.stringify(data));
    loadIngredients();
}




//הצגת המתכונים בדף===============================================================================================


//פעולה לטעינת המתכונים והצגתם בדף
export function loadRecipes() {
    div_cookbook.innerHTML = '';  // ניקוי התוכן לפני הוספה מחדש
    // שליפת כל המתכונים
    let recipes = loadDataRecipes(); //{1950:{},1800:{}} כך זה נראה
    //console.log(recipes);
    const heading = document.createElement('h2');
    heading.classList.add('ingredients-heading');
    heading.textContent = 'מתכונים שמורים במועדפים';
    div_cookbook.appendChild(heading);

    if (Object.keys(recipes).length > 0) {
        const clear = document.createElement('div');
        clear.textContent = 'נקה הכל'
        clear.classList.add('clear');
        clear.addEventListener('click', () => {
            clearAllRecipes();
        });
        div_cookbook.appendChild(clear);
    }


    for (let key in recipes) {
        const imageWrapper = document.createElement('div');
        imageWrapper.classList.add('information-imageWrapper');

        const img_cookbook = document.createElement('img');
        img_cookbook.classList.add('img_cookbook');
        img_cookbook.id = key;
        img_cookbook.src = recipes[key].image; // התמונה
        img_cookbook.addEventListener('click', async () => {
            information(key);
        });

        const favorite = document.createElement('button');
        favorite.id = key;
        favorite.classList.add('favorite_loadData', 'liked');
        favorite.innerHTML = '&#10084;';
        favorite.addEventListener('click', () => {
            deleteRecipe(key); // הסרה מהמועדפים
        });

        imageWrapper.appendChild(img_cookbook);
        imageWrapper.appendChild(favorite);
        div_cookbook.appendChild(imageWrapper);
    }

}



//טעינת מצרכים
export function loadIngredients() {
    div_cookbook.innerHTML = '';  // ניקוי התוכן לפני הוספה מחדש
    const Ingredients = loadDataIngredients();

    const heading = document.createElement('h2');
    heading.classList.add('ingredients-heading');
    heading.textContent = 'רשימת מצרכים לקניה';
    div_cookbook.appendChild(heading);


    if (Object.keys(Ingredients).length > 0) {
        const clear = document.createElement('div');
        clear.textContent = 'נקה הכל'
        clear.classList.add('clear');
        clear.addEventListener('click', () => {
            clearAllIngredients();
        });
        div_cookbook.appendChild(clear);
    }

    for (let key in Ingredients) {
        const values = Ingredients[key];

        //קופסא לכל אינפוט
        const div_Ingredients = document.createElement('div');
        div_Ingredients.classList.add('loadIngredients');

        // הצגת המפתח  שם המצרך
        const title = document.createElement('h4');
        title.classList.add('loadIngredients-title');
        title.textContent = key;

        const input = document.createElement('input');
        input.classList.add('loadIngredients-input');
        input.type = 'number';
        input.min = 0;
        input.value = values;

        // כפתור מחיקה
        const remove = document.createElement('button');
        remove.classList.add('loadIngredients-remove');
        remove.innerHTML = 'X';
        remove.addEventListener('click', () => {
            deleteIngredient(key);  // הסרה מהמועדפים
        });

        div_Ingredients.appendChild(remove);
        div_Ingredients.appendChild(input);
        div_Ingredients.appendChild(title);

        div_cookbook.appendChild(div_Ingredients);
        input.addEventListener('change', () => {
            saveIngredients({ [key]: parseFloat(input.value - values) });
        });
    }
}


//===========================================================================המשחק
//שומר את הניקוד
export function SetScore(score) {
    let data = initCookbookData();
    data.user.score = score;
    localStorage.setItem("cookbookData", JSON.stringify(data));
}
//מחזיר את הניקוד
export function getScore() {
    let data = initCookbookData();
    return data.user.score;
}
//שומר את הנסיונות
export function SetAttempts(Attempts) {
    let data = initCookbookData();
    data.user.attempts = Attempts;
    localStorage.setItem("cookbookData", JSON.stringify(data));
}
//מחזיר את הנסיונות
export function getAttempts() {
    let data = initCookbookData();
    return data.user.attempts;
}


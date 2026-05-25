const API_KEY = '';


//מידע על המתכון==============================================================================================================================
//מידע על ההכנה למתכון 
export async function api_addInformation(id) {
    try {
        console.log(id);
        const res = await fetch(`https://api.spoonacular.com/recipes/${id}/information?includeNutrition=true&apiKey=${API_KEY}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}


//המצרכים למתכון
export async function api_getIngredients(id) {
    try {
        const res = await fetch(`https://api.spoonacular.com/recipes/${id}/ingredientWidget.json?apiKey=${API_KEY}`);
        const data = await res.json();
        return data.ingredients;
    } catch (err) {
        console.error(err);
    }
}


//תחליפים למצרכים
export async function apiSubstitutes(id) {
    console.log(id);
    //    fetch(`https://api.spoonacular.com/food/ingredients/substitutes?ingredientName=${ingredientName}&apiKey=${API_KEY}`)//מחפש לפי שם
    try {
        const res = await fetch(`https://api.spoonacular.com/food/ingredients/${id}/substitutes?apiKey=${API_KEY}`);//מחפש לפי מספר מזהה
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}


//הגרלה=================================================================================================================================================
//מחזיר מתכון בהגרלה
export async function api_random(number = 1) {
    try {
        const res = await fetch(`https://api.spoonacular.com/recipes/random?number=${number}&includeNutrition=true&apiKey=${API_KEY}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }

    /*return [
        {
            "id": 642583,
            "title": "Farfalle with Peas, Ham and Cream",
            "image": "https://img.spoonacular.com/recipes/642583-312x231.jpg",
            "imageType": "jpg"
        },
        {
            "id": 715538,
            "title": "What to make for dinner tonight?? Bruschetta Style Pork & Pasta",
            "image": "https://img.spoonacular.com/recipes/715538-312x231.jpg",
            "imageType": "jpg"
        },
        {
            "id": 650126,
            "title": "Linguine E Americana",
            "image": "https://img.spoonacular.com/recipes/650126-312x231.jpg",
            "imageType": "jpg"
        },
        {
            "id": 634629,
            "title": "Beef Lo Mein Noodles",
            "image": "https://img.spoonacular.com/recipes/634629-312x231.jpg",
            "imageType": "jpg"
        },
        {
            "id": 655575,
            "title": "Penne Pasta with Broccoli and Cheese",
            "image": "https://img.spoonacular.com/recipes/655575-312x231.jpg",
            "imageType": "jpg"
        },
        {
            "id": 642583,
            "title": "Farfalle with Peas, Ham and Cream",
            "image": "https://img.spoonacular.com/recipes/642583-312x231.jpg",
            "imageType": "jpg"
        },
        {
            "id": 715538,
            "title": "What to make for dinner tonight?? Bruschetta Style Pork & Pasta",
            "image": "https://img.spoonacular.com/recipes/715538-312x231.jpg",
            "imageType": "jpg"
        },
        {
            "id": 650126,
            "title": "Linguine E Americana",
            "image": "https://img.spoonacular.com/recipes/650126-312x231.jpg",
            "imageType": "jpg"
        },
        {
            "id": 634629,
            "title": "Beef Lo Mein Noodles",
            "image": "https://img.spoonacular.com/recipes/634629-312x231.jpg",
            "imageType": "jpg"
        },
        {
            "id": 655575,
            "title": "Penne Pasta with Broccoli and Cheese",
            "image": "https://img.spoonacular.com/recipes/655575-312x231.jpg",
            "imageType": "jpg"
        }
    ];
*/
}








//בדיחה========================================================================================================================================
//בדיחה
export async function api_random_jokes() {
    try {
        const res = await fetch(`https://api.spoonacular.com/food/jokes/random?apiKey=${API_KEY}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }

}




//החיפוש========================================================================================================================================
//שורת החיפוש
export async function api_SearchRecipes(query, number = 6) {
    try {
        const res = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${encodeURIComponent(query)}&number=${number}&addRecipeNutrition=true&apiKey=${API_KEY}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}


//השלמה אוטומטית למתכונים
export async function api_RecipeSuggest(query) {
    try {
        const res = await fetch(`https://api.spoonacular.com/recipes/autocomplete?number=10&query=${query}&apiKey=${API_KEY}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}




//פינת המשחקים==================================================================================================================================================
//מחזיר את כל הטעמים במנה
export async function api_getTaste(id) {
    const res = await fetch(
        `https://api.spoonacular.com/recipes/${id}/tasteWidget.json?apiKey=${API_KEY}`
    );
    const data = await res.json();
    return data;
}

//מחזיר תמונה של הטעמים במתכון
export async function api_tasteWidget_png(recipe) {
    try {
        const res = await fetch(`https://api.spoonacular.com/recipes/${recipe.id}/tasteWidget.png?apiKey=${API_KEY}`);
        return res.url;
    } catch (err) {
        console.error(err);
    }
}




//ניחוש מידע תזונתי לפי כותרת
//להוסיף title================================================================
export async function api_guessNutrition(title) {
    try {
        const res = await fetch(`https://api.spoonacular.com/recipes/guessNutrition?title=${title}&apiKey=${API_KEY}`);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
    /*return {
        "calories": {
            "confidenceRange95Percent": {
                "max": 574.07,
                "min": 389.92
            },
            "standardDeviation": 148.55,
            "unit": "calories",
            "value": 428.0
        },
        "carbs": {
            "confidenceRange95Percent": {
                "max": 78.19,
                "min": 55.54
            },
            "standardDeviation": 18.27,
            "unit": "g",
            "value": 65.0
        },
        "fat": {
            "confidenceRange95Percent": {
                "max": 19.2,
                "min": 12.27
            },
            "standardDeviation": 5.59,
            "unit": "g",
            "value": 16.0
        },
        "protein": {
            "confidenceRange95Percent": {
                "max": 29.31,
                "min": 8.12
            },
            "standardDeviation": 17.09,
            "unit": "g",
            "value": 13.0
        },
        "recipesUsed": 10
    };*/
}




































//לא בשימוש=======================================================================================================================================

//מתכונים דומים
export function Similar(id) {
    fetch(`https://api.spoonacular.com/recipes/${id}/similar?number=5&apiKey=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            console.log(data);
            h1slider.innerText = 'מתכונים דומים';
            //print(data);
        })
        .catch(err => console.error("שגיאה בשליפת מתכונים:", err));
}









/*
function creat(results) {
    const arrImg = [];

    for (let i = 0; i < results.length; i++) {
        const recipe = results[i];

        const img = document.createElement('img');
        img.src = recipe.image;
        img.alt = recipe.title;
        img.style.width = '200px';
        img.style.margin = '10px';

        arrImg.push(img);
    }
    shuffle(arrImg);//שליחה לפונקצית ערבוב

    // הוספה מחדש בסדר החדש
    arrImg.forEach(child => container.appendChild(child));
}

//הערבוב
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}
*/


//הצגה מהחיפוש
export function PrintSearch(query) {
    fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&number=10&apiKey=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            //print(data.results);
        })
        .catch(err => console.error("שגיאה בשליפת מתכונים:", err));
}

//השלמה אוטומטית
export function suggest(query) {
    fetch(`https://api.spoonacular.com/food/products/suggest?query=${query}&number=10&apiKey=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            //print(data.results);
        })
        .catch(err => console.error("שגיאה בשליפת מתכונים:", err));
}

export function s(id) {
    fetch(`https://api.spoonacular.com/recipes/${id}/equipmentWidget.json?apiKey=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            //print(data.results);
        })
        .catch(err => console.error("שגיאה בשליפת מתכונים:", err));
}


//ווידג'ט של אחוזים מהתזונה יומית במתכון
export function api_nutrition_widget(id) {
    fetch(`https://api.spoonacular.com/recipes/${id}/nutritionWidget?apiKey=${API_KEY}`)
        .then(res => res.json())
        .then(data => {
            //console.log(data);
            //game_tasteWidget(data);
        })
        .catch(err => console.error("שגיאה בשליפת מתכונים:", err));
}

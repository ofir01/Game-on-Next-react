import { api_SearchRecipes, api_RecipeSuggest } from '../api/api.js'
import { showLoader } from './Loader.js'
import {ui} from './setting.js';
import {information} from './information.js';





const searchInput = document.getElementById('searchInput');
const autocompleteList = document.getElementById('autocomplete-list');
const searchButton = document.getElementById('searchButton');

//חיפוש
searchButton.addEventListener('click', () => {
    search_Recipes();
});
searchInput.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        search_Recipes();
    }
});


//השלמה אוטומטית
searchInput.addEventListener('input', function () {
    if (searchInput.value.trim().length >= 3) {
        RecipeSuggest(searchInput.value, searchInput, autocompleteList);
    }
});

//הפעולה לביצוע חיפוש
function search_Recipes() {
    const query = searchInput.value.trim();
    if (!query) {
        alert('Please enter a search term.');
        return;
    }

    SearchRecipes(searchInput.value);
    searchInput.value = '';
}








//הצגת מתכונים מהחיפוש
export async function SearchRecipes(query) {
    ui.results.innerHTML = '';
    ui.informations.innerHTML = '';
    await showLoader(ui.results,3);
    
    const data = await api_SearchRecipes(query);
    if (!data.results || data.results.length === 0) {
        ui.results.innerHTML = '<div class="no-results">No recipes found. Try a different search term!</div>';
        return;
    }

    data.results.forEach(recipe => {
        const title = recipe.title;
        const image = recipe.image;
        let calories = '', protein = '', fat = '', carbs = '';
        if (recipe.nutrition && recipe.nutrition.nutrients) {
            const nutrients = recipe.nutrition.nutrients;
            const calInfo = nutrients.find(n => n.name === 'Calories');
            const proteinInfo = nutrients.find(n => n.name === 'Protein');
            const fatInfo = nutrients.find(n => n.name === 'Fat');
            const carbsInfo = nutrients.find(n => n.name === 'Carbohydrates');
            if (calInfo) calories = Math.round(calInfo.amount) + ' ' + calInfo.unit;
            if (proteinInfo) protein = Math.round(proteinInfo.amount) + ' ' + proteinInfo.unit;
            if (fatInfo) fat = Math.round(fatInfo.amount) + ' ' + fatInfo.unit;
            if (carbsInfo) carbs = Math.round(carbsInfo.amount) + ' ' + carbsInfo.unit;
        }
        const recipeDiv = document.createElement('div');
        recipeDiv.classList.add('recipe');
        recipeDiv.innerHTML = `
            <h3>${title}</h3>
            <img src="${image}" alt="${title}">
            <p><strong>Calories:</strong> ${calories}</p>
            <p><strong>Carbs:</strong> ${carbs}</p>
            <p><strong>Protein:</strong> ${protein}</p>
            <p><strong>Fat:</strong> ${fat}</p>
          `;
        ui.results.appendChild(recipeDiv);
        //console.log(recipe.id);
        recipeDiv.addEventListener('click', async () => {
            information(recipe.id);
        })
    });
}



//==================================================================================================================================
//השלמה אוטומטית בחיפוש
export async function RecipeSuggest(query, searchInput, autocompleteList) {
    autocompleteList.innerHTML = ''; // לנקות קודם
    const data = await api_RecipeSuggest(query);

    if (!data || data.length === 0) {
        const li = document.createElement("li");
        li.classList.add('No-results');
        li.textContent = "No results found";
        autocompleteList.appendChild(li);
        return;
    }

    // מה שהמשתמש חיפש
    query = searchInput.value.trim().toLowerCase();

    data.forEach(item => {
        const li = document.createElement("li");
        li.classList.add("autocomplete-item");

        // הדגשת המילה המתאימה
        const title = item.title;
        const regex = new RegExp(`(${query})`, "gi");//i = לא רגיש לאותיות גדולות וקטנות וגלובלי
        li.innerHTML = title.replace(regex, `<span class="highlight">$1</span>`);


        // בלחיצה על הצעה – למלא את שורת החיפוש ולסגור את הרשימה
        li.addEventListener("click", () => {
            searchInput.value = item.title;
            autocompleteList.innerHTML = '';
        });

        autocompleteList.appendChild(li);
    });

    // מאזין ללחיצה בכל הדף
    document.addEventListener('click', function (e) {
        // אם הלחיצה לא הייתה על שדה החיפוש ולא בתוך הרשימה  ,הרשימה תיסגר
        if (!searchInput.contains(e.target) && !autocompleteList.contains(e.target)) {
            autocompleteList.innerHTML = '';
        }
    });

}







import { pagination } from './pagination.js';
import { getActicTitel, setActicTitel, arr_genres, getGenreNameById } from './setting.js';
import { api_search, api_by_genre } from '../api/api.js';
import { renderMovies } from './render.js';
import {load_favorite} from './favorite.js';


const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
//========== אירועים לחיפוש ולסרטים פופולריים============
searchBtn.addEventListener('click', () => {
    searchMovies();
});
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchMovies();
    }
});

//הפעולה של החיפוש
async function searchMovies() {
    const query = searchInput.value.trim();
    //אם נמצאים במועדפים החיפוש ישמש להם
    if (getActicTitel().buttonsactive == 'favorite') {
        let movies = load_favorite();
        if (query) {
            movies = movies.filter(m => m.title && m.title.includes(query));  // המרה למערך של הערכים
        }
        renderMovies(movies, 'delet');
    }
    else {
        const Input = await api_search(query);
        setActicTitel('', '', '');
        renderMovies(Input);
        pagination.classList.add("hidden");
    }
    searchInput.value = '';
}





//===============================================================================================================================================
// ============  חיפוש מתקדם ============
const advanced_Search = document.getElementById("advancedSearch");
const searchGenresBtn = document.getElementById("searchGenresBtn");


// יצירת תיבת סימון לכל הז'אנרים בסיידבר
advancedSearch(arr_genres, advanced_Search);

//מבצע את החיפוש המיוחד
searchGenresBtn.addEventListener("click", async () => {
    const selectedCheckboxes = Array.from(advanced_Search.querySelectorAll("input[type='checkbox']:checked"));//מחזיר מערך של התיבות שסומנו
    const valueArr = selectedCheckboxes.map(cb => Number(cb.value));
    const selected = valueArr.join(",");//כל מה שסומן יתחבר למחרוזת אחת

    const selectedRadio = document.querySelector('input[name="mainCategory"]:checked');//כפתור הרדיו שנבחר

    //אם לא נבחרה אף קטגוריה
    if (!selected) {
        alert("בחר לפחות קטגוריה אחת, ");
        return;
    }
    const genreNames = valueArr.map(id => getGenreNameById(Number(id))).filter(Boolean);//מחזיר בשמות את המספרים של הקטגוריות
    //console.log(genreNames);
    setActicTitel(selected, selectedRadio.value, genreNames.join(', ')) //המספרים בשביל השרת ,השם שיוצג למשתמש
    selectedCheckboxes.forEach(cb => cb.checked = false);//ניקוי כל התיבות המסומנות
    //event.target.reset();
    const genre = await api_by_genre(selected, getActicTitel().moviesOrTV);
    renderMovies(genre);
});



// חיפוש עמוק לסרטים לפי ז'אנר
function advancedSearch(arr_genres, container) {
    arr_genres.forEach(item => {
        const label = document.createElement("label");
        label.classList.add('submenu-item');
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = item.id;
        label.appendChild(checkbox);
        label.appendChild(document.createTextNode(" " + item.name));
        container.appendChild(label);
    });
}
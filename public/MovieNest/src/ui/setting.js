import { API_getList } from '../api/api.js';


export const ui = {
    titelActive: document.getElementById('titelActive'),
    resultsContainer: document.getElementById('results-container'),
    results: document.getElementById('results'),
    details: document.getElementById('details'),
    status: document.getElementById('status'),
};



let buttonsactive = 'news';//שולט על הקטגוריה שנבחרה ומציג לשרת
let moviesOrTV = 'tv'; //שולט אם להציג סרטים או סדרות, ברירת מחדל סרטים
let genreHeading = 'news';//שולט על הקטגוריה שנבחרה ומציג למשתמש

//רשימת כל הז'אנרים
export const arr_genres = await API_getList();
const genreMap = Object.fromEntries(arr_genres.map(g => [g.id, g.name]));//מחזיק שמות לפי מספרים
//מחזיר את השם לפי המספר
export function getGenreNameById(id) {
    return genreMap[id] || null;
}

//מוציאה את הכותרת
export function getActicTitel() {
    return { buttonsactive, moviesOrTV, genreHeading };
}
//מעדכנת את הכותרת
export function setActicTitel(setButtonsactive = '', setMoviesOrTV = '', setGenreHeading = '') {
    //תת קטגוריה בשביל הכפתורים להעברת עמוד
    if (setButtonsactive) {
        buttonsactive = setButtonsactive;
    }
    //הקטגוריה
    if (setMoviesOrTV) {
        moviesOrTV = setMoviesOrTV;
    }
    //הכתרת שתוצג למשתמש
    if (setGenreHeading) {
        genreHeading = setGenreHeading;
    }
}
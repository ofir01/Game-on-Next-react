import {API_languages} from '../api/api.js';
import { setLanguage } from './favorite.js';


//============בחירת השפה====================
const language = document.getElementById('language');
const languageMenu = document.getElementById('languageMenu');
//  פתיחה וסגירה של התפריט
language.addEventListener('click', (e) => {
    e.stopPropagation(); // מונע שהקליק על הכפתור ייסגר מיד
    languageMenu.classList.toggle('languageMenuShow');
});

// סגירה אם לוחצים מחוץ לתפריט
window.addEventListener('click', (e) => {
    if (!languageMenu.contains(e.target) && e.target !== language) {
        languageMenu.classList.remove('languageMenuShow');
    }
});


//רשימת השפות
async function createLanguages() {
    const languages = await API_languages();
    //console.log(languages);
    languages.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('language-item');
        li.id = item.iso_639_1;
        li.textContent = item.english_name;

        // בחירת שפה
        li.addEventListener("click", () => {
            const selectedLang = li.id;
            setLanguage(selectedLang);
            location.reload();//טעינת העמוד מחדש
        });

        languageMenu.appendChild(li);
    });
}


createLanguages();//יצירת רשימת השפות


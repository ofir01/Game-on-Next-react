import { initCookbookData, setDarkMode} from './favourites.js';


// ============  מצב מוחשך============
const darkModeIcon = document.getElementById('darkModeIcon');
const FavoriteData = initCookbookData();
darkModeIcon.addEventListener('click', () => {
    darkMode()
    // שמירת מצב הדארק מוד ב-localStorage
    if (document.body.classList.contains('dark-mode')) {
        setDarkMode(true);
    } else {
        setDarkMode(false);
    }
});

darkModeIcon.innerText = document.body.classList.contains("dark-mode") ? '🌞' : '🌙';
// בדיקה של מצב הדארק מוד בטעינת הדף
if (FavoriteData.settings.darkMode) {
    darkMode(FavoriteData.settings.darkMode);
}

//מצב מוחשך
function darkMode() {
    document.body.classList.toggle('dark-mode');
    darkModeIcon.innerText = document.body.classList.contains("dark-mode") ? '🌞' : '🌙';

}
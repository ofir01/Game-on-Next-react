import { setDarkMode, getDarkMode } from './favorite.js';

const darkModeIcon = document.getElementById('darkModeIcon');
darkModeIcon.innerText = document.body.classList.contains("dark-mode") ? '🌞' : '🌙';
// ============  מצב מוחשך============
darkModeIcon.addEventListener('click', () => {
    darkMode()
    // שמירת מצב הדארק מוד ב-localStorage
    if (document.body.classList.contains('dark-mode')) {
        setDarkMode(true);
    } else {
        setDarkMode(false);
    }
});



//מצב מוחשך
function darkMode() {
    document.body.classList.toggle('dark-mode');
    darkModeIcon.innerText = document.body.classList.contains("dark-mode") ? '🌞' : '🌙';
}


// בדיקה של מצב הדארק מוד בטעינת הדף
if (getDarkMode()) {
    darkMode();
}

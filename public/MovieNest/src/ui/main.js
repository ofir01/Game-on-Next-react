import '../css/video.css';
import '../css/main.css';
import '../css/render.css';
import '../css/details.css';
import '../css/header.css';
import '../css/sidebarSearch.css';
import '../css/language.css';
import '../css/nextPage.css';
import '../css/submenu.css';
import '../css/loader.css';

import './video.js'
import './darkMode.js';
import './language.js';
import './favorite.js';
import './search.js';
import './pagination.js';
import './moviesList.js';





//פותח את התפריט
const toggleBtn = document.getElementById('toggleBtn');
const sidebar = document.getElementById('sidebar');
// הכפתור שפותח את התפריט הקטגוריות
toggleBtn.addEventListener('click', () => {
    sidebar.classList.toggle('active');
    // שינוי האייקון של הכפתור
    sidebar.classList.contains('active') ? toggleBtn.innerHTML = '&#10005;' : toggleBtn.innerHTML = '&#9776;'; // איקס לסגירה
});

//האייקון של הבית
const homeLink = document.getElementById('homeLink');
homeLink.addEventListener('click', () => {
    location.reload();//טעינת העמוד מחדש
})




























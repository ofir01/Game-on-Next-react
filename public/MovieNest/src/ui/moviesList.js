

import { api_by_genre, api_Popular, API_top_rated, API_upcoming, API_tv_airing_today } from '../api/api.js';
import { renderMovies } from './render.js';
import { setActicTitel, getGenreNameById,arr_genres  } from './setting.js';
import { updatePage,renderButtons } from './pagination.js';






const submenumovies = document.getElementById('submenumovies');//סרטים
const submenutv = document.getElementById('submenutv');//סדרות

//===================התת תפריט=====================
await createCategoryButtons(submenumovies, 'movie');
initGenres(arr_genres, 'movie', submenumovies);

await createCategoryButtons(submenutv, 'tv');
initGenres(arr_genres, 'tv', submenutv);

//מאפס את הדפים ושולט על סרטים או סדרות
submenumovies.addEventListener('click', () => {
    updatePage();
    renderButtons();
    //console.log(page, moviesOrTV);
});
submenutv.addEventListener('click', () => {
    updatePage();
    renderButtons();
    //console.log(page, moviesOrTV);
});


//יצירת הכפתורים של הז'אנרים
function initGenres(arr_genres, moviesOrTV, genreContainer) {
    //console.log(arr_genres[0].id);
    //console.log(moviesOrTV);
    arr_genres.forEach(item => {
        const btn = document.createElement("button");
        btn.textContent = item.name; // טקסט הכפתור
        btn.classList.add('submenu-item');
        btn.id = item.id; // מזהה הז'אנר
        btn.addEventListener("click", async () => {
            //במסך קטן, הסגירה של התפריט לאחר בחירת ז'אנר 
            genreContainer.classList.toggle("open");


            //console.log(item.id);
            setActicTitel(item.id, moviesOrTV, getGenreNameById(item.id));

            const genre = await api_by_genre(item.id, moviesOrTV);
            renderMovies(genre);
        });
        genreContainer.appendChild(btn);
    });
}

// הפעולה ליצירת כפתורים נוספים- מדורג גבוה, בקרוב, פופלארי
async function createCategoryButtons(container, titel) {
    const mediaGroups = {
        popular: await api_Popular(titel),
        topRated: await API_top_rated(titel),
        upcoming: titel !== 'tv' ? await API_upcoming() : await API_tv_airing_today()
    };

    // מעבר על כל המפתחות במערך ויצירת כפתורים
    Object.entries(mediaGroups).forEach(([key, data]) => {
        // יצירת כפתור
        const buttun = document.createElement('buttun');
        buttun.classList.add('submenu-item');
        buttun.textContent = key;


        // אירוע לחיצה לכל כפתור
        buttun.addEventListener('click', () => {
            container.classList.toggle("open");
            setActicTitel(key, titel, key);
            renderMovies(data);
        });
        container.appendChild(buttun);
    });
}




//============================================================================================================
//=============התתי תפריטים===================
//אוסף של כל התתי תפריטים והחצים
const AllSubmenuContainer = document.querySelectorAll('.submenu-container');//התתי תפריטים
const Allarrow = document.querySelectorAll('.arrow');//החצים
const sidebarElements = document.querySelectorAll('.sidebarElement');//הקטגוריה בתפריט הראשי

sidebarElements.forEach(item => {
    item.addEventListener('click', (e) => {
        // אם הלחיצה הייתה בתוך אחד התתי-תפריטים — אל תעשה כלום
        for (const submenu of AllSubmenuContainer) {
            if (submenu.contains(e.target)) return;
        }

        //התתי אלמנטים שבתוכו
        const isActive = item.classList.contains('sidebarActive');
        const arrow = item.querySelector('.arrow');
        const submenuContainer = item.querySelector('.submenu-container');//התת תפריט שלו


        //פעולה שמסירה את כל העיצובים מקטגוריות אחרות בתפריט הראשי
        closeAllSubmenus();
        item.classList.add('sidebarActive');//משאיר את הצבע בקטגוריה שנבחרה


        //אם יש לו תת תפריט נפתח אותו
        if (arrow && submenuContainer) {
            arrow.classList.add('open');
            submenuContainer.classList.add('open');
        }

        //רק אם מדובר בתפריט שכבר פתוח ונלחץ שוב, אז נסגור אותו ואת הצבע
        if (isActive && arrow && submenuContainer) {
            arrow.classList.remove('open');
            submenuContainer.classList.remove('open');
            item.classList.remove('sidebarActive');
        }
    })
});

// סגירת הרקע וכל התפריטים והתת־תפריטים
function closeAllSubmenus() {
    AllSubmenuContainer.forEach(sub => sub.classList.remove('open'));
    Allarrow.forEach(a => a.classList.remove('open'));
    sidebarElements.forEach(item => item.classList.remove('sidebarActive'));
}

window.addEventListener('click', (e) => {
    // בודק אם הלחיצה הייתה בתוך אחד מהתפריטים או אחד האלמנטים הראשיים
    const clickedInside = Array.from(sidebarElements).some(item => item.contains(e.target));
    if (!clickedInside) {
        closeAllSubmenus(); // סוגר את כל התפריטים
    }
});



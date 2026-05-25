
import { getActicTitel } from './setting.js';
import { renderMovies } from './render.js';
import { API_new_playing, api_Popular, API_top_rated, API_upcoming, API_tv_airing_today } from '../api/api.js';




export const pagination = document.getElementById("pagination");
const nextBtn = document.getElementById("nextBtn");
const numberBtns = document.querySelectorAll('.numberBtn');


// ============ עמוד הבא/הקודם ============
let page = 1;//העמוד שנמצאים בו
let totalPages = 10; // מספר העמודים הכולל 
let visibleBtns = 5; // כמות הכפתורים הנראים

//מעדכן את מספר הדף
export function updatePage(setPage = 1) {
    page = setPage;
}

nextBtn.addEventListener("click", () => {
    page++;
    switchPage();
});


const prevBtn = document.getElementById("prevBtn");
prevBtn.addEventListener("click", () => {
    if (page > 1) {
        page--;
        switchPage();
    }
});

// פונקציה שמחליפה עמודים בהתאם לקטגוריה שנבחרה
export async function switchPage() {
    let choose = getActicTitel();
    console.log(choose.buttonsactive, choose.moviesOrTV);
    let data = '';
    if (choose.buttonsactive == 'news') {
        const now_playing = await API_new_playing(page);
        data = now_playing;
        totalPages = now_playing.total_pages;
    }
    else if (choose.buttonsactive == 'popular') {
        const Popular = await api_Popular(choose.moviesOrTV, page);
        totalPages = Popular.total_pages;
        data = Popular;
    }
    else if (choose.buttonsactive == 'topRated') {
        const top_rated = await API_top_rated(choose.moviesOrTV, page);
        data = top_rated;
        totalPages = top_rated.total_pages;
    }
    else if (choose.buttonsactive == 'upcoming') {
        if (choose.moviesOrTV === 'tv') {
            const tv_airing_today = await API_tv_airing_today(page);
            data = tv_airing_today;
            totalPages = tv_airing_today.total_pages;
        } else {
            const upcoming = await API_upcoming(page);
            data = upcoming;
            totalPages = upcoming.total_pages;
        }
    }
    else {
        const genre = await api_by_genre(choose.buttonsactive, choose.moviesOrTV, page);
        data = genre;
        totalPages = 200;
    }

    renderMovies(data);
    renderButtons();
}

// מאזין לכפתורים
numberBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        page = parseInt(btn.textContent);
        renderButtons();
        switchPage(); // פונקציה שמעדכנת את התוכן
    });
});



export function renderButtons() {
    // מציאת טווח הכפתורים שיוצגו, והכפתור הנוכחי במרכז
    let start = Math.max(1, page - Math.floor(visibleBtns / 2));
    let end = Math.min(totalPages, start + visibleBtns - 1);

    // התאמה אם אנחנו קרובים לסוף
    if (end - start + 1 < visibleBtns) {
        start = Math.max(1, end - visibleBtns + 1);
    }

    // עדכון הכפתורים, והסתרת אלו שלא בשימוש
    numberBtns.forEach((btn, i) => {
        let pageNum = start + i;
        if (pageNum <= totalPages) {
            btn.textContent = pageNum;
            btn.style.display = 'inline-block';
            btn.classList.toggle('active', pageNum == page);
        } else {
            btn.style.display = 'none';
        }
    });
}




switchPage();//הכפתורים

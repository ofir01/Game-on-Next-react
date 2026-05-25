import { ui, getActicTitel } from './setting.js';
import { pagination } from './pagination.js';
import { showLoader } from './Loader.js';
import { IMG_BASE2 } from '../api/api.js';
import noImageFilm from '../image/no_image_film.png';
import { renderMovieDetails } from './details.js';
import { deleteMovies, load_favorite, clearAllMyFavorites, } from './favorite.js';

// הצגת תוצאות
export async function renderMovies(data, delet = null) {
  pagination.classList.add("hidden");
  console.log(data);
  ui.titelActive.innerHTML = '';
  ui.results.innerHTML = '';
  ui.details.innerHTML = '';
  ui.status.textContent = '';
  await showLoader(document.body);//האנימציה
  ui.resultsContainer.classList.remove('hidden');


  if (data.results) {
    ui.status.textContent = `התקבלו ${data.results.length} פריטים (מתוך ${data.total_results}).`;
  }
  else {
    ui.status.textContent = `התקבלו ${data.length} פריטים`;
  }
  data = data.results ? data.results : data;


  if (!data || data.length === 0) {
    ui.results.innerHTML = 'לא נמצאו תוצאות.';
    return;
  }

  pagination.classList.remove("hidden");

  const titel = getActicTitel();
  ui.titelActive.innerHTML = titel.genreHeading + ' ' + titel.moviesOrTV;


  const fragment = document.createElement('div');//קופסא זמנית
  fragment.classList.add('results');


  data.forEach(items => {
    const card = document.createElement('article');
    card.classList.add('card');

    //תמונה
    const img = document.createElement('img');
    img.classList.add('poster');
    img.alt = items.title;
    img.src = items.poster_path ? IMG_BASE2 + items.poster_path : noImageFilm;

    img.addEventListener('click', () => {
      renderMovieDetails(items);
    });

    //כותרת
    const title = document.createElement('h3');
    title.classList.add('title');
    title.textContent = items.title;

    const span = document.createElement("span");
    span.classList.add("rating");
    span.textContent = "⭐ " + items.vote_average.toFixed(1); // ספרה אחת אחרי הנקודה

    //תאריך שחרור
    const foot = document.createElement('div');
    foot.classList.add('title-release');
    foot.textContent = items.first_air_date ? items.first_air_date : items.release_date;


    card.appendChild(img);
    card.appendChild(span);
    card.appendChild(title);
    card.appendChild(foot);



    if (delet == 'delet') {
      pagination.classList.add("hidden");
      const clear = document.createElement('button');
      clear.classList.add('clear');
      clear.textContent = 'הסר';
      clear.addEventListener('click', () => {
        deleteMovies(items.id);
        //console.log(items);
        let movies = load_favorite();
        renderMovies(movies, 'delet');
        clearAllMyFavorites();

      });

      card.appendChild(clear);
    }
    fragment.appendChild(card);
  });
  ui.results.appendChild(fragment);
}



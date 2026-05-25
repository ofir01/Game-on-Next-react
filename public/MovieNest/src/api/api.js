import {getCurrentLanguage} from '../ui/favorite.js';

export const IMG_BASE = 'https://image.tmdb.org/t/p/w200';//תמונה של האתר
export const IMG_BASE2 = 'https://image.tmdb.org/t/p/w500';//תמונה של האתר

const Api_key = '';
let language = getCurrentLanguage();
console.log(language);
const options = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${Api_key}`
    }
};


//מחזיר את השפות שנתמכות
export async function API_languages() {
    const url = `https://api.themoviedb.org/3/configuration/languages?`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}




//חיפוש סרט
export async function api_search(query, page = 1) {
    const url = `https://api.themoviedb.org/3/search/movie?language=${language}&query=${encodeURIComponent(query)}&page=${page}&include_adult=false`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}


// חיפוש לפי ז'אנר (אקשן = 28)
export async function api_by_genre(genre_id, moviesOrTV = 'movie', page = 1) {
    const url = `https://api.themoviedb.org/3/discover/${moviesOrTV}?language=${language}&with_genres=${genre_id}&page=${page}`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

//movie

//סרטים או סדרות פופולארים
export async function api_Popular(moviesOrTV, page = 1) {
    const url = `https://api.themoviedb.org/3/${moviesOrTV}/popular?language=${language}&page=${page}&include_adult=false`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

//חיפוש סרטים לפי שחקן
export async function api_search_by_actorId(actorId, limit = 20) {
    const url = `https://api.themoviedb.org/3/person/${actorId}/movie_credits?language=${language}`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        const movies = data.cast.slice(0, limit);
        return movies;
    } catch (err) {
        console.error(err);
    }
}






// שחקנים בסרט 
export async function api_credits(movie_id) {
    const url = `https://api.themoviedb.org/3/movie/${movie_id}/credits?language=${language}`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

//  סרטים דומים
export async function api_similar(movie_id) {
    const url = `https://api.themoviedb.org/3/movie/${movie_id}/similar?language=${language}&page=1`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}


// רשימת ז'אנרים
export async function API_getList() {
    const url = `https://api.themoviedb.org/3/genre/movie/list?language=${language}`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data.genres;
    } catch (err) {
        console.error(err);
    }
}


// סרטים חדשים
export async function API_new_playing(page = 1) {
    const url = `https://api.themoviedb.org/3/movie/now_playing?language=${language}&page=${page}`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}


//===================================================

// סרטים וסדרות בדירוג גבוה
export async function API_top_rated(moviesOrTV, page = 1) {
    const url = `https://api.themoviedb.org/3/${moviesOrTV}/top_rated?language=${language}&page=${page}`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

// סרטים שעומדים לצאת
export async function API_upcoming(page = 1) {
    const url = `https://api.themoviedb.org/3/movie/upcoming?language=${language}&page=${page}`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}


//===================סדרות=======================
// 📺 סדרות שמשודרות עכשיו
export async function API_tv_airing_today(page = 1) {
    const url = `https://api.themoviedb.org/3/tv/airing_today?language=${language}&page=${page}`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}



// 📺 סדרות שמשודרות כעת (On The Air)
export async function API_tv_on_the_air(page = 1) {
    const url = `https://api.themoviedb.org/3/tv/on_the_air?language=${language}&page=${page}`;
    try {
        const res = await fetch(url, options);
        const data = await res.json();
        return data;
    } catch (err) {
        console.error(err);
    }
}

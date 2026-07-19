const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

const MEDIA_TYPES = new Set(['movie', 'tv']);
const STATIC_PATHS = {
  popular: (mediaType) => `/${mediaType}/popular`,
  top: (mediaType) => `/${mediaType}/top_rated`,
  upcoming: () => '/movie/upcoming',
  now: () => '/movie/now_playing',
  airing: () => '/tv/airing_today',
  onAir: () => '/tv/on_the_air',
  search: () => '/search/movie',
  discover: (mediaType) => `/discover/${mediaType}`,
  genres: () => '/genre/movie/list',
  languages: () => '/configuration/languages',
};

function jsonError(message, status = 400) {
  return Response.json({ error: message }, { status });
}

function cleanMediaType(value) {
  return MEDIA_TYPES.has(value) ? value : 'movie';
}

function appendIfPresent(params, key, value) {
  if (value !== null && value !== undefined && value !== '') params.set(key, value);
}

async function tmdbFetch(path, params, token) {
  const response = await fetch(`${TMDB_BASE_URL}${path}?${params}`, {
    headers: {
      accept: 'application/json',
      Authorization: `Bearer ${token}`,
    },
    next: { revalidate: 600 },
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

export async function GET(request) {
  const token = process.env.TMDB_API_READ_TOKEN;

  if (!token) {
    return jsonError('Missing TMDB_API_READ_TOKEN', 500);
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'popular';
  const page = searchParams.get('page') || '1';
  const mediaType = cleanMediaType(searchParams.get('mediaType') || 'movie');
  const language = searchParams.get('language') || 'he-IL';
  const id = searchParams.get('id');

  let path;
  const params = new URLSearchParams({ language, page, include_adult: 'false' });

  if (type === 'detail') {
    if (!id) return jsonError('Missing movie id');
    path = `/${mediaType}/${id}`;
    params.set('append_to_response', 'credits,similar,videos,recommendations');
  } else if (type === 'credits') {
    if (!id) return jsonError('Missing movie id');
    path = `/${mediaType}/${id}/credits`;
  } else if (type === 'similar') {
    if (!id) return jsonError('Missing movie id');
    path = `/${mediaType}/${id}/similar`;
  } else if (type === 'actor') {
    if (!id) return jsonError('Missing actor id');
    path = `/person/${id}`;
    params.set('append_to_response', 'movie_credits,tv_credits,combined_credits');
  } else {
    const pathFactory = STATIC_PATHS[type];
    if (!pathFactory) return jsonError('Invalid MovieNest request');
    path = pathFactory(mediaType);
  }

  if (type === 'search') {
    appendIfPresent(params, 'query', searchParams.get('query'));
    appendIfPresent(params, 'primary_release_year', searchParams.get('year'));
    appendIfPresent(params, 'year', searchParams.get('year'));
  }

  if (type === 'discover') {
    appendIfPresent(params, 'with_genres', searchParams.get('genres'));
    appendIfPresent(params, 'primary_release_year', searchParams.get('year'));
    appendIfPresent(params, 'first_air_date_year', searchParams.get('year'));
    appendIfPresent(params, 'sort_by', searchParams.get('sortBy') || 'popularity.desc');
    appendIfPresent(params, 'vote_average.gte', searchParams.get('rating'));
    appendIfPresent(params, 'with_original_language', searchParams.get('originalLanguage'));
  }

  return tmdbFetch(path, params, token);
}
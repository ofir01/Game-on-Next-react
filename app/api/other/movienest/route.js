const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export async function GET(request) {
  const token = process.env.TMDB_API_READ_TOKEN;

  if (!token) {
    return Response.json({ error: 'Missing TMDB_API_READ_TOKEN' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'popular';
  const page = searchParams.get('page') || '1';
  const mediaType = searchParams.get('mediaType') || 'movie';
  const language = searchParams.get('language') || 'en-US';

  const paths = {
    popular: `/${mediaType}/popular`,
    top: `/${mediaType}/top_rated`,
    upcoming: '/movie/upcoming',
    now: '/movie/now_playing',
    search: '/search/movie',
  };

  const path = paths[type];

  if (!path) {
    return Response.json({ error: 'Invalid MovieNest request' }, { status: 400 });
  }

  const params = new URLSearchParams({ language, page, include_adult: 'false' });
  const query = searchParams.get('query');

  if (type === 'search') {
    params.set('query', query || '');
  }

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

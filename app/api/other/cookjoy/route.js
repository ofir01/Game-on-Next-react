const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com';

export async function GET(request) {
  const apiKey = process.env.SPOONACULAR_API_KEY;

  if (!apiKey) {
    return Response.json({ error: 'Missing SPOONACULAR_API_KEY' }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'search';

  const endpoints = {
    search: '/recipes/complexSearch',
    random: '/recipes/random',
    information: `/recipes/${searchParams.get('id')}/information`,
  };

  const endpoint = endpoints[type];

  if (!endpoint || endpoint.includes('null')) {
    return Response.json({ error: 'Invalid CookJoy request' }, { status: 400 });
  }

  const params = new URLSearchParams(searchParams);
  params.delete('type');
  params.set('apiKey', apiKey);

  if (type === 'search') {
    params.set('addRecipeNutrition', 'true');
    params.set('number', params.get('number') || '9');
  }

  if (type === 'random') {
    params.set('includeNutrition', 'true');
    params.set('number', params.get('number') || '6');
  }

  const response = await fetch(`${SPOONACULAR_BASE_URL}${endpoint}?${params}`, {
    next: { revalidate: 600 },
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

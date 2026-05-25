const WEATHER_BASE_URL = 'https://api.openweathermap.org';
const COUNTRIES_BASE_URL = 'https://api.countrystatecity.in/v1';

export async function GET(request) {
  const weatherKey = process.env.OPENWEATHER_API_KEY;
  const countriesKey = process.env.COUNTRYSTATECITY_API_KEY;
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type') || 'current';

  if (['countries', 'states', 'cities'].includes(type)) {
    return handleCountriesRequest(type, searchParams, countriesKey);
  }

  if (!weatherKey) {
    return Response.json({ error: 'Missing OPENWEATHER_API_KEY' }, { status: 500 });
  }

  const city = searchParams.get('city');
  const lat = searchParams.get('lat');
  const lon = searchParams.get('lon');

  const urls = {
    current: `${WEATHER_BASE_URL}/data/2.5/weather?q=${encodeURIComponent(city || '')}&units=metric&lang=he&appid=${weatherKey}`,
    forecast: `${WEATHER_BASE_URL}/data/2.5/forecast?q=${encodeURIComponent(city || '')}&units=metric&lang=he&appid=${weatherKey}`,
    reverse: `${WEATHER_BASE_URL}/geo/1.0/reverse?lat=${lat}&lon=${lon}&limit=1&appid=${weatherKey}`,
  };

  const url = urls[type];

  if (!url || url.includes('null')) {
    return Response.json({ error: 'Invalid WeatherApp request' }, { status: 400 });
  }

  const response = await fetch(url, { next: { revalidate: 300 } });
  const data = await response.json();

  if (type === 'forecast' && searchParams.get('date')) {
    const date = searchParams.get('date');
    data.list = (data.list || []).filter((item) => item.dt_txt?.includes(date));
  }

  return Response.json(data, { status: response.status });
}

async function handleCountriesRequest(type, searchParams, apiKey) {
  if (!apiKey) {
    return Response.json({ error: 'Missing COUNTRYSTATECITY_API_KEY' }, { status: 500 });
  }

  const country = searchParams.get('country');
  const state = searchParams.get('state');

  const urls = {
    countries: `${COUNTRIES_BASE_URL}/countries`,
    states: `${COUNTRIES_BASE_URL}/countries/${country}/states`,
    cities: `${COUNTRIES_BASE_URL}/countries/${country}/states/${state}/cities`,
  };

  const url = urls[type];

  if (!url || url.includes('null')) {
    return Response.json({ error: 'Invalid countries request' }, { status: 400 });
  }

  const response = await fetch(url, {
    headers: { 'X-CSCAPI-KEY': apiKey },
    next: { revalidate: 86400 },
  });

  const data = await response.json();
  return Response.json(data, { status: response.status });
}

"use client";

import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, Clapperboard, Film, Heart, Home, Languages, LoaderCircle, Menu, Moon, Search, SlidersHorizontal, Star, Sun, Tv, UserRound, X } from 'lucide-react';

const IMG = 'https://image.tmdb.org/t/p/';
const KEY = 'siteMovies';
const demo = [
  { id: 9001, title: 'Midnight Signal', overview: 'A neon mystery about one lost transmission and the city that follows it.', vote_average: 8.4, release_date: '2026-02-14' },
  { id: 9002, title: 'The Last Frame', overview: 'A filmmaker chases a missing reel through old theaters and forgotten archives.', vote_average: 7.9, release_date: '2025-11-07' },
  { id: 9003, title: 'Orbit House', overview: 'A warm science fiction story about a family hotel at the edge of the galaxy.', vote_average: 8.1, release_date: '2026-01-20' },
];
const fallbackGenres = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' }, { id: 27, name: 'Horror' }, { id: 878, name: 'Science Fiction' }, { id: 53, name: 'Thriller' },
];
const T = {
  he: { dir: 'rtl', locale: 'he-IL', home: 'בית', search: 'חיפוש', favorites: 'מועדפים', movies: 'סרטים', tv: 'סדרות', popular: 'פופולרי', top: 'מדורג גבוה', now: 'בקולנוע', upcoming: 'בקרוב', discover: 'גלה סרטים שמתאימים לערב שלך', subtitle: 'MovieNest מרכז סרטים, חיפוש, מועדפים ושחקנים במקום אחד.', placeholder: 'חפש סרט לפי שם...', go: 'חפש', filterGo: 'חפש לפי פילטרים', year: 'שנה', genre: 'קטגוריה', rating: 'דירוג מינימלי', sort: 'מיון', language: 'שפה', theme: 'מצב תצוגה', light: 'בהיר', dark: 'חשוך', details: 'פרטים', cast: 'שחקנים בסרט', similar: 'סרטים דומים', actorMovies: 'סרטים וסדרות של השחקן', add: 'הוסף למועדפים', remove: 'הסר ממועדפים', emptyFav: 'עדיין אין מועדפים שמורים.', empty: 'לא נמצאו תוצאות מתאימות.', loading: 'טוען את האולם...', error: 'משהו השתבש בטעינת הסרטים.', clear: 'נקה מועדפים' },
  en: { dir: 'ltr', locale: 'en-US', home: 'Home', search: 'Search', favorites: 'Favorites', movies: 'Movies', tv: 'TV', popular: 'Popular', top: 'Top rated', now: 'Now playing', upcoming: 'Upcoming', discover: 'Find the right movie for tonight', subtitle: 'MovieNest brings movies, search, favorites and actors into one cinematic flow.', placeholder: 'Search a movie by name...', go: 'Search', filterGo: 'Search filters', year: 'Year', genre: 'Genre', rating: 'Minimum rating', sort: 'Sort', language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark', details: 'Details', cast: 'Cast', similar: 'Similar movies', actorMovies: 'Actor filmography', add: 'Add favorite', remove: 'Remove favorite', emptyFav: 'No favorites saved yet.', empty: 'No matching results found.', loading: 'Loading the theater...', error: 'Something went wrong while loading movies.', clear: 'Clear favorites' },
};

function initialStore() {
  if (typeof window === 'undefined') return { settings: { darkMode: true, language: 'he' }, user: { favorites: {} } };
  const parsed = JSON.parse(localStorage.getItem(KEY) || 'null') || { settings: {}, user: {} };
  const store = { settings: { darkMode: true, language: 'he', ...parsed.settings }, user: { favorites: {}, ...parsed.user } };
  localStorage.setItem(KEY, JSON.stringify(store));
  return store;
}
function title(item) { return item?.title || item?.name || item?.original_title || item?.original_name || 'MovieNest'; }
function year(item) { return (item?.release_date || item?.first_air_date || '').slice(0, 4) || '2026'; }
function poster(item) { return item?.poster_path ? `${IMG}w500${item.poster_path}` : ''; }
function backdrop(item) { return item?.backdrop_path ? `${IMG}w1280${item.backdrop_path}` : ''; }
function profile(item) { return item?.profile_path ? `${IMG}w300${item.profile_path}` : ''; }
function href(movie, mediaType) { const type = movie?.media_type && movie.media_type !== 'person' ? movie.media_type : mediaType; return `/other/MovieNest/movie/${movie.id}?mediaType=${type}`; }
async function api(params) { const res = await fetch(`/api/other/movienest?${params}`); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'MovieNest request failed'); return data; }

export default function MovieNestClient({ view = 'home' }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState('he');
  const [dark, setDark] = useState(true);
  const [favorites, setFavorites] = useState({});
  const [mediaType, setMediaType] = useState(searchParams.get('mediaType') || 'movie');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [movies, setMovies] = useState(demo);
  const [detail, setDetail] = useState(null);
  const [actor, setActor] = useState(null);
  const [genres, setGenres] = useState(fallbackGenres);
  const [mode, setMode] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [filters, setFilters] = useState({ year: '', genres: '', rating: '', sortBy: 'popularity.desc' });
  const copy = T[lang];
  const favoriteList = useMemo(() => Object.values(favorites), [favorites]);
  const hero = detail || movies[0] || demo[0];
  const heroImage = backdrop(hero) || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80';

  useEffect(() => { const store = initialStore(); setLang(store.settings.language || 'he'); setDark(Boolean(store.settings.darkMode)); setFavorites(store.user.favorites || {}); setReady(true); }, []);
  useEffect(() => { if (!ready) return; localStorage.setItem(KEY, JSON.stringify({ settings: { language: lang, darkMode: dark }, user: { favorites } })); }, [dark, favorites, lang, ready]);
  useEffect(() => { setMediaType(searchParams.get('mediaType') || 'movie'); setQuery(searchParams.get('q') || ''); }, [searchParams]);

  const loadGenres = useCallback(async () => {
    try { const data = await api(new URLSearchParams({ type: 'genres', language: copy.locale })); setGenres(data.genres?.length ? data.genres : fallbackGenres); } catch { setGenres(fallbackGenres); }
  }, [copy.locale]);
  const loadList = useCallback(async (nextMode = 'popular', nextMedia = mediaType, nextFilters = filters) => {
    setLoading(true); setMessage(''); setMode(nextMode); setDetail(null); setActor(null);
    try {
      const p = new URLSearchParams({ type: nextMode, mediaType: nextMedia, page: '1', language: copy.locale });
      if (nextMode === 'search') p.set('query', query.trim());
      if (nextMode === 'discover') Object.entries(nextFilters).forEach(([k, v]) => v && p.set(k, v));
      const data = await api(p); const results = data.results || [];
      setMovies(results.length ? results : demo); if (!results.length) setMessage(copy.empty);
    } catch (e) { setMovies(demo); setMessage(e.message || copy.error); } finally { setLoading(false); }
  }, [copy.empty, copy.error, copy.locale, filters, mediaType, query]);
  const loadDetail = useCallback(async () => {
    if (!params?.id) return; setLoading(true); setMessage(''); setActor(null);
    try { const data = await api(new URLSearchParams({ type: 'detail', id: String(params.id), mediaType, language: copy.locale })); setDetail(data); setMovies(data.similar?.results?.length ? data.similar.results : data.recommendations?.results || []); }
    catch (e) { setDetail(null); setMovies(demo); setMessage(e.message || copy.error); } finally { setLoading(false); }
  }, [copy.error, copy.locale, mediaType, params?.id]);
  const loadActor = useCallback(async () => {
    if (!params?.id) return; setLoading(true); setMessage(''); setDetail(null);
    try { const data = await api(new URLSearchParams({ type: 'actor', id: String(params.id), language: copy.locale })); const cast = data.combined_credits?.cast || data.movie_credits?.cast || []; setActor(data); setMovies(cast.filter((item) => item.id && item.media_type !== 'person').slice(0, 24)); }
    catch (e) { setActor(null); setMovies([]); setMessage(e.message || copy.error); } finally { setLoading(false); }
  }, [copy.error, copy.locale, params?.id]);

  useEffect(() => { if (ready) loadGenres(); }, [loadGenres, ready]);
  useEffect(() => {
    if (!ready) return;
    if (view === 'movie') loadDetail();
    else if (view === 'actor') loadActor();
    else if (view === 'favorites') { setLoading(false); setDetail(null); setActor(null); setMovies(favoriteList); }
    else if (view === 'search') searchParams.get('q') ? loadList('search', mediaType) : loadList('discover', mediaType);
    else loadList('popular', mediaType);
  }, [favoriteList, lang, loadActor, loadDetail, loadList, mediaType, ready, searchParams, view]);

  function submitSearch(e) { e.preventDefault(); const q = query.trim(); router.push(`/other/MovieNest/search${q ? `?q=${encodeURIComponent(q)}&mediaType=movie` : ''}`); setOpen(false); }
  function submitFilters(e) { e.preventDefault(); const p = new URLSearchParams({ mediaType }); Object.entries(filters).forEach(([k, v]) => v && p.set(k, v)); router.push(`/other/MovieNest/search?${p}`); loadList('discover', mediaType, filters); }
  function toggleFavorite(movie) { const normalized = { ...movie, media_type: movie.media_type || mediaType }; setFavorites((current) => { const next = { ...current }; if (next[normalized.id]) delete next[normalized.id]; else next[normalized.id] = normalized; return next; }); }

  const theme = dark ? 'bg-[#05070d] text-white [--mn-surface:rgba(255,255,255,0.08)] [--mn-border:rgba(255,255,255,0.13)]' : 'bg-[#f7f4ef] text-[#141821] [--mn-surface:rgba(255,255,255,0.86)] [--mn-border:rgba(20,24,33,0.14)]';
  return (
    <section dir={copy.dir} className={`relative min-h-screen overflow-hidden ${theme}`}>
      <img src={heroImage} alt="" className="fixed inset-0 h-full w-full object-cover opacity-20" />
      <div className={`fixed inset-0 ${dark ? 'bg-[linear-gradient(90deg,#05070d_0%,rgba(5,7,13,0.9)_50%,rgba(5,7,13,0.68)_100%)]' : 'bg-[linear-gradient(90deg,rgba(247,244,239,.98)_0%,rgba(247,244,239,.88)_58%,rgba(247,244,239,.78)_100%)]'}`} />
      <Sidebar copy={copy} dark={dark} lang={lang} open={open} pathname={pathname} query={query} setQuery={setQuery} submitSearch={submitSearch} setLang={(v) => { setLang(v); setOpen(false); }} setDark={(v) => { setDark(v); setOpen(false); }} close={() => setOpen(false)} />
      <div className="relative z-10 min-h-screen px-4 py-6 lg:ps-80">
        <header className="mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-[24px] border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 py-3 shadow-2xl backdrop-blur-xl">
          <button onClick={() => setOpen(true)} className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--mn-border)] transition hover:bg-current/10" aria-label="Open MovieNest menu"><Menu size={21} /></button>
          <Link href="/other/MovieNest" className="inline-flex min-h-11 items-center gap-3 rounded-2xl font-black"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-600 text-white"><Clapperboard size={22} /></span><span><span className="block text-xs uppercase tracking-[0.26em] text-red-400">MovieNest</span><span className="block text-lg leading-5">{copy.discover}</span></span></Link>
          <div className="hidden md:block"><MediaToggle copy={copy} mediaType={mediaType} setMediaType={setMediaType} /></div>
        </header>
        <main className="mx-auto mt-6 max-w-7xl pb-12">
          {view === 'home' && <HomeView copy={copy} loading={loading} message={message} movies={movies} hero={hero} mode={mode} mediaType={mediaType} loadList={loadList} toggleFavorite={toggleFavorite} favorites={favorites} />}
          {view === 'search' && <SearchView copy={copy} query={query} setQuery={setQuery} submitSearch={submitSearch} filters={filters} setFilters={setFilters} genres={genres} mediaType={mediaType} setMediaType={setMediaType} submitFilters={submitFilters} loading={loading} message={message} movies={movies} toggleFavorite={toggleFavorite} favorites={favorites} />}
          {view === 'movie' && <DetailView copy={copy} loading={loading} message={message} detail={detail} related={movies} mediaType={mediaType} toggleFavorite={toggleFavorite} favorites={favorites} retry={loadDetail} />}
          {view === 'actor' && <ActorView copy={copy} loading={loading} message={message} actor={actor} movies={movies} toggleFavorite={toggleFavorite} favorites={favorites} />}
          {view === 'favorites' && <FavoritesView copy={copy} movies={favoriteList} toggleFavorite={toggleFavorite} favorites={favorites} clear={() => setFavorites({})} />}
        </main>
      </div>
    </section>
  );
}

function Sidebar({ copy, dark, lang, open, pathname, query, setQuery, submitSearch, setLang, setDark, close }) {
  const nav = [{ href: '/other/MovieNest', label: copy.home, icon: Home }, { href: '/other/MovieNest/search', label: copy.search, icon: Search }, { href: '/other/MovieNest/favorites', label: copy.favorites, icon: Heart }];
  return <>{open && <button onClick={close} className="fixed inset-0 z-30 bg-black/60 lg:hidden" aria-label="Close menu" />}<aside className={`fixed inset-y-0 start-0 z-40 w-72 border-e border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 shadow-2xl backdrop-blur-2xl transition-transform duration-300 lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full'}`}><div className="flex items-center justify-between border-b border-[var(--mn-border)] pb-4"><Link href="/other/MovieNest" onClick={close} className="inline-flex min-h-11 items-center gap-3 rounded-2xl font-black"><span className="grid h-11 w-11 place-items-center rounded-2xl bg-red-600 text-white"><Film size={22} /></span>MovieNest</Link><button onClick={close} className="grid h-11 w-11 place-items-center rounded-2xl border border-[var(--mn-border)] lg:hidden" aria-label="Close menu"><X size={20} /></button></div><form onSubmit={submitSearch} className="mt-5 rounded-2xl border border-[var(--mn-border)] bg-black/10 p-2"><label className="flex min-h-12 items-center gap-2 px-2"><Search size={18} className="text-red-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={copy.placeholder} className="w-full bg-transparent text-sm font-bold outline-none placeholder:text-current/45" /></label><button className="mt-2 min-h-11 w-full rounded-xl bg-red-600 px-4 text-sm font-black text-white">{copy.go}</button></form><nav className="mt-5 space-y-2">{nav.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={close} className={`flex min-h-12 items-center gap-3 rounded-2xl px-4 text-sm font-black transition ${pathname === item.href ? 'bg-red-600 text-white' : 'hover:bg-current/10'}`}><Icon size={20} />{item.label}</Link>; })}</nav><div className="mt-5 space-y-4 rounded-2xl border border-[var(--mn-border)] p-4"><div><div className="mb-2 flex items-center gap-2 text-sm font-black"><Languages size={17} />{copy.language}</div><div className="grid grid-cols-2 gap-2"><button onClick={() => setLang('he')} className={`min-h-11 rounded-xl text-sm font-black ${lang === 'he' ? 'bg-red-600 text-white' : 'border border-[var(--mn-border)]'}`}>עברית</button><button onClick={() => setLang('en')} className={`min-h-11 rounded-xl text-sm font-black ${lang === 'en' ? 'bg-red-600 text-white' : 'border border-[var(--mn-border)]'}`}>English</button></div></div><div><div className="mb-2 flex items-center gap-2 text-sm font-black">{dark ? <Moon size={17} /> : <Sun size={17} />}{copy.theme}</div><div className="grid grid-cols-2 gap-2"><button onClick={() => setDark(false)} className={`min-h-11 rounded-xl text-sm font-black ${!dark ? 'bg-red-600 text-white' : 'border border-[var(--mn-border)]'}`}>{copy.light}</button><button onClick={() => setDark(true)} className={`min-h-11 rounded-xl text-sm font-black ${dark ? 'bg-red-600 text-white' : 'border border-[var(--mn-border)]'}`}>{copy.dark}</button></div></div></div></aside></>;
}
function MediaToggle({ copy, mediaType, setMediaType }) { return <div className="grid grid-cols-2 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-1">{[['movie', copy.movies, Film], ['tv', copy.tv, Tv]].map(([key, label, Icon]) => <button key={key} onClick={() => setMediaType(key)} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-black ${mediaType === key ? 'bg-red-600 text-white' : 'hover:bg-current/10'}`}><Icon size={16} />{label}</button>)}</div>; }
function HomeView({ copy, loading, message, movies, hero, mode, mediaType, loadList, toggleFavorite, favorites }) { return <div className="grid gap-8 2xl:grid-cols-[minmax(420px,0.8fr)_minmax(560px,1.2fr)] 2xl:items-start"><section className="min-h-[520px] 2xl:sticky 2xl:top-6 rounded-[28px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-6 shadow-2xl backdrop-blur-xl md:p-8"><div className="inline-flex items-center gap-2 rounded-full border border-red-400/30 bg-red-500/10 px-4 py-2 text-sm font-black text-red-300"><Clapperboard size={16} />MovieNest</div><h1 className="mt-5 max-w-2xl text-5xl font-black leading-tight md:text-7xl">{title(hero)}</h1><p className="mt-5 max-w-2xl text-lg leading-8 opacity-80">{hero?.overview || copy.subtitle}</p><Meta movie={hero} mediaType={mediaType} /><div className="mt-7 flex flex-wrap gap-3">{[['popular', copy.popular], ['top', copy.top], ['now', copy.now], ['upcoming', copy.upcoming]].map(([key, label]) => <button key={key} onClick={() => loadList(key, key === 'now' || key === 'upcoming' ? 'movie' : mediaType)} className={`min-h-11 rounded-2xl px-5 text-sm font-black transition hover:-translate-y-0.5 ${mode === key ? 'bg-red-600 text-white' : 'border border-[var(--mn-border)] bg-[var(--mn-surface)]'}`}>{label}</button>)}</div>{message && <Status message={message} />}{loading && <Loader copy={copy} />}</section><Grid movies={movies.slice(0, 9)} mediaType={mediaType} favorites={favorites} toggleFavorite={toggleFavorite} /></div>; }
function SearchView({ copy, query, setQuery, submitSearch, filters, setFilters, genres, mediaType, setMediaType, submitFilters, loading, message, movies, toggleFavorite, favorites }) { return <div className="space-y-6"><section className="rounded-[28px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-2xl backdrop-blur-xl"><div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><h1 className="text-4xl font-black">{copy.search}</h1><MediaToggle copy={copy} mediaType={mediaType} setMediaType={setMediaType} /></div><form onSubmit={submitSearch} className="grid gap-3 md:grid-cols-[1fr_auto]"><label className="flex min-h-12 items-center gap-3 rounded-2xl border border-[var(--mn-border)] px-4"><Search size={19} className="text-red-400" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={copy.placeholder} className="w-full bg-transparent font-bold outline-none placeholder:text-current/45" /></label><button className="min-h-12 rounded-2xl bg-red-600 px-6 font-black text-white">{copy.go}</button></form></section><form onSubmit={submitFilters} className="grid gap-3 rounded-[28px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 backdrop-blur-xl md:grid-cols-5"><Field label={copy.year}><input value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="min-h-12 w-full rounded-2xl border border-[var(--mn-border)] bg-transparent px-4 font-bold outline-none" placeholder="2026" /></Field><Field label={copy.genre}><select value={filters.genres} onChange={(e) => setFilters({ ...filters, genres: e.target.value })} className="min-h-12 w-full rounded-2xl border border-[var(--mn-border)] bg-transparent px-4 font-bold outline-none"><option value="">All</option>{genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field><Field label={copy.rating}><input value={filters.rating} onChange={(e) => setFilters({ ...filters, rating: e.target.value })} className="min-h-12 w-full rounded-2xl border border-[var(--mn-border)] bg-transparent px-4 font-bold outline-none" placeholder="7" /></Field><Field label={copy.sort}><select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })} className="min-h-12 w-full rounded-2xl border border-[var(--mn-border)] bg-transparent px-4 font-bold outline-none"><option value="popularity.desc">Popularity</option><option value="vote_average.desc">Rating</option><option value="primary_release_date.desc">Newest</option></select></Field><button className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-red-600 px-4 font-black text-white"><SlidersHorizontal size={18} />{copy.filterGo}</button></form>{message && <Status message={message} />}{loading ? <Loader copy={copy} /> : <Grid movies={movies} mediaType={mediaType} favorites={favorites} toggleFavorite={toggleFavorite} />}</div>; }
function DetailView({ copy, loading, message, detail, related, mediaType, toggleFavorite, favorites, retry }) { if (loading) return <Loader copy={copy} />; if (!detail) return <ErrorPanel copy={copy} message={message} retry={retry} />; const cast = detail.credits?.cast?.slice(0, 10) || []; const fav = Boolean(favorites[detail.id]); return <div className="space-y-8"><section className="grid gap-6 rounded-[32px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-2xl backdrop-blur-xl lg:grid-cols-[320px_1fr]"><Poster movie={detail} /><div className="flex flex-col justify-center"><div className="w-fit rounded-full bg-red-600 px-4 py-2 text-sm font-black text-white">{copy.details}</div><h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">{title(detail)}</h1><Meta movie={detail} mediaType={mediaType} /><p className="mt-5 max-w-3xl text-lg leading-8 opacity-80">{detail.overview || copy.empty}</p><button onClick={() => toggleFavorite(detail)} className={`mt-6 inline-flex min-h-12 w-fit items-center gap-2 rounded-2xl px-5 font-black ${fav ? 'bg-white text-red-700' : 'bg-red-600 text-white'}`}><Heart size={19} fill="currentColor" />{fav ? copy.remove : copy.add}</button></div></section>{cast.length > 0 && <Cast copy={copy} cast={cast} />}<Title text={copy.similar} /><Grid movies={related?.slice(0, 12)} mediaType={mediaType} favorites={favorites} toggleFavorite={toggleFavorite} /></div>; }
function ActorView({ copy, loading, message, actor, movies, toggleFavorite, favorites }) { if (loading) return <Loader copy={copy} />; if (!actor) return <ErrorPanel copy={copy} message={message} />; return <div className="space-y-8"><section className="grid gap-6 rounded-[32px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-2xl backdrop-blur-xl md:grid-cols-[220px_1fr]"><div className="aspect-[3/4] overflow-hidden rounded-[24px] bg-black/20">{profile(actor) ? <img src={profile(actor)} alt={actor.name} className="h-full w-full object-cover" /> : <Fallback icon={UserRound} />}</div><div className="flex flex-col justify-center"><h1 className="text-4xl font-black md:text-6xl">{actor.name}</h1><p className="mt-5 max-w-3xl text-lg leading-8 opacity-80">{actor.biography || copy.actorMovies}</p></div></section><Title text={copy.actorMovies} />{message && <Status message={message} />}<Grid movies={movies} mediaType="movie" favorites={favorites} toggleFavorite={toggleFavorite} /></div>; }
function FavoritesView({ copy, movies, toggleFavorite, favorites, clear }) { return <div className="space-y-6"><section className="flex flex-col gap-4 rounded-[28px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between"><div><h1 className="text-4xl font-black">{copy.favorites}</h1><p className="mt-2 opacity-70">{movies.length ? movies.length : copy.emptyFav}</p></div>{movies.length > 0 && <button onClick={clear} className="min-h-11 rounded-2xl border border-[var(--mn-border)] px-5 font-black">{copy.clear}</button>}</section>{movies.length ? <Grid movies={movies} mediaType="movie" favorites={favorites} toggleFavorite={toggleFavorite} /> : <div className="rounded-[28px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-8 text-center text-lg font-black backdrop-blur-xl">{copy.emptyFav}</div>}</div>; }
function Grid({ movies = [], mediaType, favorites, toggleFavorite }) { if (!movies.length) return null; return <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">{movies.map((m) => <Card key={`${m.media_type || mediaType}-${m.id}`} movie={m} mediaType={m.media_type || mediaType} favorite={Boolean(favorites[m.id])} toggleFavorite={toggleFavorite} />)}</div>; }
function Card({ movie, mediaType, favorite, toggleFavorite }) { return <article className="group overflow-hidden rounded-[24px] border border-[var(--mn-border)] bg-[var(--mn-surface)] shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1"><Link href={href(movie, mediaType)} className="block"><div className="relative aspect-[2/3] overflow-hidden bg-black/20"><Poster movie={movie} compact /><span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/72 px-3 py-1 text-xs font-black text-white"><Star size={13} fill="currentColor" className="text-yellow-300" />{Number(movie.vote_average || movie.popularity || 0).toFixed(1)}</span></div><div className="p-4"><h2 className="line-clamp-1 text-lg font-black">{title(movie)}</h2><p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 opacity-70">{movie.overview || year(movie)}</p></div></Link><button onClick={() => toggleFavorite(movie)} className="mx-4 mb-4 inline-flex min-h-11 w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-2xl border border-[var(--mn-border)] font-black transition hover:bg-red-600 hover:text-white" aria-label="Toggle favorite"><Heart size={18} fill={favorite ? 'currentColor' : 'none'} className={favorite ? 'text-red-500' : ''} /></button></article>; }
function Cast({ copy, cast }) { return <section><Title text={copy.cast} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cast.map((a) => <Link key={a.cast_id || a.credit_id || a.id} href={`/other/MovieNest/actor/${a.id}`} className="rounded-[22px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 backdrop-blur-xl transition hover:-translate-y-1"><div className="aspect-[3/4] overflow-hidden rounded-2xl bg-black/20">{profile(a) ? <img src={profile(a)} alt={a.name} className="h-full w-full object-cover" /> : <Fallback icon={UserRound} />}</div><h3 className="mt-3 line-clamp-1 font-black">{a.name}</h3><p className="line-clamp-1 text-sm opacity-65">{a.character}</p></Link>)}</div></section>; }
function Poster({ movie, compact = false }) { return <div className={`${compact ? 'h-full w-full' : 'aspect-[2/3] overflow-hidden rounded-[24px]'} bg-black/20`}>{poster(movie) ? <img src={poster(movie)} alt={title(movie)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <Fallback />}</div>; }
function Meta({ movie, mediaType }) { return <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-black opacity-90"><span className="inline-flex items-center gap-2 rounded-full bg-current/10 px-4 py-2"><Star size={16} fill="currentColor" className="text-yellow-400" />{Number(movie?.vote_average || 0).toFixed(1)}</span><span className="inline-flex items-center gap-2 rounded-full bg-current/10 px-4 py-2"><CalendarDays size={16} />{year(movie)}</span><span className="inline-flex items-center gap-2 rounded-full bg-current/10 px-4 py-2">{mediaType === 'tv' ? <Tv size={16} /> : <Film size={16} />}{mediaType === 'tv' ? 'TV' : 'Movie'}</span></div>; }
function Field({ label, children }) { return <label className="block text-sm font-black"><span className="mb-2 block opacity-75">{label}</span>{children}</label>; }
function Title({ text }) { return <h2 className="mb-4 text-3xl font-black">{text}</h2>; }
function Loader({ copy }) { return <div className="grid min-h-64 place-items-center rounded-[28px] border border-[var(--mn-border)] bg-[var(--mn-surface)] p-8 text-center backdrop-blur-xl"><div><LoaderCircle className="mx-auto animate-spin text-red-500" size={42} /><p className="mt-4 font-black">{copy.loading}</p></div></div>; }
function Status({ message }) { return <p className="mt-4 inline-flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-300"><AlertTriangle size={17} />{message}</p>; }
function ErrorPanel({ copy, message, retry }) { return <div className="rounded-[28px] border border-red-400/30 bg-red-500/10 p-8 text-center backdrop-blur-xl"><AlertTriangle className="mx-auto text-red-400" size={44} /><h1 className="mt-4 text-3xl font-black">{copy.error}</h1><p className="mt-3 opacity-75">{message}</p>{retry && <button onClick={retry} className="mt-5 rounded-2xl bg-red-600 px-5 py-3 font-black text-white">Retry</button>}</div>; }
function Fallback({ icon: Icon = Clapperboard }) { return <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 text-white"><Icon size={44} /></div>; }
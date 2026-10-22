"use client";

import Link from 'next/link';
import { useParams, usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CalendarDays, Check, ChevronLeft, ChevronRight, Clapperboard, Film, Heart, Home, Languages, LoaderCircle, Menu, Moon, Play, Search, SlidersHorizontal, Star, Sun, Tv, UserRound, X } from 'lucide-react';

const IMG = 'https://image.tmdb.org/t/p/';
const KEY = 'siteMovies';
const demoMovies = [
  { id: 9001, title: 'Midnight Signal', overview: 'A neon mystery about one lost transmission and the city that follows it.', vote_average: 8.4, release_date: '2026-02-14', media_type: 'movie' },
  { id: 9002, title: 'The Last Frame', overview: 'A filmmaker chases a missing reel through old theaters and forgotten archives.', vote_average: 7.9, release_date: '2025-11-07', media_type: 'movie' },
  { id: 9003, title: 'Orbit House', overview: 'A warm science fiction story about a family hotel at the edge of the galaxy.', vote_average: 8.1, release_date: '2026-01-20', media_type: 'movie' },
];
const demoSeries = [
  { id: 9101, name: 'Harbor Lights', overview: 'Families, secrets and second chances in a city by the water.', vote_average: 8.0, first_air_date: '2026-03-05', media_type: 'tv' },
  { id: 9102, name: 'Signal Room', overview: 'A tense newsroom drama where every broadcast changes the story.', vote_average: 7.8, first_air_date: '2026-01-17', media_type: 'tv' },
  { id: 9103, name: 'North Station', overview: 'A detective series built around one impossible night train.', vote_average: 8.2, first_air_date: '2025-12-10', media_type: 'tv' },
];
const fallbackGenres = [
  { id: 28, name: 'Action' }, { id: 12, name: 'Adventure' }, { id: 35, name: 'Comedy' }, { id: 18, name: 'Drama' }, { id: 27, name: 'Horror' }, { id: 878, name: 'Science Fiction' }, { id: 53, name: 'Thriller' },
];
const T = {
  he: { dir: 'rtl', locale: 'he-IL', home: 'בית', search: 'חיפוש', favorites: 'מועדפים', movies: 'סרטים', tv: 'סדרות', popular: 'הכי נצפים', top: 'מדורג גבוה', now: 'חדשים בקולנוע', upcoming: 'בקרוב', discover: 'MovieNest', subtitle: 'כל הסרטים והסדרות החדשים במקום אחד.', placeholder: 'חפש סרט לפי שם...', go: 'חפש', filterGo: 'חפש לפי פילטרים', year: 'שנה', genre: 'קטגוריה', rating: 'דירוג מינימלי', sort: 'מיון', language: 'שפה', theme: 'מצב תצוגה', light: 'בהיר', dark: 'חשוך', details: 'פרטים', cast: 'שחקנים בסרט', similar: 'עוד כותרים דומים', actorMovies: 'סרטים וסדרות של השחקן', add: 'הוסף למועדפים', added: 'נוסף למועדפים', remove: 'הסר ממועדפים', watch: 'צפייה עכשיו', newMovies: 'סרטים חדשים', newSeries: 'סדרות חדשות', emptyFav: 'עדיין אין מועדפים שמורים.', empty: 'לא נמצאו תוצאות מתאימות.', loading: 'טוען כותרים...', error: 'משהו השתבש בטעינת הסרטים.', clear: 'נקה מועדפים' },
  en: { dir: 'ltr', locale: 'en-US', home: 'Home', search: 'Search', favorites: 'Favorites', movies: 'Movies', tv: 'TV', popular: 'Most watched', top: 'Top rated', now: 'New movies', upcoming: 'Upcoming', discover: 'MovieNest', subtitle: 'Fresh movies and series in one calm place.', placeholder: 'Search a movie by name...', go: 'Search', filterGo: 'Search filters', year: 'Year', genre: 'Genre', rating: 'Minimum rating', sort: 'Sort', language: 'Language', theme: 'Theme', light: 'Light', dark: 'Dark', details: 'Details', cast: 'Cast', similar: 'More like this', actorMovies: 'Actor filmography', add: 'Add favorite', added: 'Added to favorites', remove: 'Remove favorite', watch: 'Watch now', newMovies: 'New movies', newSeries: 'New series', emptyFav: 'No favorites saved yet.', empty: 'No matching results found.', loading: 'Loading titles...', error: 'Something went wrong while loading movies.', clear: 'Clear favorites' },
};

function initialStore() {
  if (typeof window === 'undefined') return { settings: { darkMode: false, language: 'he' }, user: { favorites: {} } };
  const parsed = JSON.parse(localStorage.getItem(KEY) || 'null') || { settings: {}, user: {} };
  const store = { settings: { darkMode: false, language: 'he', ...parsed.settings }, user: { favorites: {}, ...parsed.user } };
  localStorage.setItem(KEY, JSON.stringify(store));
  return store;
}
function title(item) { return item?.title || item?.name || item?.original_title || item?.original_name || 'MovieNest'; }
function year(item) { return (item?.release_date || item?.first_air_date || '').slice(0, 4) || '2026'; }
function poster(item) { return item?.poster_path ? `${IMG}w500${item.poster_path}` : ''; }
function backdrop(item) { return item?.backdrop_path ? `${IMG}w1280${item.backdrop_path}` : ''; }
function profile(item) { return item?.profile_path ? `${IMG}w300${item.profile_path}` : ''; }
function cleanMediaType(item, fallback = 'movie') { return item?.media_type && item.media_type !== 'person' ? item.media_type : fallback; }
function href(movie, mediaType) { const type = cleanMediaType(movie, mediaType); return `/other/MovieNest/movie/${movie.id}?mediaType=${type}`; }
function watchHref(item, mediaType) { return `https://67movies.gd/watch/${cleanMediaType(item, mediaType) === 'tv' ? 'tv' : 'movie'}/${item.id}`; }
async function api(params) { const res = await fetch(`/api/other/movienest?${params}`); const data = await res.json(); if (!res.ok) throw new Error(data.error || 'MovieNest request failed'); return data; }

export default function MovieNestClient({ view = 'home' }) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);
  const [lang, setLang] = useState('he');
  const [dark, setDark] = useState(false);
  const [favorites, setFavorites] = useState({});
  const [mediaType, setMediaType] = useState(searchParams.get('mediaType') || 'movie');
  const [query, setQuery] = useState(searchParams.get('q') || '');
  const [movies, setMovies] = useState(demoMovies);
  const [homeRows, setHomeRows] = useState({ popular: demoMovies, movies: demoMovies, series: demoSeries });
  const [detail, setDetail] = useState(null);
  const [actor, setActor] = useState(null);
  const [genres, setGenres] = useState(fallbackGenres);
  const [mode, setMode] = useState('popular');
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [open, setOpen] = useState(false);
  const [favoritePulseId, setFavoritePulseId] = useState(null);
  const [filters, setFilters] = useState({ year: '', genres: '', rating: '', sortBy: 'popularity.desc' });
  const copy = T[lang];
  const favoriteList = useMemo(() => Object.values(favorites), [favorites]);
  const hero = homeRows.popular[0] || detail || movies[0] || demoMovies[0];
  const heroImage = backdrop(hero) || 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=1600&q=80';

  useEffect(() => { const store = initialStore(); setLang(store.settings.language || 'he'); setDark(Boolean(store.settings.darkMode)); setFavorites(store.user.favorites || {}); setReady(true); }, []);
  useEffect(() => { if (!ready) return; localStorage.setItem(KEY, JSON.stringify({ settings: { language: lang, darkMode: dark }, user: { favorites } })); }, [dark, favorites, lang, ready]);
  useEffect(() => { setMediaType(searchParams.get('mediaType') || 'movie'); setQuery(searchParams.get('q') || ''); }, [searchParams]);

  const loadGenres = useCallback(async () => {
    try { const data = await api(new URLSearchParams({ type: 'genres', language: copy.locale })); setGenres(data.genres?.length ? data.genres : fallbackGenres); } catch { setGenres(fallbackGenres); }
  }, [copy.locale]);
  const loadHome = useCallback(async () => {
    setLoading(true); setMessage(''); setDetail(null); setActor(null); setMode('popular');
    try {
      const [popularData, moviesData, seriesData] = await Promise.all([
        api(new URLSearchParams({ type: 'popular', mediaType: 'movie', page: '1', language: copy.locale })),
        api(new URLSearchParams({ type: 'now', mediaType: 'movie', page: '1', language: copy.locale })),
        api(new URLSearchParams({ type: 'popular', mediaType: 'tv', page: '1', language: copy.locale })),
      ]);
      const popular = (popularData.results || []).map((item) => ({ ...item, media_type: 'movie' }));
      const newMovies = (moviesData.results || []).map((item) => ({ ...item, media_type: 'movie' }));
      const newSeries = (seriesData.results || []).map((item) => ({ ...item, media_type: 'tv' }));
      setHomeRows({
        popular: popular.length ? popular.slice(0, 5) : demoMovies,
        movies: newMovies.length ? newMovies.slice(0, 6) : demoMovies,
        series: newSeries.length ? newSeries.slice(0, 6) : demoSeries,
      });
    } catch (e) {
      setHomeRows({ popular: demoMovies, movies: demoMovies, series: demoSeries });
      setMessage(e.message || copy.error);
    } finally {
      setLoading(false);
    }
  }, [copy.error, copy.locale]);
  const loadList = useCallback(async (nextMode = 'popular', nextMedia = mediaType, nextFilters = filters) => {
    setLoading(true); setMessage(''); setMode(nextMode); setDetail(null); setActor(null);
    try {
      const p = new URLSearchParams({ type: nextMode, mediaType: nextMedia, page: '1', language: copy.locale });
      if (nextMode === 'search') p.set('query', query.trim());
      if (nextMode === 'discover') Object.entries(nextFilters).forEach(([k, v]) => v && p.set(k, v));
      const data = await api(p); const results = data.results || [];
      setMovies(results.length ? results : demoMovies); if (!results.length) setMessage(copy.empty);
    } catch (e) { setMovies(demoMovies); setMessage(e.message || copy.error); } finally { setLoading(false); }
  }, [copy.empty, copy.error, copy.locale, filters, mediaType, query]);
  const loadDetail = useCallback(async () => {
    if (!params?.id) return; setLoading(true); setMessage(''); setActor(null);
    try { const data = await api(new URLSearchParams({ type: 'detail', id: String(params.id), mediaType, language: copy.locale })); setDetail({ ...data, media_type: mediaType }); setMovies(data.similar?.results?.length ? data.similar.results : data.recommendations?.results || []); }
    catch (e) { setDetail(null); setMovies(demoMovies); setMessage(e.message || copy.error); } finally { setLoading(false); }
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
    else loadHome();
  }, [favoriteList, lang, loadActor, loadDetail, loadHome, loadList, mediaType, ready, searchParams, view]);

  function submitSearch(e) { e.preventDefault(); const q = query.trim(); router.push(`/other/MovieNest/search${q ? `?q=${encodeURIComponent(q)}&mediaType=movie` : ''}`); setOpen(false); }
  function submitFilters(e) { e.preventDefault(); const p = new URLSearchParams({ mediaType }); Object.entries(filters).forEach(([k, v]) => v && p.set(k, v)); router.push(`/other/MovieNest/search?${p}`); loadList('discover', mediaType, filters); }
  function toggleFavorite(movie) {
    const normalized = { ...movie, media_type: cleanMediaType(movie, mediaType) };
    setFavorites((current) => {
      const next = { ...current };
      if (next[normalized.id]) delete next[normalized.id];
      else {
        next[normalized.id] = normalized;
        setFavoritePulseId(normalized.id);
        window.setTimeout(() => setFavoritePulseId(null), 650);
      }
      return next;
    });
  }

  const theme = dark ? 'bg-[#101820] text-[#f7faf7] [--mn-surface:rgba(22,35,43,0.88)] [--mn-soft:rgba(129,197,188,0.14)] [--mn-border:rgba(203,225,219,0.22)] [--mn-accent:#56b6a8] [--mn-accent-strong:#2f8f83] [--mn-on-accent:#ffffff]' : 'bg-[#f4f7f3] text-[#1d2926] [--mn-surface:rgba(255,255,255,0.88)] [--mn-soft:rgba(86,182,168,0.13)] [--mn-border:rgba(33,61,56,0.14)] [--mn-accent:#2f8f83] [--mn-accent-strong:#21766d] [--mn-on-accent:#ffffff]';
  return (
    <section dir="rtl" className={`relative min-h-screen overflow-hidden text-right ${theme}`}>
      <style jsx global>{`
        @keyframes favorite-pop {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(86, 182, 168, 0.45); }
          45% { transform: scale(1.06); box-shadow: 0 0 0 14px rgba(86, 182, 168, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(86, 182, 168, 0); }
        }
        .favorite-celebrate { animation: favorite-pop 560ms ease-out; }
      `}</style>
      <img src={heroImage} alt="" className="fixed inset-0 h-full w-full object-cover opacity-10" />
      <div className={`fixed inset-0 ${dark ? 'bg-[linear-gradient(90deg,rgba(16,24,32,.98)_0%,rgba(16,24,32,.92)_58%,rgba(16,24,32,.82)_100%)]' : 'bg-[linear-gradient(90deg,rgba(244,247,243,.98)_0%,rgba(244,247,243,.93)_58%,rgba(244,247,243,.82)_100%)]'}`} />
      <Sidebar copy={copy} dark={dark} lang={lang} open={open} pathname={pathname} setLang={(v) => { setLang(v); setOpen(false); }} setDark={(v) => { setDark(v); setOpen(false); }} close={() => setOpen(false)} />
      <div className="relative z-10 min-h-screen px-4 py-6">
        <header className="mr-0 flex w-full max-w-7xl items-center justify-between gap-3 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] px-4 py-3 shadow-[0_18px_50px_rgba(24,54,49,0.12)] backdrop-blur-xl">
          <button onClick={() => setOpen((current) => !current)} className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--mn-border)] transition hover:bg-[var(--mn-soft)]" aria-label="Toggle MovieNest menu">{open ? <X size={21} /> : <Menu size={21} />}</button>
          <Link href="/other/MovieNest" className="inline-flex min-h-11 items-center gap-3 rounded-xl font-black"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--mn-accent)] text-[var(--mn-on-accent)]"><Clapperboard size={22} /></span><span><span className="block text-xs uppercase text-[var(--mn-accent)]">MovieNest</span><span className="block text-lg leading-5">{copy.subtitle}</span></span></Link>
          <Link href="/other/MovieNest/search" className="hidden min-h-11 items-center gap-2 rounded-xl border border-[var(--mn-border)] px-4 text-sm font-black transition hover:bg-[var(--mn-soft)] md:inline-flex"><Search size={18} />{copy.search}</Link>
        </header>
        <main className="mr-0 mt-6 w-full max-w-7xl pb-12">
          {view === 'home' && <HomeView copy={copy} loading={loading} message={message} rows={homeRows} />}
          {view === 'search' && <SearchView copy={copy} query={query} setQuery={setQuery} submitSearch={submitSearch} filters={filters} setFilters={setFilters} genres={genres} mediaType={mediaType} setMediaType={setMediaType} submitFilters={submitFilters} loading={loading} message={message} movies={movies} toggleFavorite={toggleFavorite} favorites={favorites} />}
          {view === 'movie' && <DetailView copy={copy} loading={loading} message={message} detail={detail} related={movies} mediaType={mediaType} toggleFavorite={toggleFavorite} favorites={favorites} retry={loadDetail} favoritePulseId={favoritePulseId} />}
          {view === 'actor' && <ActorView copy={copy} loading={loading} message={message} actor={actor} movies={movies} toggleFavorite={toggleFavorite} favorites={favorites} />}
          {view === 'favorites' && <FavoritesView copy={copy} movies={favoriteList} toggleFavorite={toggleFavorite} favorites={favorites} clear={() => setFavorites({})} />}
        </main>
      </div>
    </section>
  );
}

function Sidebar({ copy, dark, lang, open, pathname, setLang, setDark, close }) {
  const nav = [{ href: '/other/MovieNest', label: copy.home, icon: Home }, { href: '/other/MovieNest/search', label: copy.search, icon: Search }, { href: '/other/MovieNest/favorites', label: copy.favorites, icon: Heart }];
  return <>{open && <button onClick={close} className="fixed inset-0 z-[80] bg-black/55 backdrop-blur-sm" aria-label="Close menu" />}<aside style={{ right: 0, left: 'auto' }} className={`fixed inset-y-0 z-[90] w-72 border-l border-[var(--mn-border)] bg-[var(--mn-surface)] p-4 text-right shadow-2xl backdrop-blur-2xl transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}><div className="flex items-center justify-between border-b border-[var(--mn-border)] pb-4"><Link href="/other/MovieNest" onClick={close} className="inline-flex min-h-11 items-center gap-3 rounded-xl font-black"><span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--mn-accent)] text-[var(--mn-on-accent)]"><Film size={22} /></span>MovieNest</Link><button onClick={close} className="grid h-11 w-11 place-items-center rounded-xl border border-[var(--mn-border)] hover:bg-[var(--mn-soft)]" aria-label="Close menu"><X size={20} /></button></div><nav className="mt-5 space-y-2">{nav.map((item) => { const Icon = item.icon; return <Link key={item.href} href={item.href} onClick={close} className={`flex min-h-12 flex-row-reverse items-center justify-end gap-3 rounded-xl px-4 text-sm font-black transition ${pathname === item.href ? 'bg-[var(--mn-accent)] text-[var(--mn-on-accent)]' : 'hover:bg-[var(--mn-soft)]'}`}><Icon size={20} />{item.label}</Link>; })}</nav><div className="mt-5 space-y-4 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-soft)] p-4"><div><div className="mb-2 flex flex-row-reverse items-center justify-end gap-2 text-sm font-black"><Languages size={17} />{copy.language}</div><div className="grid grid-cols-2 gap-2"><button onClick={() => setLang('he')} className={`min-h-11 rounded-xl text-sm font-black ${lang === 'he' ? 'bg-[var(--mn-accent)] text-[var(--mn-on-accent)]' : 'border border-[var(--mn-border)] bg-[var(--mn-surface)]'}`}>עברית</button><button onClick={() => setLang('en')} className={`min-h-11 rounded-xl text-sm font-black ${lang === 'en' ? 'bg-[var(--mn-accent)] text-[var(--mn-on-accent)]' : 'border border-[var(--mn-border)] bg-[var(--mn-surface)]'}`}>English</button></div></div><div><div className="mb-2 flex flex-row-reverse items-center justify-end gap-2 text-sm font-black">{dark ? <Moon size={17} /> : <Sun size={17} />}{copy.theme}</div><div className="grid grid-cols-2 gap-2"><button onClick={() => setDark(false)} className={`min-h-11 rounded-xl text-sm font-black ${!dark ? 'bg-[var(--mn-accent)] text-[var(--mn-on-accent)]' : 'border border-[var(--mn-border)] bg-[var(--mn-surface)]'}`}>{copy.light}</button><button onClick={() => setDark(true)} className={`min-h-11 rounded-xl text-sm font-black ${dark ? 'bg-[var(--mn-accent)] text-[var(--mn-on-accent)]' : 'border border-[var(--mn-border)] bg-[var(--mn-surface)]'}`}>{copy.dark}</button></div></div></div></aside></>;
}
function MediaToggle({ copy, mediaType, setMediaType }) { return <div className="grid grid-cols-2 rounded-xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-1">{[['movie', copy.movies, Film], ['tv', copy.tv, Tv]].map(([key, label, Icon]) => <button key={key} onClick={() => setMediaType(key)} className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-black ${mediaType === key ? 'bg-[var(--mn-accent)] text-[var(--mn-on-accent)]' : 'hover:bg-[var(--mn-soft)]'}`}><Icon size={16} />{label}</button>)}</div>; }
function HomeView({ copy, loading, message, rows }) { return <div className="space-y-8"><HeroSlider copy={copy} movies={rows.popular} />{message && <Status message={message} />}{loading && <Loader copy={copy} />}<MovieRail titleText={copy.newMovies} movies={rows.movies} mediaType="movie" /><MovieRail titleText={copy.newSeries} movies={rows.series} mediaType="tv" /></div>; }
function HeroSlider({ copy, movies = [] }) {
  const [index, setIndex] = useState(0);
  const slides = movies.slice(0, 5);
  const active = slides[index] || slides[0];
  const move = (step) => setIndex((current) => (current + step + slides.length) % slides.length);

  useEffect(() => {
    if (slides.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % slides.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!active) return null;
  return <section className="relative overflow-hidden rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] shadow-[0_18px_50px_rgba(24,54,49,0.12)] backdrop-blur-xl"><Link href={href(active, 'movie')} className="group relative block h-[210px] overflow-hidden bg-black/20 md:h-[240px]"><Poster movie={active} compact /><div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" /><div className="absolute inset-x-0 bottom-0 p-4 text-right text-white md:p-5"><div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-black backdrop-blur"><Star size={15} fill="currentColor" className="text-amber-300" />{copy.popular}</div><h1 className="max-w-3xl text-3xl font-black leading-tight md:text-4xl">{title(active)}</h1><Meta movie={active} mediaType="movie" compact /></div></Link>{slides.length > 1 && <><button type="button" onClick={() => move(1)} className="absolute right-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75" aria-label="Next movie"><ChevronRight size={23} /></button><button type="button" onClick={() => move(-1)} className="absolute left-4 top-1/2 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-black/55 text-white backdrop-blur transition hover:bg-black/75" aria-label="Previous movie"><ChevronLeft size={23} /></button><div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2">{slides.map((movie, dotIndex) => <button key={movie.id} type="button" onClick={() => setIndex(dotIndex)} className={`h-2 rounded-full transition-all ${dotIndex === index ? 'w-7 bg-white' : 'w-2 bg-white/45'}`} aria-label={`Go to slide ${dotIndex + 1}`} />)}</div></>}</section>;
}
function MovieRail({ titleText, movies = [], mediaType }) { if (!movies.length) return null; return <section><Title text={titleText} /><Grid movies={movies.slice(0, 6)} mediaType={mediaType} showFavorite={false} /></section>; }
function SearchView({ copy, query, setQuery, submitSearch, filters, setFilters, genres, mediaType, setMediaType, submitFilters, loading, message, movies, toggleFavorite, favorites }) { return <div className="space-y-6"><section className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-[0_18px_50px_rgba(24,54,49,0.12)] backdrop-blur-xl"><div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between"><h1 className="text-4xl font-black">{copy.search}</h1><MediaToggle copy={copy} mediaType={mediaType} setMediaType={setMediaType} /></div><form onSubmit={submitSearch} className="grid gap-3 md:grid-cols-[1fr_auto]"><label className="flex min-h-12 items-center gap-3 rounded-xl border border-[var(--mn-border)] px-4"><Search size={19} className="text-[var(--mn-accent)]" /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={copy.placeholder} className="w-full bg-transparent font-bold outline-none placeholder:text-current/45" /></label><button className="min-h-12 rounded-xl bg-[var(--mn-accent)] px-6 font-black text-[var(--mn-on-accent)]">{copy.go}</button></form></section><form onSubmit={submitFilters} className="grid gap-3 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 backdrop-blur-xl md:grid-cols-5"><Field label={copy.year}><input value={filters.year} onChange={(e) => setFilters({ ...filters, year: e.target.value })} className="min-h-12 w-full rounded-xl border border-[var(--mn-border)] bg-transparent px-4 font-bold outline-none" placeholder="2026" /></Field><Field label={copy.genre}><select value={filters.genres} onChange={(e) => setFilters({ ...filters, genres: e.target.value })} className="min-h-12 w-full rounded-xl border border-[var(--mn-border)] bg-transparent px-4 font-bold outline-none"><option value="">All</option>{genres.map((g) => <option key={g.id} value={g.id}>{g.name}</option>)}</select></Field><Field label={copy.rating}><input value={filters.rating} onChange={(e) => setFilters({ ...filters, rating: e.target.value })} className="min-h-12 w-full rounded-xl border border-[var(--mn-border)] bg-transparent px-4 font-bold outline-none" placeholder="7" /></Field><Field label={copy.sort}><select value={filters.sortBy} onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })} className="min-h-12 w-full rounded-xl border border-[var(--mn-border)] bg-transparent px-4 font-bold outline-none"><option value="popularity.desc">Popularity</option><option value="vote_average.desc">Rating</option><option value="primary_release_date.desc">Newest</option></select></Field><button className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[var(--mn-accent)] px-4 font-black text-[var(--mn-on-accent)]"><SlidersHorizontal size={18} />{copy.filterGo}</button></form>{message && <Status message={message} />}{loading ? <Loader copy={copy} /> : <Grid movies={movies} mediaType={mediaType} favorites={favorites} toggleFavorite={toggleFavorite} />}</div>; }
function DetailView({ copy, loading, message, detail, related, mediaType, toggleFavorite, favorites, retry, favoritePulseId }) { if (loading) return <Loader copy={copy} />; if (!detail) return <ErrorPanel copy={copy} message={message} retry={retry} />; const cast = detail.credits?.cast?.slice(0, 10) || []; const fav = Boolean(favorites[detail.id]); return <div className="space-y-8"><section className="grid gap-6 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-[0_18px_50px_rgba(24,54,49,0.12)] backdrop-blur-xl lg:grid-cols-[320px_1fr]"><Poster movie={detail} /><div className="flex flex-col items-start justify-center"><div className="w-fit rounded-full bg-[var(--mn-soft)] px-4 py-2 text-sm font-black text-[var(--mn-accent)]">{copy.details}</div><h1 className="mt-4 text-4xl font-black leading-tight md:text-6xl">{title(detail)}</h1><Meta movie={detail} mediaType={mediaType} /><p className="mt-5 max-w-3xl text-lg leading-8 opacity-80">{detail.overview || copy.empty}</p><div className="mt-6 flex flex-wrap gap-3"><a href={watchHref(detail, mediaType)} target="_blank" rel="noreferrer" className="inline-flex min-h-12 items-center gap-2 rounded-xl bg-[var(--mn-accent)] px-5 font-black text-[var(--mn-on-accent)] transition hover:-translate-y-0.5"><Play size={19} fill="currentColor" />{copy.watch}</a><button onClick={() => toggleFavorite(detail)} className={`inline-flex min-h-12 items-center gap-2 rounded-xl px-5 font-black transition ${fav ? 'favorite-celebrate bg-[var(--mn-soft)] text-[var(--mn-accent-strong)]' : 'border border-[var(--mn-border)] bg-[var(--mn-surface)] hover:bg-[var(--mn-soft)]'} ${favoritePulseId === detail.id ? 'favorite-celebrate' : ''}`}><Heart size={19} fill={fav ? 'currentColor' : 'none'} />{fav ? copy.added : copy.add}</button></div></div></section>{cast.length > 0 && <Cast copy={copy} cast={cast} />}<Title text={copy.similar} /><Grid movies={related?.slice(0, 12)} mediaType={mediaType} favorites={favorites} toggleFavorite={toggleFavorite} /></div>; }
function ActorView({ copy, loading, message, actor, movies, toggleFavorite, favorites }) { if (loading) return <Loader copy={copy} />; if (!actor) return <ErrorPanel copy={copy} message={message} />; return <div className="space-y-8"><section className="grid gap-6 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-5 shadow-[0_18px_50px_rgba(24,54,49,0.12)] backdrop-blur-xl md:grid-cols-[220px_1fr]"><div className="aspect-[3/4] overflow-hidden rounded-2xl bg-black/20">{profile(actor) ? <img src={profile(actor)} alt={actor.name} className="h-full w-full object-cover" /> : <Fallback icon={UserRound} />}</div><div className="flex flex-col items-start justify-center"><h1 className="text-4xl font-black md:text-6xl">{actor.name}</h1><p className="mt-5 max-w-3xl text-lg leading-8 opacity-80">{actor.biography || copy.actorMovies}</p></div></section><Title text={copy.actorMovies} />{message && <Status message={message} />}<Grid movies={movies} mediaType="movie" favorites={favorites} toggleFavorite={toggleFavorite} /></div>; }
function FavoritesView({ copy, movies, toggleFavorite, favorites, clear }) { return <div className="space-y-6"><section className="flex flex-col gap-4 rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-6 backdrop-blur-xl md:flex-row md:items-center md:justify-between"><div><h1 className="text-4xl font-black">{copy.favorites}</h1><p className="mt-2 opacity-70">{movies.length ? movies.length : copy.emptyFav}</p></div>{movies.length > 0 && <button onClick={clear} className="min-h-11 rounded-xl border border-[var(--mn-border)] px-5 font-black hover:bg-[var(--mn-soft)]">{copy.clear}</button>}</section>{movies.length ? <Grid movies={movies} mediaType="movie" favorites={favorites} toggleFavorite={toggleFavorite} /> : <div className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-8 text-center text-lg font-black backdrop-blur-xl">{copy.emptyFav}</div>}</div>; }
function Grid({ movies = [], mediaType, favorites = {}, toggleFavorite, showFavorite = true }) { if (!movies.length) return null; return <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">{movies.map((m) => <Card key={`${m.media_type || mediaType}-${m.id}`} movie={m} mediaType={m.media_type || mediaType} favorite={Boolean(favorites[m.id])} toggleFavorite={toggleFavorite} showFavorite={showFavorite} />)}</div>; }
function Card({ movie, mediaType, favorite, toggleFavorite, showFavorite }) { return <article className="group overflow-hidden rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] shadow-[0_14px_40px_rgba(24,54,49,0.10)] backdrop-blur-xl transition duration-300 hover:-translate-y-1"><Link href={href(movie, mediaType)} className="block"><div className="relative aspect-[2/3] overflow-hidden bg-black/20"><Poster movie={movie} compact /><span className="absolute end-3 top-3 inline-flex items-center gap-1 rounded-full bg-black/72 px-3 py-1 text-xs font-black text-white"><Star size={13} fill="currentColor" className="text-amber-300" />{Number(movie.vote_average || movie.popularity || 0).toFixed(1)}</span></div><div className="p-4"><h2 className="line-clamp-1 text-lg font-black">{title(movie)}</h2><p className="mt-2 line-clamp-2 min-h-12 text-sm leading-6 opacity-70">{movie.overview || year(movie)}</p></div></Link>{showFavorite && <button onClick={() => toggleFavorite(movie)} className={`mx-4 mb-4 inline-flex min-h-11 w-[calc(100%-2rem)] items-center justify-center gap-2 rounded-xl border border-[var(--mn-border)] font-black transition hover:bg-[var(--mn-soft)] ${favorite ? 'text-[var(--mn-accent-strong)]' : ''}`} aria-label="Toggle favorite">{favorite ? <Check size={18} /> : <Heart size={18} />}</button>}</article>; }
function Cast({ copy, cast }) { return <section><Title text={copy.cast} /><div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{cast.map((a) => <Link key={a.cast_id || a.credit_id || a.id} href={`/other/MovieNest/actor/${a.id}`} className="rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-3 backdrop-blur-xl transition hover:-translate-y-1"><div className="aspect-[3/4] overflow-hidden rounded-xl bg-black/20">{profile(a) ? <img src={profile(a)} alt={a.name} className="h-full w-full object-cover" /> : <Fallback icon={UserRound} />}</div><h3 className="mt-3 line-clamp-1 font-black">{a.name}</h3><p className="line-clamp-1 text-sm opacity-65">{a.character}</p></Link>)}</div></section>; }
function Poster({ movie, compact = false }) { return <div className={`${compact ? 'h-full w-full' : 'aspect-[2/3] overflow-hidden rounded-2xl'} bg-black/20`}>{poster(movie) ? <img src={poster(movie)} alt={title(movie)} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <Fallback />}</div>; }
function Meta({ movie, mediaType, compact = false }) { return <div className={`${compact ? 'mt-3 gap-2 text-xs' : 'mt-5 gap-3 text-sm'} flex flex-row-reverse flex-wrap items-center justify-end font-black opacity-90`}><span className={`inline-flex items-center gap-2 rounded-full bg-current/10 ${compact ? 'px-3 py-1.5' : 'px-4 py-2'}`}><Star size={compact ? 14 : 16} fill="currentColor" className="text-amber-400" />{Number(movie?.vote_average || 0).toFixed(1)}</span><span className={`inline-flex items-center gap-2 rounded-full bg-current/10 ${compact ? 'px-3 py-1.5' : 'px-4 py-2'}`}><CalendarDays size={compact ? 14 : 16} />{year(movie)}</span><span className={`inline-flex items-center gap-2 rounded-full bg-current/10 ${compact ? 'px-3 py-1.5' : 'px-4 py-2'}`}>{mediaType === 'tv' ? <Tv size={compact ? 14 : 16} /> : <Film size={compact ? 14 : 16} />}{mediaType === 'tv' ? 'TV' : 'Movie'}</span></div>; }
function Field({ label, children }) { return <label className="block text-sm font-black"><span className="mb-2 block opacity-75">{label}</span>{children}</label>; }
function Title({ text }) { return <h2 className="mb-4 text-3xl font-black">{text}</h2>; }
function Loader({ copy }) { return <div className="grid min-h-64 place-items-center rounded-2xl border border-[var(--mn-border)] bg-[var(--mn-surface)] p-8 text-center backdrop-blur-xl"><div><LoaderCircle className="mx-auto animate-spin text-[var(--mn-accent)]" size={42} /><p className="mt-4 font-black">{copy.loading}</p></div></div>; }
function Status({ message }) { return <p className="mt-4 inline-flex items-center gap-2 rounded-xl border border-amber-400/35 bg-amber-500/10 px-4 py-3 text-sm font-bold text-amber-700 dark:text-amber-200"><AlertTriangle size={17} />{message}</p>; }
function ErrorPanel({ copy, message, retry }) { return <div className="rounded-2xl border border-amber-400/35 bg-amber-500/10 p-8 text-center backdrop-blur-xl"><AlertTriangle className="mx-auto text-amber-500" size={44} /><h1 className="mt-4 text-3xl font-black">{copy.error}</h1><p className="mt-3 opacity-75">{message}</p>{retry && <button onClick={retry} className="mt-5 rounded-xl bg-[var(--mn-accent)] px-5 py-3 font-black text-[var(--mn-on-accent)]">Retry</button>}</div>; }
function Fallback({ icon: Icon = Clapperboard }) { return <div className="grid h-full w-full place-items-center bg-gradient-to-br from-[#dcefe9] via-[#8acac1] to-[#315f68] text-[#10211f]"><Icon size={44} /></div>; }

"use client";

import { useEffect, useMemo, useState } from 'react';
import { Clapperboard, Film, Play, Search, Star, Tv, Wand2 } from 'lucide-react';
import Sidebar from './Sidebar';

const imageBase = 'https://image.tmdb.org/t/p/w500';

const fallbackMovies = [
  {
    id: 'demo-1',
    title: 'Midnight Signal',
    overview: 'A stylish mystery thriller with neon streets, hidden clues, and a final act built for a late-night watchlist.',
    vote_average: 8.4,
    release_date: '2026-02-14',
    poster_path: null,
    backdrop_path: null,
  },
  {
    id: 'demo-2',
    title: 'The Last Frame',
    overview: 'A director follows one missing reel into a cinematic puzzle of memory, fame, and one perfect shot.',
    vote_average: 7.9,
    release_date: '2025-11-07',
    poster_path: null,
    backdrop_path: null,
  },
  {
    id: 'demo-3',
    title: 'Orbit House',
    overview: 'A warm sci-fi series about a family running a tiny hotel at the edge of a crowded galaxy.',
    vote_average: 8.1,
    first_air_date: '2026-01-20',
    poster_path: null,
    backdrop_path: null,
  },
];

export default function MovieNestPage() {
  const [mode, setMode] = useState('popular');
  const [mediaType, setMediaType] = useState('movie');
  const [query, setQuery] = useState('');
  const [movies, setMovies] = useState(fallbackMovies);
  const [selectedMovie, setSelectedMovie] = useState(fallbackMovies[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const backdrop = useMemo(() => {
    if (selectedMovie?.backdrop_path) return `${imageBase}${selectedMovie.backdrop_path}`;
    return 'https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1600&q=80';
  }, [selectedMovie]);

  useEffect(() => {
    loadMovies('popular', mediaType);
  }, [mediaType]);

  async function loadMovies(nextMode = mode, nextMediaType = mediaType) {
    setLoading(true);
    setMessage('');
    setMode(nextMode);

    try {
      const params = new URLSearchParams({
        type: nextMode,
        mediaType: nextMediaType,
        page: '1',
        language: 'en-US',
      });

      if (nextMode === 'search') params.set('query', query);

      const response = await fetch(`/api/other/movienest?${params}`);
      const data = await response.json();
      const results = data.results || [];

      if (!response.ok || results.length === 0) {
        setMessage(data.error || 'Showing curated demo titles until the movie API is ready.');
        setMovies(fallbackMovies);
        setSelectedMovie(fallbackMovies[0]);
        return;
      }

      setMovies(results.slice(0, 12));
      setSelectedMovie(results[0]);
    } catch (error) {
      setMessage('Showing curated demo titles until the movie API is ready.');
      setMovies(fallbackMovies);
      setSelectedMovie(fallbackMovies[0]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen overflow-hidden bg-[#05070d] text-white">
      <div className="relative min-h-[calc(100vh-5rem)]">
        <img src={backdrop} alt="" className="absolute inset-0 h-full w-full object-cover opacity-24" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,#05070d_0%,rgba(5,7,13,0.88)_42%,rgba(5,7,13,0.62)_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(229,9,20,0.24),transparent_34%),radial-gradient(circle_at_22%_80%,rgba(34,211,238,0.16),transparent_30%)]" />

        <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-5 py-8">
          <header className="flex flex-col gap-4 rounded-[28px] border border-white/10 bg-black/30 px-4 py-4 shadow-2xl backdrop-blur-xl md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-red-600 shadow-lg shadow-red-700/30">
                <Clapperboard size={24} />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.34em] text-red-200">MovieNest</p>
                <h1 className="text-2xl font-black tracking-normal">Cinema discovery hub</h1>
              </div>
            </div>

            <div className="flex flex-col gap-3 md:flex-row md:items-center">
              <div className="grid grid-cols-2 rounded-2xl border border-white/10 bg-white/5 p-1">
                {['movie', 'tv'].map((item) => (
                  <button
                    key={item}
                    onClick={() => setMediaType(item)}
                    className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-black transition ${mediaType === item ? 'bg-white text-black' : 'text-slate-300 hover:text-white'}`}
                  >
                    {item === 'movie' ? <Film size={16} /> : <Tv size={16} />}
                    {item === 'movie' ? 'Movies' : 'TV'}
                  </button>
                ))}
              </div>

              <form
                className="flex min-w-0 items-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-3 py-2"
                onSubmit={(event) => {
                  event.preventDefault();
                  loadMovies('search', 'movie');
                }}
              >
                <Search size={18} className="text-slate-300" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full min-w-0 bg-transparent text-sm font-semibold outline-none placeholder:text-slate-500 md:w-56"
                  placeholder="Search a movie..."
                />
              </form>
            </div>
          </header>

          <main className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            
            
            <div className="min-h-screen">
              <div className="inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-300/10 px-4 py-2 text-sm font-bold text-cyan-100">
                <Wand2 size={16} />
                {loading ? 'Loading titles' : 'Curated tonight'}
              </div>

              <h2 className="mt-5 max-w-xl text-5xl font-black leading-[1.02] tracking-normal md:text-7xl">
                {selectedMovie?.title || selectedMovie?.name || 'MovieNest'}
              </h2>

              <div className="mt-5 flex flex-wrap items-center gap-3 text-sm font-bold text-slate-300">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
                  <Star size={17} className="text-yellow-300" fill="currentColor" />
                  {(selectedMovie?.vote_average || 8).toFixed(1)}
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2">
                  {(selectedMovie?.release_date || selectedMovie?.first_air_date || '2026').slice(0, 4)}
                </span>
                <span className="rounded-full bg-white/10 px-4 py-2">{mediaType === 'movie' ? 'Movie' : 'Series'}</span>
              </div>

              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
                {selectedMovie?.overview || 'Pick something from the shelf and let the hero panel resize cleanly around the selected title.'}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                {[
                  ['popular', 'Popular'],
                  ['top', 'Top rated'],
                  ['now', 'Now playing'],
                  ['upcoming', 'Upcoming'],
                ].map(([key, label]) => (
                  <button
                    key={key}
                    onClick={() => loadMovies(key, key === 'now' || key === 'upcoming' ? 'movie' : mediaType)}
                    className={`rounded-2xl px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 ${mode === key ? 'bg-red-600 text-white shadow-lg shadow-red-700/30' : 'border border-white/10 bg-white/10 text-slate-200 hover:bg-white/15'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {message && <p className="mt-4 text-sm font-semibold text-red-200">{message}</p>}
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {movies.slice(0, 6).map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => setSelectedMovie(movie)}
                  className="group overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.07] text-left shadow-2xl backdrop-blur-xl transition hover:-translate-y-1 hover:border-red-300/50 hover:bg-white/[0.11]"
                >
                  <div className="relative aspect-[4/5] overflow-hidden">
                    {movie.poster_path ? (
                      <img src={`${imageBase}${movie.poster_path}`} alt={movie.title || movie.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
                    ) : (
                      <div className="grid h-full w-full place-items-center bg-gradient-to-br from-slate-900 via-red-950 to-slate-950">
                        <Play size={46} className="text-white/80" />
                      </div>
                    )}
                    <div className="absolute right-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs font-black">
                      {(movie.vote_average || 8).toFixed(1)}
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="line-clamp-1 text-base font-black">{movie.title || movie.name}</h3>
                    <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-400">{movie.overview || 'No overview yet.'}</p>
                  </div>
                </button>
              ))}
            </div>
          </main>
        </div>
      </div>
    </section>
  );
}

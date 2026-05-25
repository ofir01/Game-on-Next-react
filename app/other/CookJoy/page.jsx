"use client";

import { useEffect, useMemo, useState } from 'react';
import { ChefHat, Clock3, Flame, Heart, Leaf, Search, Shuffle, Sparkles, Users } from 'lucide-react';

const fallbackRecipes = [
  {
    id: 'demo-1',
    title: 'Roasted Tomato Pasta',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&w=900&q=80',
    readyInMinutes: 28,
    servings: 3,
    healthScore: 72,
  },
  {
    id: 'demo-2',
    title: 'Citrus Garden Salad',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
    readyInMinutes: 16,
    servings: 2,
    healthScore: 91,
  },
  {
    id: 'demo-3',
    title: 'Golden Breakfast Bowl',
    image: 'https://images.unsplash.com/photo-1494597564530-871f2b93ac55?auto=format&fit=crop&w=900&q=80',
    readyInMinutes: 12,
    servings: 1,
    healthScore: 84,
  },
];

export default function CookJoyPage() {
  const [query, setQuery] = useState('pasta');
  const [recipes, setRecipes] = useState(fallbackRecipes);
  const [selectedRecipe, setSelectedRecipe] = useState(fallbackRecipes[0]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const heroRecipe = useMemo(() => recipes[0] || fallbackRecipes[0], [recipes]);

  useEffect(() => {
    loadRecipes('pasta');
  }, []);

  async function loadRecipes(nextQuery = query) {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch(`/api/other/cookjoy?type=search&query=${encodeURIComponent(nextQuery)}&number=9`);
      const data = await response.json();
      const results = data.results || [];

      if (!response.ok || results.length === 0) {
        setMessage(data.error || 'Showing local inspiration until the recipe API is ready.');
        setRecipes(fallbackRecipes);
        setSelectedRecipe(fallbackRecipes[0]);
        return;
      }

      setRecipes(results);
      setSelectedRecipe(results[0]);
    } catch (error) {
      setMessage('Showing local inspiration until the recipe API is ready.');
      setRecipes(fallbackRecipes);
      setSelectedRecipe(fallbackRecipes[0]);
    } finally {
      setLoading(false);
    }
  }

  async function loadRandomRecipes() {
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/other/cookjoy?type=random&number=6');
      const data = await response.json();
      const results = data.recipes || [];

      if (!response.ok || results.length === 0) {
        setMessage(data.error || 'Random recipes are unavailable right now.');
        return;
      }

      setRecipes(results);
      setSelectedRecipe(results[0]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="min-h-screen overflow-hidden bg-[#fff8ef] text-[#20140d]">
      <div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl gap-10 px-5 py-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div className="order-2 lg:order-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#f3b45a]/40 bg-white/80 px-4 py-2 text-sm font-bold text-[#9c4f13] shadow-sm">
            <Sparkles size={16} />
            CookJoy Studio
          </div>

          <h1 className="mt-6 max-w-2xl text-5xl font-black leading-[1.02] tracking-normal text-[#2a170d] md:text-7xl">
            Recipes that feel fresh, warm, and easy to choose.
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-8 text-[#6b5140]">
            Search meals, discover quick ideas, and keep the cooking animation exactly where it belongs: centered in the experience.
          </p>

          <form
            className="mt-8 flex max-w-2xl flex-col gap-3 rounded-[28px] border border-[#f0d7bd] bg-white p-3 shadow-[0_24px_80px_rgba(164,93,30,0.16)] sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              loadRecipes();
            }}
          >
            <label className="flex flex-1 items-center gap-3 rounded-2xl bg-[#fff4e7] px-4 py-3 text-[#7a5139]">
              <Search size={20} />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                className="w-full bg-transparent text-base font-semibold outline-none placeholder:text-[#b4896d]"
                placeholder="Search pasta, salad, chicken..."
              />
            </label>
            <button className="rounded-2xl bg-[#1f8a5b] px-6 py-3 font-black text-white shadow-lg shadow-emerald-800/20 transition hover:-translate-y-0.5 hover:bg-[#176d49]">
              Search
            </button>
            <button
              type="button"
              onClick={loadRandomRecipes}
              className="inline-flex items-center justify-center gap-2 rounded-2xl border border-[#f0d7bd] px-5 py-3 font-black text-[#7a3d12] transition hover:-translate-y-0.5 hover:bg-[#fff4e7]"
            >
              <Shuffle size={18} />
              Random
            </button>
          </form>

          {message && <p className="mt-4 text-sm font-semibold text-[#a65b1c]">{message}</p>}

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {recipes.slice(0, 3).map((recipe) => (
              <button
                key={recipe.id}
                onClick={() => setSelectedRecipe(recipe)}
                className="group overflow-hidden rounded-[24px] border border-white bg-white text-left shadow-[0_16px_50px_rgba(104,62,26,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_70px_rgba(104,62,26,0.18)]"
              >
                <img src={recipe.image || fallbackRecipes[0].image} alt={recipe.title} className="h-36 w-full object-cover" />
                <div className="p-4">
                  <h3 className="line-clamp-2 min-h-12 font-black leading-6 text-[#2b1a12]">{recipe.title}</h3>
                  <div className="mt-3 flex items-center gap-3 text-xs font-bold text-[#8b634d]">
                    <span className="inline-flex items-center gap-1"><Clock3 size={14} />{recipe.readyInMinutes || 30}m</span>
                    <span className="inline-flex items-center gap-1"><Users size={14} />{recipe.servings || 2}</span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="order-1 flex min-h-[560px] items-center justify-center lg:order-2">
          <div className="relative grid h-[520px] w-full max-w-[520px] place-items-center">
            <div className="absolute inset-8 rounded-full bg-[#f6b960]/25 blur-3xl" />
            <div className="cookjoy-orbit absolute h-[430px] w-[430px] rounded-full border border-[#eab86f]/45" />
            <div className="cookjoy-orbit cookjoy-orbit-slow absolute h-[330px] w-[330px] rounded-full border border-[#70b77e]/45" />

            <div className="relative z-10 w-[82%] overflow-hidden rounded-[38px] border border-white/80 bg-white shadow-[0_30px_100px_rgba(120,68,28,0.25)]">
              <img src={selectedRecipe?.image || heroRecipe.image} alt={selectedRecipe?.title || heroRecipe.title} className="h-72 w-full object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <h2 className="text-2xl font-black leading-7 text-[#29160d]">{selectedRecipe?.title || heroRecipe.title}</h2>
                  <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[#ffedd6] text-[#cf5d1b]">
                    <Heart size={22} fill="currentColor" />
                  </span>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3 text-center">
                  <Metric icon={Clock3} label="Minutes" value={selectedRecipe?.readyInMinutes || 30} />
                  <Metric icon={Users} label="Serves" value={selectedRecipe?.servings || 2} />
                  <Metric icon={Leaf} label="Score" value={selectedRecipe?.healthScore || 76} />
                </div>
              </div>
            </div>

            <FloatingBadge className="left-0 top-20" icon={ChefHat} text="Fresh picks" />
            <FloatingBadge className="bottom-16 right-0" icon={Flame} text={loading ? 'Cooking...' : 'Ready'} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-[#fff4e7] p-3">
      <Icon className="mx-auto text-[#1f8a5b]" size={18} />
      <div className="mt-1 text-lg font-black text-[#2b1a12]">{value}</div>
      <div className="text-[11px] font-bold uppercase tracking-wide text-[#9a735c]">{label}</div>
    </div>
  );
}

function FloatingBadge({ className, icon: Icon, text }) {
  return (
    <div className={`absolute z-20 inline-flex items-center gap-2 rounded-full border border-white bg-white/90 px-4 py-3 text-sm font-black text-[#6d3a17] shadow-xl ${className}`}>
      <Icon size={18} />
      {text}
    </div>
  );
}

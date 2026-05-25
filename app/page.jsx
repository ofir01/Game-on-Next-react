"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, } from "framer-motion";
import { ArrowRight, BadgePercent, CircleDollarSign, Crown, Flame, Gamepad2, Gift, Headphones, MousePointerClick, Play, ShieldCheck, ShoppingBag, Sparkles, Star, Swords, Trophy, Users, Zap, } from "lucide-react";

const HOME_DATA = {
  hero: {
    eyebrow: "Real games, real library",
    title: "Game-On Arcade",
    titleLines: ["Game-On", "Arcade"],
    subtitle:
      "A brighter home for browser games, real catalog signals, upcoming releases, and the stack that powers the site.",
    primaryAction: "Play Free",
    secondaryAction: "Shop Drops",
  },
  stats: [
    { label: "Play in browser", value: "0", detail: "games ready online" },
    { label: "Players joined", value: "0", detail: "accounts in the arena" },
    { label: "Ways to play", value: "0", detail: "genres to explore" },
    { label: "Next releases", value: "0", detail: "games worth following" },
  ],
  featuredGames: [
    {
      title: "Word Hunter",
      slug: "Word-Hunter",
      tagline: "A word chase through glowing ruins and timed rooms.",
      image: "/Games/WordHunter/WordHunter.png",
      accent: "#3df6c5",
      genre: "Word Quest",
      mode: "Solo",
      price: "Free",
      rating: "4.9",
      players: "18.4K",
      status: "Hot now",
      playHref: "/Games/WordHunter/index.html",
      shopHref: "#premium-drops",
    },
    {
      title: "7 Boom",
      slug: "7-Boom",
      tagline: "Fast math reflexes, loud streaks, and one bad number.",
      image: "/Games/7Boom/7Boom.webp",
      accent: "#ffd166",
      genre: "Arcade Math",
      mode: "Party",
      price: "Free",
      rating: "4.8",
      players: "12.7K",
      status: "Daily pick",
      playHref: "/Games/7Boom/GameMenu.html",
      shopHref: "#premium-drops",
    },
    {
      title: "Candy Crush Arena",
      slug: "Candy-Crush",
      tagline: "Color chains, pressure rounds, and premium board skins.",
      image: "/Games/CandyCrush/CandyCrush.webp",
      accent: "#ff5d8f",
      genre: "Match 3",
      mode: "Casual",
      price: "$4.99",
      rating: "4.7",
      players: "31.2K",
      status: "Premium",
      playHref: "/Games/CandyCrush/GameMenu.html",
      shopHref: "#premium-drops",
    },
    {
      title: "Expression Tree",
      slug: "Expression-Tree",
      tagline: "Build the equation, bend the branches, beat the clock.",
      image: "/Games/ExpressionTree/ExpressionTree.webp",
      accent: "#7dd3fc",
      genre: "Logic",
      mode: "Challenge",
      price: "Free",
      rating: "4.8",
      players: "9.1K",
      status: "Brain run",
      playHref: "/Games/ExpressionTree/GameMenu.html",
      shopHref: "#premium-drops",
    },
    {
      title: "Memory Grid",
      slug: "Memory-Game",
      tagline: "Flip, remember, and chain perfect streak bonuses.",
      image: "/Games/memoryGame/memoryGame.webp",
      accent: "#a3e635",
      genre: "Memory",
      mode: "Speed",
      price: "Free",
      rating: "4.6",
      players: "7.8K",
      status: "Fresh",
      playHref: "/Games/memoryGame/memoryGame.html",
      shopHref: "#premium-drops",
    },
    {
      title: "Tic-Tac-Toe Prime",
      slug: "Tic-Tac-Toe",
      tagline: "A classic duel dressed for ranked arena nights.",
      image: "/Games/Tic-Tac-Toe/Tic-Tac-Toe.webp",
      accent: "#f97316",
      genre: "Strategy",
      mode: "Duel",
      price: "$2.99",
      rating: "4.5",
      players: "5.6K",
      status: "Ranked",
      playHref: "/Games/Tic-Tac-Toe/GameMenu.html",
      shopHref: "#premium-drops",
    },
  ],
  categories: [
    { name: "Arcade", count: "31", icon: "Zap", color: "text-lime-300" },
    { name: "Puzzle", count: "24", icon: "Sparkles", color: "text-cyan-200" },
    { name: "Strategy", count: "18", icon: "Swords", color: "text-orange-300" },
    { name: "Party", count: "16", icon: "Users", color: "text-pink-300" },
    { name: "Premium", count: "12", icon: "Crown", color: "text-amber-200" },
  ],
  drops: [
    {
      title: "Creator Pack",
      detail: "Skins, menus, animated profile frames",
      price: "$8.99",
      tag: "Best value",
      icon: "Gift",
    },
    {
      title: "Arena Pass",
      detail: "Ranked rewards, weekly missions, XP boosts",
      price: "$5.99",
      tag: "Seasonal",
      icon: "Trophy",
    },
    {
      title: "Studio Bundle",
      detail: "Premium titles and early prototype access",
      price: "$14.99",
      tag: "New",
      icon: "ShoppingBag",
    },
  ],
  upcomingGames: [
    {
      title: "Ancient-Odyssey",
      releaseDate: "2026-08-15",
      status: "COMING SOON",
      price: "$44.99",
      categories: "Adventure",
    },
    {
      title: "Super-Soccer-League",
      releaseDate: null,
      status: "COMING SOON",
      price: "Free",
      categories: "Sports",
    },
  ],
  perks: [
    {
      title: "Play online now",
      text: "Open a game in the browser, start a quick round, and continue without installing anything.",
      icon: "MousePointerClick",
    },
    {
      title: "Rate what you played",
      text: "Leave a score after a session so other players know which games are actually worth their time.",
      icon: "CircleDollarSign",
    },
    {
      title: "React and comment",
      text: "Share feedback, ask for updates, and help shape what gets improved next.",
      icon: "ShieldCheck",
    },
    {
      title: "Follow what is coming",
      text: "Check upcoming games, save your favorites, and come back when a new title goes live.",
      icon: "Headphones",
    },
  ],
};

const PROJECT_LIBRARIES = [
  {
    name: "Next.js",
    packageName: "next",
    image: "/imges/lib/Next.svg",
    detail: "App Router",
  },
  {
    name: "React",
    packageName: "react",
    image: "/imges/lib/React.svg",
    detail: "UI runtime",
  },
  {
    name: "Tailwind CSS",
    packageName: "tailwindcss",
    image: "/imges/lib/TailwindCSS.svg",
    detail: "Styling",
  },
  {
    name: "MySQL",
    packageName: "mysql2",
    image: "/imges/lib/mysql.svg",
    detail: "Database driver",
  },
  {
    name: "Sequelize",
    packageName: "sequelize",
    image: "/imges/lib/sequelize.svg",
    detail: "ORM",
  },
  {
    name: "JavaScript",
    packageName: "language",
    image: "/imges/lib/JavaScript.svg",
    detail: "Client logic",
  },
];

const ICONS = {
  BadgePercent,
  CircleDollarSign,
  Crown,
  Flame,
  Gamepad2,
  Gift,
  Headphones,
  MousePointerClick,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  Swords,
  Trophy,
  Users,
  Zap,
};

const HERO_CONTROL_WIDTH = {
  width: "min(36rem, calc(100dvw - 40px))",
  maxWidth: "100%",
};

const HERO_TEXT_WIDTH = {
  maxWidth: "min(42rem, calc(100dvw - 40px))",
};

const HERO_VIEWPORT_WIDTH = {
  width: "min(1600px, 100dvw)",
  maxWidth: "100dvw",
};


function getGameDetailHref(game) {
  return `/${encodeURIComponent(game.slug || game.title)}`;
}

function getCategoryHref(categoryName) {
  return `/Search?categories=${encodeURIComponent(categoryName)}&page=1`;
}

function formatNumber(value) {
  const number = Number(value || 0);

  return new Intl.NumberFormat("en-US").format(number);
}

function formatPrice(value) {
  if (typeof value === "string") {
    return value;
  }

  const number = Number(value || 0);

  if (number <= 0) {
    return "Free";
  }

  return `$${number.toFixed(2)}`;
}

function formatReleaseDate(date) {
  if (!date) {
    return "Date TBA";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function toCategoryList(categories, fallbackGenre) {
  if (Array.isArray(categories)) {
    return categories.filter(Boolean);
  }

  if (typeof categories === "string" && categories.trim()) {
    return [categories.trim()];
  }

  return [fallbackGenre].filter(Boolean);
}

function normalizeGame(game, fallback = {}) {
  const title = game?.title || fallback.title || "Untitled game";
  const categories = toCategoryList(
    game?.categories?.length ? game.categories : fallback.categories,
    fallback.genre
  );

  return {
    ...fallback,
    ...game,
    title,
    slug: title,
    tagline: game?.description || fallback.tagline || "A catalog game from Game-On.",
    image: game?.imageUrl || game?.image || fallback.image,
    genre: categories?.[0] || fallback.genre || "Game",
    mode: game?.status || fallback.mode || "Catalog",
    price: formatPrice(game?.finalPrice ?? game?.price ?? fallback.price),
    rating: game?.avgRating || fallback.rating || "0.0",
    players: formatNumber(game?.playCount || fallback.playCount || 0),
    status: game?.status || fallback.status || "Available",
    playHref: game?.gameUrl || fallback.playHref || getGameDetailHref({ title }),
    shopHref: fallback.shopHref || "#premium-drops",
    releaseDate: game?.releaseDate || fallback.releaseDate || null,
    categories,
  };
}

function buildLiveStats(stats) {
  if (!stats) {
    return HOME_DATA.stats;
  }

  return [
    {
      label: "Play in browser",
      value: formatNumber(stats.gamesCount),
      detail: "games ready online",
    },
    {
      label: "Players joined",
      value: formatNumber(stats.usersCount),
      detail: "accounts in the arena",
    },
    {
      label: "Ways to play",
      value: formatNumber(stats.categoriesCount),
      detail: "genres to explore",
    },
    {
      label: "Next releases",
      value: formatNumber(stats.upcomingCount),
      detail: "games worth following",
    },
  ];
}

function normalizeCategory(category, index) {
  const iconCycle = ["Zap", "Sparkles", "Swords", "Gamepad2", "Crown"];
  const colorCycle = [
    "text-lime-300",
    "text-cyan-200",
    "text-orange-300",
    "text-pink-300",
    "text-amber-200",
  ];

  return {
    name: category.name,
    count: formatNumber(category.gamesCount || category.count || 0),
    icon: iconCycle[index % iconCycle.length],
    color: colorCycle[index % colorCycle.length],
  };
}

function getRevealProps(reducedMotion, delay = 0) {
  if (reducedMotion) {
    return {};
  }

  return {
    initial: { opacity: 0, y: 28 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.24 },
    transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
  };
}

function Reveal({ children, delay = 0, className = "", instant = false }) {
  const reducedMotion = useReducedMotion();
  const instantProps = reducedMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] },
      };

  return (
    <motion.div
      className={className}
      {...(instant ? instantProps : getRevealProps(reducedMotion, delay))}
    >
      {children}
    </motion.div>
  );
}

function SectionHeader({ eyebrow, title, text, align = "left" }) {
  const centered = align === "center";

  return (
    <Reveal
      className={`mx-auto max-w-3xl ${centered ? "text-center" : "text-left"}`}
    >
      <p className="mb-3 text-sm font-semibold text-lime-300">{eyebrow}</p>
      <h2 className="text-3xl font-black leading-tight text-white md:text-5xl">
        {title}
      </h2>
      {text && (
        <p className="mt-5 text-base leading-8 text-zinc-300 md:text-lg">
          {text}
        </p>
      )}
    </Reveal>
  );
}

function GamePortalScene({ games }) {
  const reducedMotion = useReducedMotion();
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handlePointerMove(event) {
    if (reducedMotion) {
      return;
    }

    const bounds = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - bounds.left) / bounds.width - 0.5;
    const y = (event.clientY - bounds.top) / bounds.height - 0.5;

    setTilt({ x: Number((y * -10).toFixed(2)), y: Number((x * 12).toFixed(2)) });
  }

  function handlePointerLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <div
      className="relative min-h-[560px] w-full overflow-hidden"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      <motion.div
        className="gameon-perspective absolute inset-0"
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 120, damping: 22 }}
      >
        <div className="gameon-floor" />
        <div className="gameon-portal-ring gameon-ring-one" />
        <div className="gameon-portal-ring gameon-ring-two" />
        <div className="gameon-portal-ring gameon-ring-three" />

        <div className="gameon-arcade-core">
          <div className="gameon-core-screen">
            <div className="gameon-screen-scan" />
            <Gamepad2 className="h-16 w-16 text-black" strokeWidth={1.8} />
            <span className="text-lg font-black text-black">GAME-ON</span>
          </div>
          <div className="gameon-core-deck">
            <span />
            <span />
            <span />
            <span />
          </div>
        </div>

        {games.slice(0, 5).map((game, index) => (
          <Link
            key={game.title}
            href={getGameDetailHref(game)}
            className={`gameon-card-3d gameon-card-3d-${index}`}
            style={{
              "--accent": game.accent,
              "--float-delay": `${index * -0.65}s`,
            }}
            aria-label={`View details for ${game.title}`}
          >
            <img
              src={game.image}
              alt={`${game.title} cover art`}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover"
            />
            <span>{game.title}</span>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}

function StatRail({ stats }) {
  return (
    <Reveal>
      <div className="grid grid-cols-2 border-y border-white/10 bg-black/20 md:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="min-h-32 border-white/10 px-5 py-6 first:border-l-0 md:border-l"
          >
            <p className="text-4xl font-black text-white">{stat.value}</p>
            <p className="mt-2 text-sm font-semibold text-zinc-200">
              {stat.label}
            </p>
            <p className="mt-1 text-sm text-zinc-500">{stat.detail}</p>
          </div>
        ))}
      </div>
    </Reveal>
  );
}

function HeroActions({ hero }) {
  return (
    <div
      className="flex flex-col gap-3 sm:flex-row"
      style={HERO_CONTROL_WIDTH}
    >
      <Link
        href="#free-games"
        className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-lime-300 px-6 py-3 font-black text-black transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-lime-300/40 active:scale-[0.98] sm:w-auto"
      >
        <Play className="h-5 w-5 fill-black" />
        {hero.primaryAction}
      </Link>
      <Link
        href="#premium-drops"
        className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/8 px-6 py-3 font-black text-white transition hover:border-cyan-300 hover:bg-cyan-300/10 focus:outline-none focus:ring-4 focus:ring-cyan-300/30 active:scale-[0.98] sm:w-auto"
      >
        <ShoppingBag className="h-5 w-5" />
        {hero.secondaryAction}
      </Link>
    </div>
  );
}

function FeaturedGameCard({ game, index }) {
  return (
    <Reveal delay={index * 0.05}>
      <article
        className="group relative min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
        style={{ "--accent": game.accent }}
      >
        <Link href={getGameDetailHref(game)} className="absolute inset-0 z-10">
          <span className="sr-only">View details for {game.title}</span>
        </Link>
        <img
          src={game.image}
          alt={`${game.title} gameplay art`}
          loading={index < 2 ? "eager" : "lazy"}
          decoding="async"
          className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.05)_0%,rgba(8,8,8,0.52)_42%,rgba(8,8,8,0.96)_100%)]" />
        <div
          className="absolute left-0 top-0 h-1 w-full"
          style={{ background: game.accent }}
        />

        <div className="absolute inset-x-0 bottom-0 z-20 p-5 md:p-6">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="rounded-md border border-white/15 bg-black/50 px-3 py-1 text-xs font-bold text-white">
              {game.status}
            </span>
            <span className="rounded-md border border-white/15 bg-black/50 px-3 py-1 text-xs font-bold text-white">
              {game.price}
            </span>
          </div>
          <h3 className="text-2xl font-black leading-tight text-white">
            {game.title}
          </h3>
          <p className="mt-3 min-h-16 text-sm leading-6 text-zinc-300">
            {game.tagline}
          </p>

          <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
            <div className="rounded-md bg-white/10 p-3">
              <Star className="mb-2 h-4 w-4 text-amber-300" />
              <p className="font-black text-white">{game.rating}</p>
              <p className="text-xs text-zinc-400">Rating</p>
            </div>
            <div className="rounded-md bg-white/10 p-3">
              <Users className="mb-2 h-4 w-4 text-cyan-200" />
              <p className="font-black text-white">{game.players}</p>
              <p className="text-xs text-zinc-400">Players</p>
            </div>
            <div className="rounded-md bg-white/10 p-3">
              <Gamepad2 className="mb-2 h-4 w-4 text-lime-300" />
              <p className="font-black text-white">{game.mode}</p>
              <p className="text-xs text-zinc-400">{game.genre}</p>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <Link
              href={getGameDetailHref(game)}
              className="relative z-30 inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-black transition hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-white/30 active:scale-[0.98]"
            >
              <Play className="h-4 w-4 fill-black" />
              Play
            </Link>
            <Link
              href={game.shopHref}
              className="relative z-30 inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 bg-black/45 px-4 text-sm font-black text-white transition hover:border-cyan-300 hover:text-cyan-100 focus:outline-none focus:ring-4 focus:ring-cyan-300/30 active:scale-[0.98]"
            >
              <ShoppingBag className="h-4 w-4" />
              Store
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

function CategoryStrip({ categories }) {
  return (
    <Reveal>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {categories.map((category) => {
          const Icon = ICONS[category.icon] || Gamepad2;

          return (
            <Link
              key={category.name}
              href={getCategoryHref(category.name)}
              className="group flex min-h-24 items-center justify-between rounded-lg border border-white/10 bg-zinc-950 px-5 text-left transition hover:-translate-y-1 hover:border-lime-300/60 hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-lime-300/30"
            >
              <span>
                <span className="block font-black text-white">
                  {category.name}
                </span>
                <span className="mt-1 block text-sm text-zinc-500">
                  {category.count} games
                </span>
              </span>
              <Icon className={`h-7 w-7 ${category.color}`} />
            </Link>
          );
        })}
      </div>
    </Reveal>
  );
}

function DropCard({ drop, index }) {
  const Icon = ICONS[drop.icon] || ShoppingBag;

  return (
    <Reveal delay={index * 0.06}>
      <article className="min-h-64 rounded-lg border border-white/10 bg-[#12110f] p-6 transition hover:-translate-y-1 hover:border-amber-200/50">
        <div className="flex items-start justify-between gap-4">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-200 text-black">
            <Icon className="h-6 w-6" />
          </div>
          <span className="rounded-md border border-amber-200/30 px-3 py-1 text-xs font-bold text-amber-100">
            {drop.tag}
          </span>
        </div>
        <h3 className="mt-6 text-2xl font-black text-white">{drop.title}</h3>
        <p className="mt-3 min-h-14 text-sm leading-6 text-zinc-400">
          {drop.detail}
        </p>
        <div className="mt-8 flex items-center justify-between">
          <p className="text-3xl font-black text-amber-100">{drop.price}</p>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-black transition hover:bg-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-200/30 active:scale-[0.98]"
          >
            <ShoppingBag className="h-4 w-4" />
            Add
          </button>
        </div>
      </article>
    </Reveal>
  );
}

function UpcomingReleaseList({ games }) {
  return (
    <Reveal>
      <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
        {games.map((game) => (
          <Link
            key={game.title}
            href={getGameDetailHref(game)}
            className="grid gap-4 border-t border-white/10 p-5 first:border-t-0 md:grid-cols-[120px_1fr_auto]"
          >
            <div className="font-mono text-sm font-black uppercase tracking-[0.18em] text-lime-300">
              {formatReleaseDate(game.releaseDate)}
            </div>
            <div>
              <h3 className="text-xl font-black text-white">{game.title}</h3>
              <p className="mt-1 text-sm text-zinc-400">
                {(game.categories || []).slice(0, 2).join(" / ") || game.status}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm font-bold text-cyan-100">
              <Sparkles className="h-4 w-4" />
              {game.price}
            </div>
          </Link>
        ))}
      </div>
    </Reveal>
  );
}

function PerkGrid({ perks }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {perks.map((perk, index) => {
        const Icon = ICONS[perk.icon] || Sparkles;

        return (
          <Reveal key={perk.title} delay={index * 0.05}>
            <article className="min-h-60 rounded-lg border border-white/10 bg-black/30 p-6">
              <Icon className="h-8 w-8 text-cyan-200" />
              <h3 className="mt-5 text-xl font-black text-white">
                {perk.title}
              </h3>
              <p className="mt-3 text-sm leading-6 text-zinc-400">
                {perk.text}
              </p>
            </article>
          </Reveal>
        );
      })}
    </div>
  );
}

function MarqueeShelf({ libraries }) {
  const items = useMemo(() => [...libraries, ...libraries], [libraries]);

  return (
    <div className="relative overflow-hidden border-y border-cyan-200/20 bg-[linear-gradient(90deg,rgba(15,23,42,0.75),rgba(20,83,45,0.42),rgba(88,28,135,0.45))] py-4">
      <div className="gameon-marquee flex w-max gap-4">
        {items.map((library, index) => (
          <div
            key={`${library.name}-${index}`}
            className="flex h-16 min-w-72 items-center gap-3 rounded-lg border border-white/15 bg-black/45 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur"
          >
            <img
              src={library.image}
              alt={`${library.name} logo`}
              loading="lazy"
              decoding="async"
              className="h-10 w-10 rounded-md object-contain"
            />
            <span>
              <span className="block font-bold text-white">{library.name}</span>
              <span className="block text-xs text-cyan-100/80">
                {library.detail}
              </span>
            </span>
            <span className="ml-auto rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-200">
              {library.packageName}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  const [homePayload, setHomePayload] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadHomeData() {
      try {
        const response = await fetch(
          "/api/games/home?sections=carousel,trending,topRated,stats,categories,upcoming"
        );

        if (!response.ok) {
          return;
        }

        const data = await response.json();

        if (isMounted) {
          setHomePayload(data);
        }
      } catch (error) {
        console.error("Failed to load home data", error);
      }
    }

    loadHomeData();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredGames = useMemo(() => {
    const source =
      homePayload?.trending?.length
        ? homePayload.trending
        : homePayload?.carousel?.length
          ? homePayload.carousel
          : HOME_DATA.featuredGames;

    return source.slice(0, 6).map((game, index) =>
      normalizeGame(game, HOME_DATA.featuredGames[index % HOME_DATA.featuredGames.length])
    );
  }, [homePayload]);

  const stats = useMemo(() => buildLiveStats(homePayload?.stats), [homePayload]);

  const categories = useMemo(() => {
    const source = homePayload?.categories?.length
      ? homePayload.categories
      : HOME_DATA.categories;

    return source.slice(0, 5).map(normalizeCategory);
  }, [homePayload]);

  const upcomingGames = useMemo(() => {
    const source = homePayload?.upcoming?.length
      ? homePayload.upcoming
      : HOME_DATA.upcomingGames;

    return source.slice(0, 4).map((game, index) =>
      normalizeGame(game, HOME_DATA.upcomingGames[index % HOME_DATA.upcomingGames.length])
    );
  }, [homePayload]);

  return (
    <main
      className="min-h-screen w-full max-w-[100vw] overflow-hidden bg-[#0a0d12] text-white"
      dir="ltr"
    >
      <style>{`
        .gameon-grid {
          background-image:
            linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px);
          background-size: 48px 48px;
          mask-image: linear-gradient(to bottom, black 0%, transparent 76%);
        }

        .gameon-scanlines {
          background-image: linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px);
          background-size: 100% 8px;
        }

        .gameon-perspective {
          perspective: 1200px;
          transform-style: preserve-3d;
        }

        .gameon-floor {
          position: absolute;
          left: 50%;
          bottom: 5%;
          width: min(780px, 92vw);
          height: 380px;
          transform: translateX(-50%) rotateX(72deg) translateZ(-90px);
          transform-origin: center bottom;
          background:
            linear-gradient(rgba(61, 246, 197, 0.2) 1px, transparent 1px),
            linear-gradient(90deg, rgba(249, 115, 22, 0.2) 1px, transparent 1px),
            linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0));
          background-size: 42px 42px, 42px 42px, 100% 100%;
          border: 1px solid rgba(255,255,255,0.12);
          box-shadow: 0 40px 120px rgba(0,0,0,0.5);
        }

        .gameon-portal-ring {
          position: absolute;
          left: 50%;
          top: 45%;
          border: 1px solid rgba(255,255,255,0.18);
          transform-style: preserve-3d;
          box-shadow: inset 0 0 30px rgba(61, 246, 197, 0.12), 0 0 60px rgba(249,115,22,0.12);
        }

        .gameon-ring-one {
          width: 390px;
          height: 390px;
          transform: translate(-50%, -50%) rotateX(66deg) rotateZ(8deg);
          animation: gameonRingSpin 18s linear infinite;
        }

        .gameon-ring-two {
          width: 520px;
          height: 520px;
          transform: translate(-50%, -50%) rotateX(69deg) rotateZ(-18deg);
          animation: gameonRingSpinReverse 24s linear infinite;
        }

        .gameon-ring-three {
          width: 660px;
          height: 660px;
          transform: translate(-50%, -50%) rotateX(72deg) rotateZ(32deg);
          animation: gameonRingSpin 32s linear infinite;
        }

        .gameon-arcade-core {
          position: absolute;
          left: 50%;
          top: 48%;
          width: 250px;
          height: 300px;
          transform: translate(-50%, -50%) translateZ(110px) rotateX(8deg);
          transform-style: preserve-3d;
          animation: gameonCoreFloat 6s ease-in-out infinite;
        }

        .gameon-core-screen {
          position: absolute;
          inset: 0 18px 82px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          overflow: hidden;
          border: 2px solid rgba(255,255,255,0.8);
          background:
            linear-gradient(135deg, rgba(61,246,197,1), rgba(255,209,102,1) 52%, rgba(255,93,143,1));
          box-shadow: 0 24px 90px rgba(61,246,197,0.24), inset 0 0 0 10px rgba(0,0,0,0.35);
        }

        .gameon-screen-scan {
          position: absolute;
          inset: 0;
          background-image: linear-gradient(rgba(0,0,0,0.18) 1px, transparent 1px);
          background-size: 100% 9px;
          mix-blend-mode: multiply;
        }

        .gameon-core-deck {
          position: absolute;
          left: 0;
          right: 0;
          bottom: 0;
          height: 96px;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          align-items: center;
          padding: 20px;
          border: 1px solid rgba(255,255,255,0.12);
          background: linear-gradient(180deg, #1f1f1a, #090908);
          transform: rotateX(18deg) translateZ(18px);
          box-shadow: 0 30px 80px rgba(0,0,0,0.45);
        }

        .gameon-core-deck span {
          height: 28px;
          border: 1px solid rgba(255,255,255,0.14);
          background: linear-gradient(180deg, rgba(255,255,255,0.22), rgba(255,255,255,0.03));
        }

        .gameon-card-3d {
          --base-transform: translate3d(0, 0, 0);
          position: absolute;
          width: 132px;
          height: 188px;
          overflow: hidden;
          border: 1px solid color-mix(in srgb, var(--accent) 60%, white 20%);
          background: #111;
          transform: var(--base-transform);
          transform-style: preserve-3d;
          animation: gameonCardFloat 6.5s ease-in-out infinite;
          animation-delay: var(--float-delay);
          box-shadow: 0 24px 80px rgba(0,0,0,0.45), 0 0 36px color-mix(in srgb, var(--accent) 24%, transparent);
        }

        .gameon-card-3d span {
          position: absolute;
          left: 10px;
          right: 10px;
          bottom: 10px;
          padding: 7px 8px;
          background: rgba(0,0,0,0.72);
          color: white;
          font-size: 12px;
          font-weight: 900;
        }

        .gameon-card-3d-0 {
          left: 7%;
          top: 18%;
          --base-transform: translateZ(145px) rotateY(18deg) rotateX(4deg);
        }

        .gameon-card-3d-1 {
          right: 8%;
          top: 14%;
          --base-transform: translateZ(130px) rotateY(-20deg) rotateX(5deg);
        }

        .gameon-card-3d-2 {
          left: 17%;
          bottom: 12%;
          --base-transform: translateZ(105px) rotateY(26deg) rotateX(-2deg);
        }

        .gameon-card-3d-3 {
          right: 18%;
          bottom: 11%;
          --base-transform: translateZ(115px) rotateY(-26deg) rotateX(-2deg);
        }

        .gameon-card-3d-4 {
          left: 50%;
          top: 7%;
          width: 116px;
          height: 164px;
          --base-transform: translateX(-50%) translateZ(92px) rotateY(0deg) rotateX(8deg);
        }

        .gameon-marquee {
          animation: gameonMarquee 34s linear infinite;
        }

        @keyframes gameonRingSpin {
          from { rotate: 0deg; }
          to { rotate: 360deg; }
        }

        @keyframes gameonRingSpinReverse {
          from { rotate: 360deg; }
          to { rotate: 0deg; }
        }

        @keyframes gameonCoreFloat {
          0%, 100% { margin-top: 0; }
          50% { margin-top: -16px; }
        }

        @keyframes gameonCardFloat {
          0%, 100% { transform: var(--base-transform) translateY(0); }
          50% { transform: var(--base-transform) translateY(-18px); }
        }

        @keyframes gameonMarquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        @media (max-width: 760px) {
          .gameon-card-3d {
            width: 94px;
            height: 136px;
          }

          .gameon-card-3d-2,
          .gameon-card-3d-3 {
            display: none;
          }

          .gameon-arcade-core {
            width: 210px;
            height: 255px;
          }

          .gameon-ring-three {
            width: 480px;
            height: 480px;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .gameon-ring-one,
          .gameon-ring-two,
          .gameon-ring-three,
          .gameon-arcade-core,
          .gameon-card-3d,
          .gameon-marquee {
            animation: none !important;
          }
        }
      `}</style>

      <section
        className="relative isolate min-h-[760px] overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(34,197,94,0.24),transparent_34%),radial-gradient(circle_at_78%_10%,rgba(14,165,233,0.24),transparent_30%),radial-gradient(circle_at_72%_78%,rgba(168,85,247,0.20),transparent_32%),#0a0d12] md:min-h-[820px] lg:min-h-[860px]"
        style={{ width: "100dvw", maxWidth: "100dvw" }}
      >
        <div className="gameon-grid absolute inset-0 opacity-80" />
        <div className="gameon-scanlines pointer-events-none absolute inset-0 opacity-35" />
        <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(10,13,18,0),#0a0d12)]" />

        <motion.div
          style={HERO_VIEWPORT_WIDTH}
          className="relative z-10 mx-auto grid min-h-[700px] items-start gap-12 overflow-hidden bg-[linear-gradient(135deg,rgba(34,197,94,0.08),rgba(14,165,233,0.06)_42%,rgba(168,85,247,0.05)_78%,transparent)] px-5 pb-12 pt-12 md:min-h-[760px] md:px-8 md:pt-16 lg:min-h-[800px] lg:grid-cols-[0.92fr_1.08fr] lg:px-12 lg:pt-20"
        >
          <div className="min-w-0 max-w-3xl">
            <Reveal instant>
              <div className="mb-5 inline-flex min-h-10 items-center gap-3 rounded-lg border border-lime-300/30 bg-lime-300/10 px-4 text-sm font-bold text-lime-200">
                <Flame className="h-4 w-4" />
                {HOME_DATA.hero.eyebrow}
              </div>
            </Reveal>
            <Reveal instant delay={0.06}>
              <h1
                className="text-5xl font-black leading-[0.96] text-white md:text-7xl lg:text-8xl"
                style={HERO_TEXT_WIDTH}
              >
                {(HOME_DATA.hero.titleLines || [HOME_DATA.hero.title]).map(
                  (line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  )
                )}
              </h1>
            </Reveal>
            <Reveal instant delay={0.12}>
              <p
                className="mt-6 break-words text-lg leading-8 text-zinc-300 md:text-xl"
                style={HERO_TEXT_WIDTH}
              >
                {HOME_DATA.hero.subtitle}
              </p>
            </Reveal>
            <Reveal instant delay={0.18}>
              <div className="mt-8">
                <HeroActions hero={HOME_DATA.hero} />
              </div>
            </Reveal>
          </div>

          <Reveal instant delay={0.18} className="min-w-0">
            <GamePortalScene games={featuredGames} />
          </Reveal>
        </motion.div>
      </section>

      <section className="bg-[#0a0d12]">
        <div className="mx-auto max-w-[1600px] px-5 md:px-8 lg:px-12">
          <StatRail stats={stats} />
        </div>
      </section>

      <MarqueeShelf libraries={PROJECT_LIBRARIES} />

      <section id="free-games" className="bg-[linear-gradient(180deg,#0a0d12,#0f172a_45%,#0a0d12)] py-20 md:py-28">
        <div className="mx-auto max-w-[1600px] px-5 md:px-8 lg:px-12">
          <SectionHeader
            eyebrow="Play your way"
            title="Pick a game, launch it online, then rate the experience."
            text="Find free browser games, see what other players are choosing, open the game page, and leave your rating or comment after the round."
          />

          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {featuredGames.map((game, index) => (
              <FeaturedGameCard
                key={game.title}
                game={game}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-[linear-gradient(135deg,rgba(22,101,52,0.34),rgba(8,47,73,0.38),rgba(88,28,135,0.22))] py-16">
        <div className="mx-auto max-w-[1600px] px-5 md:px-8 lg:px-12">
          <SectionHeader
            eyebrow="Find your next run"
            title="Pick the kind of game you feel like playing."
            align="center"
          />
          <div className="mt-10">
            <CategoryStrip categories={categories} />
          </div>
        </div>
      </section>

      <section id="premium-drops" className="bg-[#0a0d12] py-20 md:py-28">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-5 md:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-12">
          <div>
            <SectionHeader
              eyebrow="Premium drops"
              title="A store that feels like part of the arcade."
              text="Use this area for paid games, cosmetics, memberships, or bundles. The data lives at the top so you can replace names, prices, and links later."
            />
            <Reveal delay={0.1}>
              <Link
                href="#arena"
                className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-white/15 bg-white px-5 py-3 font-black text-black transition hover:bg-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-200/30 active:scale-[0.98]"
              >
                <BadgePercent className="h-5 w-5" />
                View schedule
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Reveal>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            {HOME_DATA.drops.map((drop, index) => (
              <DropCard key={drop.title} drop={drop} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section id="arena" className="border-y border-white/10 bg-[linear-gradient(135deg,#10151f,#082f49_48%,#16121f)] py-20 md:py-28">
        <div className="mx-auto grid max-w-[1600px] gap-12 px-5 md:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-12">
          <div>
            <SectionHeader
              eyebrow="Coming next"
              title="Come back for the games that are almost ready."
              text="See what is on the way, check the release window, and jump into each game page when you want the details."
            />
            <div className="mt-10">
              <UpcomingReleaseList games={upcomingGames} />
            </div>
          </div>

          <Reveal delay={0.12}>
            <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-[#070909]">
              <img
                src="/Games/WordHunter/background3.png"
                alt="Word Hunter arena background"
                loading="lazy"
                decoding="async"
                className="absolute inset-0 h-full w-full object-cover opacity-55"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,9,0.15),rgba(7,9,9,0.98))]" />
              <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-lime-300 text-black">
                  <Sparkles className="h-7 w-7" />
                </div>
                <h3 className="mt-6 text-4xl font-black text-white">
                  Release radar
                </h3>
                <p className="mt-4 text-base leading-7 text-zinc-300">
                  This panel highlights games that are marked as coming soon or
                  have a future release date in the database.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="bg-[#0a0d12] py-20 md:py-28">
        <div className="mx-auto max-w-[1600px] px-5 md:px-8 lg:px-12">
          <SectionHeader
            eyebrow="Your voice matters"
            title="Play, rate, react, and help the best games rise."
            text="Every visit should feel useful: jump into a browser game, check ratings, leave feedback, and come back for new releases chosen by the community."
            align="center"
          />
          <div className="mt-12">
            <PerkGrid perks={HOME_DATA.perks} />
          </div>
        </div>
      </section>

      <section className="bg-[#d7ff3f] px-5 py-14 text-black md:px-8 lg:px-12">
        <div className="mx-auto flex max-w-[1600px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="font-bold">Ready for your next game?</p>
            <h2 className="mt-2 text-4xl font-black md:text-6xl">
              Play online, then tell everyone what you think.
            </h2>
          </div>
          <Link
            href="#free-games"
            className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-black px-6 py-3 font-black text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-black/30 active:scale-[0.98]"
          >
            <Play className="h-5 w-5 fill-white" />
            Browse games
          </Link>
        </div>
      </section>
    </main>
  );
}

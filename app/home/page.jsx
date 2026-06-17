"use client";

import { motion, useReducedMotion, } from "framer-motion";
import { Sparkles, } from "lucide-react";
import { useHomeData } from "../hooks/useGame";
import { useNews } from '../hooks/useNews';

import StatsSection from "./StatsSection";
import Libraries from "../Component/Libraries/Libraries.jsx";
import GamePortalScene from "./GamePortalScene.jsx";
import FeaturedGames from "./FeaturedGames.jsx";
import CategoriesSection from "./CategoriesSection.jsx";
import TopRatedGames from "./TopRatedGames.jsx";
import UpcomingGames from "./UpcomingGames.jsx";
import CommunitySection from "./CommunitySection.jsx";
import HomeBottomSection from "./HomeBottomSection.jsx";
import NewsSection from './NewsSection.jsx';





//האנימציות בעמוד הביתF
// פונקציה שמחזירה את הפרופס של האנימציה לפי האם המשתמש ביקש הפחתת תנועה או לא, עם אפשרות להוסיף דיליי לכל סקשן.
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

// קומפוננטה שמקבלת ילדים ומפעילה עליהם את האנימציה של ההופעה, עם אפשרות לדיליי ולקלאסים נוספים.
export function Reveal({ children, delay = 0, className = "", instant = false }) {
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

// כותרת של סקשן עם אפשרות לכוון יישור ולטקסט משני, משולב עם האנימציה של ההופעה.
export function SectionHeader({ eyebrow, title, text, align = "left" }) {
  const centered = align;

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


// הודעה קצרה במקום רשימה, כדי שכשל בשליפה לא ישבור את העמוד.
export function EmptySection({ title, text }) {
  return (
    <Reveal>
      <div className="rounded-lg border border-white/10 bg-black/25 p-6 text-center">
        <Sparkles className="mx-auto h-8 w-8 text-lime-300" />
        <h3 className="mt-4 text-xl font-black text-white">{title}</h3>
        <p className="mt-2 text-sm leading-6 text-zinc-400">{text}</p>
      </div>
    </Reveal>
  );
}








export default function Home() {
  // כל נתוני הבית מגיעים דרך hook אחד כדי שהעמוד לא יכיר את כתובת ה-API ישירות.
  const { data, isError, isLoading } = useHomeData();
  const { data: NewsData, isError: NewsisError, isLoading: NewsisLoading } = useNews();

  return (
    <main
      className="min-h-screen w-full max-w-[100vw] overflow-hidden bg-[#0a0d12] text-white"
    >

      {/* למצב שגיאה*/}
      {isError && (
        <div className="border-b border-amber-200/30 bg-amber-200 px-5 py-3 text-sm font-bold text-black">
          Some live home data could not load right now.
        </div>
      )}

      {/* סקציה ראשית */}
      <GamePortalScene featuredGames={data?.trending} />

      <NewsSection
        news={NewsData}
        isLoading={NewsisLoading}
      />

      {/* סקציה של סטטיסטיקות */}
      <StatsSection stats={data?.stats} />

      {/* סקציה של ספריות */}
      <Libraries />

      {/* סקציה של משחקים gratuiti */}
      <FeaturedGames featuredGames={data?.trending} isLoading={isLoading} />

      {/* סקציה של קטגוריות */}
      <CategoriesSection categories={data?.categories} />

      {/* סקציה של משחקים מובילים */}
      <TopRatedGames topRatedGames={data?.topRated} />

      {/* סקציה של משחקים קרובים */}
      <UpcomingGames upcomingGames={data?.upcoming} />

      {/* סקציה של קהילה */}
      <CommunitySection />

      {/* סקציה של כותרת תחתונה */}
      <HomeBottomSection />

    </main>
  );
}

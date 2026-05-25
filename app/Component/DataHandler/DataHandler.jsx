"use client";
import Link from "next/link";

import GamingLoader from '../GamingLoader/GamingLoader';// רכיב לטעינה עם אנימציה של גיימינג

//רכיב שמטפל בהצגת נתונים ושגיאות וטעינות
export default function DataHandler({
  isLoading,
  isError,
  type = "news", // ברירת מחדל היא חדשות
  children
}) {
  return (
    <>
      {/* מצב טעינה (Loading) */}
      {isLoading && <GamingLoader isLoading={isLoading} />}

      {/* מצב שגיאה (Error) */}
      {isError && (

        <div className="min-h-screen bg-[#0b0e14] flex flex-col items-center justify-center text-center p-6 space-y-6">
          <div className="text-red-500">
            {/* אפשר להשתמש פה באייקון של Lucide כמו ShieldAlert או TriangleAlert */}
            <span className="text-8xl font-black drop-shadow-[0_0_20px_rgba(239,68,68,0.5)]">404</span>
          </div>
          <h1 className="text-3xl font-bold text-white">המשחק לא נמצא בשרת 👾</h1>
          <p className="text-gray-400 max-w-md">
            יכול להיות שהקישור שבור, שהמשחק הוסר מהזירה, או שפשוט הקלדת כתובת לא נכונה.
          </p>
          <Link
            href="/"
            className="mt-4 px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-wider rounded-xl transition-all hover:scale-105 shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            חזור לבסיס (עמוד הבית)
          </Link>
        </div>
      )}

      {/* הצגת הנתונים - רק כשסיימנו לטעון ואין שגיאה */}
      {!isLoading && !isError && children}
    </>
  );
}






/*
{isLoading && (
        <>
          {type === "news" ? (
            /* Skeleton עבור חדשות (שורות) */
/*
<div className="overflow-hidden bg-slate-900/50 py-3 border-y border-slate-800 w-full">
<div className="flex gap-10 animate-pulse px-10">
<div className="h-4 bg-slate-700 rounded w-64"></div>
<div className="h-4 bg-slate-700 rounded w-48"></div>
<div className="h-4 bg-slate-700 rounded w-80"></div>
</div>
</div>
) : (
/* Skeleton עבור משחקים (כרטיסיות) */
/*
<div className="flex gap-5 px-10 overflow-hidden py-8 max-w-7xl mx-auto">
  {[1, 2, 3, 4, 5].map((i) => (
    <div key={i} className="flex-[0_0_85%] sm:flex-[0_0_45%] md:flex-[0_0_20%] animate-pulse">
      <div className="bg-slate-800 rounded-2xl h-48 w-full mb-4"></div>
      <div className="h-4 bg-slate-700 rounded w-3/4 mb-2"></div>
      <div className="h-3 bg-slate-700 rounded w-1/2"></div>
    </div>
  ))}
</div>
)}
      </>
    )}





*/
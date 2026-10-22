'use client';
import { useRef } from 'react';
import Link from 'next/link';
import { Star, Users, } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';// --- קומפוננטת כרטיס משחק מקצועית עם אפקטים מתקדמים ---
import { useAuth } from '../../../Context/AuthContext';
import SmartImage from '../../SmartImage/SmartImage';
import Favorite from '../../Favorite/Favorite';
import WishlistCard from '../../Wishlist/WishlistCard';
import DeleteGame from './DeleteGame';
import EditingGame from './EditingGame';
import FormatDate from '../../FormatDate/FormatDate';


// ============================================================================
// תתי-קומפוננטות לעיצוב נקי
// ============================================================================
const STATUS_CONFIG = {
  AVAILABLE: {
    label: 'Available',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/30',
    text: 'text-cyan-300',
    dot: 'bg-cyan-400'
  },
  "COMING SOON": {
    label: 'Coming Soon',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/30',
    text: 'text-amber-400',
    dot: 'bg-amber-500'
  },
  BETA: {
    label: 'Beta',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/30',
    text: 'text-purple-300',
    dot: 'bg-purple-400'
  },
  "OUT OF STOCK": {
    label: 'Out of Stock',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/30',
    text: 'text-rose-400',
    dot: 'bg-rose-500'
  }
};



// תגית מחיר חכמה שתומכת בהנחות (Industry Standard)
const PriceDisplay = ({ price, discount, isFree }) => {
  if (isFree) return (
    <div className="flex items-center h-10">
      <span className="text-emerald-400 font-black tracking-tighter text-xl">FREE</span>
    </div>
  );

  const hasDiscount = discount && discount > 0;
  const finalPrice = hasDiscount ? price * (1 - discount / 100) : price;

  return (
    <div className="flex flex-col items-end justify-end h-10 leading-none">
      {hasDiscount ? (
        <span className="text-xs text-slate-500 line-through mb-1">
          ${Number(price).toFixed(2)}
        </span>
      ) : (
        /* שומר מקום ריק כשאין הנחה כדי שהגובה לא ישתנה */
        <div className="h-4" />
      )}
      <span
        className={`font-black text-xl tracking-tighter ${Number(finalPrice) === 0
          ? "text-green-400"
          : hasDiscount
            ? "text-cyan-400"
            : "text-white"
          }`}
      >
        {Number(finalPrice) === 0
          ? "FREE"
          : `$${Number(finalPrice).toFixed(2)}`}
      </span>
    </div>
  );
};

// ============================================================================
// הקומפוננטה הראשית: Pro Game Card
// ============================================================================
export default function GameCard({ game, variant = 'default' }) {
  const { isAdmin, user } = useAuth();
  const cardRef = useRef(null);
  const isCompact = variant === 'compact';

  // --- לוגיקה של מעקב עכבר (Glow Effect) ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // החלקת התנועה של האור
  const glowX = useSpring(mouseX, { stiffness: 300, damping: 30 });
  const glowY = useSpring(mouseY, { stiffness: 300, damping: 30 });

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  // שליפת ההגדרות, עם ברירת מחדל ל-AVAILABLE למקרה של שגיאה
  const statusInfo = STATUS_CONFIG[game.status] || STATUS_CONFIG.AVAILABLE;
  // לוגיקה עסקית
  const isComingSoon = game.status === 'COMING SOON';
  const isFree = Number(game.price) === 0;
  const hasDiscount = game.discountPercentage > 0;
  const playCountLabel = game?.playCount > 999 ? `${(game?.playCount / 1000).toFixed(1)}k` : game?.playCount || '0';

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -8 }}
      className={`
                group/card relative flex flex-col w-full overflow-hidden rounded-2xl
                bg-[#0d1117] border border-slate-800/50 transition-colors duration-500
                hover:border-cyan-500/40 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]
                ${isCompact ? 'max-w-xs' : 'max-w-md'}
            `}
    >
      {/* --- אפקט תאורה דינמי שעוקב אחרי העכבר --- */}
      <motion.div
        className="absolute inset-0 z-0 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(600px circle at ${glowX}px ${glowY}px, rgba(34, 211, 238, 0.08), transparent 40%)`,
        }}
      />


      {/* 1: Visual Container (תמונה + שכבות מידע) */}
      <div className={`relative w-full overflow-hidden ${isCompact ? 'h-44' : 'h-52'}`}>
        <Link href={`/games/${game?.title}`} className="block w-full h-full cursor-pointer">
          <SmartImage
            url={game.imageUrl}
            alt={game.title}
            containerClassName="w-full h-full bg-slate-900"
            imageClassName="w-full h-full object-cover transform group-hover/card:scale-110 transition-transform duration-1000 ease-out"
          />
          {/* שכבת גרדיאנט סינמטית */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1117] via-transparent to-black/20" />
        </Link>

        {/* --- חדש: כפתור Wishlist (צד שמאל למעלה) --- */}
        {user && !isCompact && (
          <div className="absolute top-0 left-3 z-30 transform -translate-y-2 group-hover/card:translate-y-0 transition-transform duration-300">
            <WishlistCard gameId={game.id} />
          </div>
        )}

        {/* --- אדמין: כפתורי ניהול בעיצוב "Dashboard" --- */}
        {isAdmin && !isCompact && (
          <div className="absolute top-3 left-10 flex gap-1.5 opacity-0 group-hover/card:opacity-100 translate-y-[-10px] group-hover/card:translate-y-0 transition-all duration-300 z-30">
            <div className="p-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
              <EditingGame game={game} />
            </div>
            <div className="p-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
              <DeleteGame game={game} />
            </div>
          </div>
        )}

        {/* --- משתמש: מועדפים (הקריסטל האנרגטי שלך) --- */}
        {!isCompact && user && (
          <div className="absolute top-0 right-0 p-3 z-30">
            <Favorite id={game.id} />
          </div>
        )}

        {/* --- באנר הנחה (Sale Tag) --- */}
        {hasDiscount && !isComingSoon && (
          <div className="absolute top-4 left-0 bg-cyan-500 text-black font-black px-3 py-1 rounded-r-full shadow-[0_0_15px_rgba(34,211,238,0.5)] z-20 text-xs">
            -{game.discountPercentage}% OFF
          </div>
        )}


        {/* --- סטטוס המשחק בתחתית התמונה --- */}
        <div className="absolute bottom-4 left-4 z-20">
          <div className={`flex items-center gap-1.5 px-3 py-1 rounded-md backdrop-blur-md border ${statusInfo.bg} ${statusInfo.border}`}>
            <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${statusInfo.dot}`} />
            <span className={`text-[10px] font-bold uppercase tracking-wider ${statusInfo.text}`}>
              {statusInfo.label}
            </span>
          </div>
        </div>
      </div>

      {/*  חלק 2: Content Area (שמות, קטגוריות, תיאור)*/}
      <div className="flex flex-grow flex-col p-5 z-10">
        {/* קטגוריות מצומצמות */}
        <div className="flex gap-2 mb-3">
          {game.categories?.length > 0 ? (
            game.categories.slice(0, 2).map((cat) => (
              <span key={cat} className="text-[9px] font-bold text-slate-500 uppercase tracking-[0.1em] border-b border-slate-800">
                {cat}
              </span>
            ))
          ) : (
            /* שומר על גובה מינימלי למקרה שאין קטגוריות */
            <div className="h-[14px]" />
          )}
        </div>

        {/* כותרת ומחיר */}
        <div className="flex justify-between items-start gap-3 mb-2">
          <Link href={`/games/${game?.title}`} className="flex-1 group/title">
            <h3 className="text-xl font-bold text-white leading-tight line-clamp-2 group-hover/title:text-cyan-400 transition-colors">
              {game.title}
            </h3>
          </Link>
          {!isCompact && <PriceDisplay price={game.price} discount={game.discountPercentage} isFree={isFree} />}
        </div>


        {/* חלק 3: Stats Footer (מינימליסטי) */}
        {!isCompact && (
          <div className="mt-auto pt-5">
            {/* פס הפרדה עדין */}
            <div className="h-px w-full bg-slate-800/50 mb-4" />

            <div className="grid grid-cols-3 gap-2">
              {/* Rating */}
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/30 border border-slate-800/50 group-hover/card:border-slate-700 transition-colors">
                <div className="flex items-center gap-1 mb-0.5">
                  <Star size={12} className={game.avgRating > 0 ? "text-cyan-400 fill-cyan-400" : "text-slate-600"} />
                  <span className="text-xs font-bold text-slate-200">
                    {game.avgRating > 0 ? Number(game.avgRating).toFixed(1) : '—'}
                  </span>
                </div>
                <span className="text-[8px] uppercase tracking-tighter text-slate-500 font-bold">Rating</span>
              </div>

              {/* Players */}
              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/30 border border-slate-800/50 group-hover/card:border-slate-700 transition-colors">
                <div className="flex items-center gap-1 mb-0.5 text-slate-200">
                  <Users size={12} className="text-purple-400" />
                  <span className="text-xs font-bold">
                    {playCountLabel}
                  </span>
                </div>
                <span className="text-[8px] uppercase tracking-tighter text-slate-500 font-bold">Players</span>
              </div>

              {/* Trending / Update */}

              <div className="flex flex-col items-center justify-center p-2 rounded-xl bg-slate-900/40 border border-slate-800/80 group-hover/card:border-slate-700/80 group-hover/card:bg-slate-900/60 transition-all duration-300">
                {/* למעלה: התאריך עצמו - מוקטן חזרה ל-10px ומרווח מצומצם */}
                <div className="flex items-center gap-1 mb-0.5 text-slate-200">
                  {/* הוספת האייקון בגודל המקורי (12) כדי שיתאים לטקסט הקטן */}
                  <span className="text-[10px] font-bold">
                    <FormatDate releaseDate={game?.updatedAt} />
                  </span>
                </div>

                {/* למטה: הכותרת "Updated" - מוקטנת חזרה ל-8px וצפופה (tracking-tighter) */}
                <span className="text-[8px] uppercase tracking-tighter text-slate-500 font-bold">
                  Updated
                </span>
              </div>
              
            </div>
          </div>
        )}
      </div>

      {/* קו זוהר תחתון (Progress Bar style) */}
      <div className="absolute bottom-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent w-0 group-hover/card:w-full transition-all duration-700" />
    </motion.div>
  );
}
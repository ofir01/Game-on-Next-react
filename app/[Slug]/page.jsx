"use client";
import { Play, Heart, Eye, Share2, ShoppingCart, Clock, Lock } from 'lucide-react';
import Link from 'next/link';
import DataHandler from '../Component/DataHandler/DataHandler.jsx';
import { useGameSlug } from "../hooks/useGame";
import { useParams } from 'next/navigation';
import Description from './Description';
import GameScreenshots from '../Component/Screenshots/GameScreenshots';
import Tabs from '../Component/Tabs/Tabs';
import Card from '../Component/Card/Card';
import Breadcrumbs from '../Component/Breadcrumbs/Breadcrumbs';
import GameComments from '../Component/Comment/GameComments';
import { useAuth } from '../Context/AuthContext';
import Wishlist from '../Component/Wishlist/Wishlist';
import FormatDate from '../Component/FormatDate/FormatDate';
import ShareButton from '../Component/ShareButton/ShareButton'

export default function GameDetailsPage() {
    const params = useParams();
    const { user } = useAuth();
    const { data: gamesData, isLoading: isGamesLoading, isError: isErrorHome } = useGameSlug(params.Slug);

    // הגדרת הטאבים
    const myTabs = {
        "Description": <Description description={gamesData?.description} />,
        "Screenshots": <GameScreenshots screenshots={gamesData?.screenshots} />,
        "About": (
            <p className="text-gray-400 p-4">
                מידע נוסף על {gamesData?.title} יפורסם כאן בקרוב.
            </p>
        ),
    };

    // משתנים קריטיים ללוגיקת התצוגה והפעולה של הכפתורים
    const isLoggedIn = user;
    const isReleased = !!gamesData?.releaseDate;
    const isPaid = gamesData?.price > 0;
    const status = gamesData?.status !== ('OUT OF STOCK' || 'Coming Soon');

    // לוגיקת ניווט לכפתור הפעולה
    const playButtonHref = gamesData?.gameUrl;
  


    /*const playButtonHref = isPaid
        ? `/Checkout/${gamesData?.id}`
        : (gamesData?.gameUrl ? `${gamesData.gameUrl}?gameId=${gamesData.id}` : '#');*/

    return (
        <DataHandler
            isLoading={isGamesLoading}
            isError={isErrorHome}
        >
            <div className="min-h-screen bg-[#0b0e14] text-white pb-12">

                {/* ----------------- HERO SECTION ----------------- */}
                <div className="relative h-[550px] w-full mb-12 group">
                    {/* Breadcrumbs מעל התמונה */}
                    <div className="absolute top-11 left-0 w-full z-30">
                        <div className="max-w-8xl mx-auto px-6">
                            <Breadcrumbs />
                        </div>
                    </div>

                    <div className="absolute inset-0 overflow-hidden">
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-60 transition-transform duration-700 group-hover:scale-105"
                            style={{ backgroundImage: `url(${gamesData?.imageUrl})` }}
                        ></div>
                    </div>

                    <div className="absolute inset-0 bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/60 to-transparent"></div>

                    <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-4">

                        {/* תגיות קטגוריה */}
                        <div className="flex gap-2 mb-4">
                            {gamesData?.categories.map(tag => (
                                <Link key={tag} href={`/Search?categories=${tag}`}>
                                    <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs rounded-full font-bold uppercase tracking-wider hover:bg-cyan-500 hover:text-black transition-colors">
                                        {tag}
                                    </span>
                                </Link>
                            ))}
                        </div>

                        <h1 className="text-5xl md:text-7xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-400 drop-shadow-lg">
                            {gamesData?.title}
                        </h1>

                        {/* סטטיסטיקות ותאריך */}
                        <div className="flex items-center flex-wrap gap-6 text-gray-300 mb-8">
                            <div className="flex items-center gap-2">
                                <Eye className="w-5 h-5 text-purple-400" />
                                <span>{gamesData?.playCount || 0} שחקו</span>
                            </div>

                            <div className="flex items-center gap-2">
                                <Heart
                                    className={`w-5 h-5 ${isLoggedIn && gamesData?.isFavorite
                                        ? 'fill-red-500 text-red-500'
                                        : 'text-red-400'
                                        }`}
                                />
                                <span>{gamesData?.likeCount || 0} אהבו</span>
                            </div>

                            <FormatDate releaseDate={gamesData?.releaseDate} />
                        </div>

                        {/* כפתורי פעולה ומחיר */}
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center gap-4">

                                {isReleased && status ? (
                                    <Link
                                        href={playButtonHref}
                                        className={`relative px-10 py-4 ${isPaid
                                            ? 'bg-green-500 hover:bg-green-400'
                                            : 'bg-cyan-500 hover:bg-cyan-400'
                                            } text-black font-black text-lg uppercase tracking-wider rounded-xl transition-all hover:scale-105 flex items-center gap-3 shadow-lg`}
                                    >
                                        {isPaid ? (
                                            <ShoppingCart className="w-6 h-6" />
                                        ) : (
                                            <Play className="w-6 h-6 fill-black" />
                                        )}

                                        <span>
                                            {isPaid ? 'רכוש עכשיו' : 'התחל לשחק'}
                                        </span>
                                    </Link>
                                ) : (
                                    <div className="flex items-center gap-3 bg-white/5 border border-white/10 p-1 rounded-xl">
                                        <div className="px-6 py-4 bg-gray-700/50 text-gray-400 font-bold text-lg rounded-lg flex items-center gap-3 cursor-not-allowed">
                                            <Clock className="w-6 h-6" />
                                            <span>coming soon...</span>
                                        </div>

                                        {/* רשימת משאלות מותנית התחברות */}
                                        <Wishlist
                                            gameId={gamesData?.id}
                                            showText={true}
                                            disabled={!isLoggedIn}
                                        />
                                    </div>
                                )}

                                {/* {כפתור שיתוף} */}
                                <ShareButton />


                                {/* ווישליסט קטן */}
                                {isReleased && isLoggedIn && status && (
                                    <Wishlist
                                        gameId={gamesData?.id}
                                        disabled={!isLoggedIn}
                                    />
                                )}

                                {/* הודעה למשתמשים לא מחוברים */}
                                {!isLoggedIn && (
                                    <span className="flex items-center gap-2 text-xs text-gray-500 font-medium italic">
                                        <Lock className="w-3 h-3" />
                                        התחבר כדי להוסיף למועדפים
                                    </span>
                                )}
                            </div>

                            {/* מחיר */}
                            <div className="flex items-center gap-3 min-h-[30px] px-1">
                                {!isReleased ? (
                                    <span className="text-yellow-500 font-bold text-sm uppercase tracking-widest animate-pulse flex items-center gap-2">
                                        The game is not yet available to play
                                    </span>
                                ) : isPaid ? (
                                    <>
                                        <span className="text-2xl font-black text-white">
                                            ₪{gamesData.finalPrice?.toFixed(2)}
                                        </span>

                                        {gamesData.isOnSale && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500 line-through text-sm font-bold">
                                                    ₪{gamesData.price}
                                                </span>

                                                <span className="bg-green-500/20 text-green-400 text-xs font-bold px-2 py-0.5 rounded border border-green-500/30">
                                                    -{gamesData.discountPercentage}% הנחה
                                                </span>
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <span className="text-cyan-400 font-bold text-sm uppercase tracking-widest opacity-80">
                                        Free to Play
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* ----------------- CONTENT GRID ----------------- */}
                <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2 space-y-12">

                        <Tabs tabsData={myTabs} />

                        <div className="space-y-6">
                            <h3 className="text-2xl font-bold flex items-center gap-2">
                                <Play className="w-5 h-5 text-cyan-500" />
                                משחקים דומים
                            </h3>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {gamesData?.similarGames?.map(sg => (
                                    <Card
                                        key={sg.id}
                                        game={sg}
                                        variant="compact"
                                    />
                                ))}
                            </div>
                        </div>

                        {!isGamesLoading && <GameComments />}
                    </div>
                </div>
            </div>
        </DataHandler>
    );
}

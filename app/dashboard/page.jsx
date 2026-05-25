'use client';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusCircle, LayoutDashboard, Settings, Newspaper, ShieldCheck, MessageSquare, Heart,FolderKanban  } from 'lucide-react';


import { useAuth } from '../Context/AuthContext';

// Pages
import Addgame from './Add-game/page.jsx';
import Userss from './Users/page.jsx';
import NewsManager from './NewsManager/page.jsx';
import AccessControl from './AccessControl/page.jsx';
import Profile from './Profile/page.jsx';
import FavoritesList from './FavoritesList/FavoritesList.jsx';
import WishlistGallery from './WishlistGallery/page.jsx';
import CategoriesManager from './CategoriesManager/page.jsx';


export default function AdminDashboard() {
    const { user, isAdmin } = useAuth();
    const [activeTab, setActiveTab] = useState('Profile');

    //יוצג לכל משתמש מחובר
    const tabs = [
        { id: 'Profile', icon: <Settings size={18} />, label: 'Profile' },
        { id: 'Favorites-List', icon: <Heart size={18} />, label: 'Favorites' },
        { id: 'Wishlist-Gallery', icon: <LayoutDashboard size={18} />, label: 'Wishlist Gallery' },
    ];

    //יוצג רק למנהל
    const adminTabs = [
        { id: 'add-game', icon: <PlusCircle size={18} />, label: 'Add Game' },
        { id: 'Categories-Manager', icon: <FolderKanban  size={18} />, label: 'Categories Manager' },
        { id: 'users', icon: <MessageSquare size={18} />, label: 'Users Control' },
        { id: 'News-Manager', icon: <Newspaper size={18} />, label: 'News Manager' },
        { id: 'Access-Control', icon: <ShieldCheck size={18} />, label: 'Access Control' },
    ];

    //הדפים
    const renderPage = () => {
        switch (activeTab) {
            case 'add-game': return <Addgame />;
            case 'Categories-Manager': return <CategoriesManager />;
            case 'users': return <Userss />;
            case 'News-Manager': return <NewsManager />;
            case 'Access-Control': return <AccessControl />;
            case 'Profile': return <Profile />;
            case 'Favorites-List': return <FavoritesList />;
            case 'Wishlist-Gallery': return <WishlistGallery />;
            default: return null;
        }
    };


    return (
        <>
            {user && (
                <div className="min-h-screen relative overflow-hidden text-slate-200 flex flex-col md:flex-row bg-[#020617]">

                    {/* BACKGROUND LAYER */}
                    <div className="absolute inset-0 pointer-events-none">

                        {/* glow blobs */}
                        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[140px]" />
                        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[140px]" />
                        <div className="absolute top-[40%] left-[50%] w-[350px] h-[350px] bg-pink-500/20 rounded-full blur-[140px]" />

                        {/* noise */}
                        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay
            bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')]" />
                    </div>


                    {/* Sidebar */}
                    <aside className="w-full md:w-64 bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-2xl shadow-black/40 p-6 flex flex-col gap-10">
                        {/* Header */}
                        <div className="flex items-center gap-3 px-2">
                            <div className="bg-purple-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
                                <LayoutDashboard size={20} />
                            </div>

                            <span className={`font-bold text-xl ${isAdmin ? 'text-amber-400' : 'text-white'}`}>
                                {user?.role}
                            </span>
                        </div>

                        {/* NAV */}
                        <nav className="flex flex-col gap-2 relative">

                            {tabs.map(tab => (
                                <TabButton key={tab.id} {...tab} activeTab={activeTab} setActiveTab={setActiveTab} />
                            ))}

                            {isAdmin && adminTabs.map(tab => (
                                <TabButton key={tab.id} {...tab} activeTab={activeTab} setActiveTab={setActiveTab} />
                            ))}
                        </nav>

                        <div className="mt-auto text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            Online
                        </div>
                    </aside>

                    {/* MAIN */}
                    <main className="flex-1 p-8 md:p-12">
                        <div className="max-w-5xl">

                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeTab}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.25 }}
                                >
                                    {renderPage()}
                                </motion.div>
                            </AnimatePresence>

                            {(!isAdmin && ['add-game', 'users', 'News-Manager'].includes(activeTab)) && (
                                <div className="text-red-500 font-bold mt-4">
                                    אין לך הרשאה לצפות בדף זה.
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            )}
        </>
    );
}

/* ---------------- TAB BUTTON ---------------- */
//העיצוב בתפריט
function TabButton({ id, icon, label, activeTab, setActiveTab }) {
    const isActive = activeTab === id;

    return (
        <button
            onClick={() => setActiveTab(id)}
            className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-300
                hover:scale-[1.02]
                hover:bg-white/5
                ${isActive ? 'text-white' : 'text-slate-400'}
            `}
        >

            {/* glow background */}
            {isActive && (
                <span className="absolute inset-0 rounded-xl bg-purple-500/10 blur-sm" />
            )}

            {/* left glow bar */}
            {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-purple-500 rounded-full shadow-[0_0_12px_#a855f7]" />
            )}

            <span className="relative z-10">{icon}</span>
            <span className="relative z-10">{label}</span>
        </button>
    );
}

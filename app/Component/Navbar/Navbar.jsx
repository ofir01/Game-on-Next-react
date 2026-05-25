'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../Context/AuthContext';
import { User, LogOut, Gamepad2 } from 'lucide-react';
import VerificationBanner from '../VerificationBanner/VerificationBanner';
import SearchBar from '../Search/SearchBar';

const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Community', href: '/community' },
    { name: 'About', href: '/About' },
    { name: 'Contact', href: '/contact' }
];

export default function Navbar() {
    const pathname = usePathname();
    const { user, logout, isAdmin } = useAuth();

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* רקע זכוכית (Glassmorphism) עם טשטוש עמוק וקו תחתון זוהר עדין */}
            <div className="absolute inset-0 bg-[#0b0e14]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"></div>

            <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex justify-between items-center h-24 gap-3 sm:gap-6 lg:gap-8">

                    {/* --- 1. לוגו וסייען (צד שמאל) --- */}
                    <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                        <Link href="/" className="group flex items-center space-x-3 transition-all duration-300 active:scale-95">
                            <div className="relative">
                                {/* אפקט הילה מסביב לאייקון הלוגו */}
                                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-500"></div>
                                <Gamepad2 className="w-9 h-9 sm:w-10 sm:h-10 text-cyan-400 relative z-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            </div>
                            <span className="text-xl sm:text-2xl font-black tracking-tighter text-white group-hover:text-cyan-400 transition-colors duration-300 uppercase">
                                Game<span className="text-cyan-500">On</span>
                            </span>
                        </Link>
                    </div>

                    {/* --- 2. ניווט מרכזי (מרכז) --- */}
                    <nav className="hidden lg:flex items-center justify-center flex-grow space-x-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const isDashboard = item.href === '/dashboard';

                            // לוגיקת נראות: Dashboard מוצג רק למשתמש מחובר
                            if (isDashboard && !user) return null;

                            // הגדרת צבעים דינמית לפי סוג העמוד (Admin/User)
                            const activeColor = (isAdmin && isDashboard) ? 'text-amber-400' : 'text-cyan-400';
                            const inactiveColor = (isAdmin && isDashboard) ? 'text-amber-600/80 hover:text-amber-400' : 'text-slate-400 group-hover:text-white';
                            const underlineColor = (isAdmin && isDashboard)
                                ? 'from-amber-400 to-yellow-600 shadow-[0_0_10px_#fbbf24]'
                                : 'from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]';

                            return (
                                <Link key={item.name} href={item.href} className="group relative px-5 py-2">
                                    <span className={`text-sm font-bold uppercase tracking-widest transition-all duration-300 ${isActive ? activeColor : inactiveColor
                                        }`}>
                                        {(isDashboard && isAdmin) ? 'Dashboard' : item.name}
                                    </span>

                                    {/* קו תחתון אקטיבי עם אנימציית רוחב */}
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r transition-all duration-300 ${underlineColor} ${isActive ? 'w-full' : 'w-0 group-hover:w-full'
                                        }`}></span>
                                </Link>
                            );
                        })}
                    </nav>


                    {/* --- 3. אזור פונקציות (צד ימין): חיפוש ומשתמש --- */}
                    <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                        {/* חלונית חיפוש - מקום מוגדר כדי לא לדחוס את הכפתור */}
                        <div className="hidden md:block min-w-[280px] xl:min-w-[350px]">
                            <SearchBar />
                        </div>
                        {/* קו מפריד דקורטיבי */}
                        <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

                        {/* --- כפתורי פעולה --- */}
                        <div className="flex items-center gap-4">
                            {/* הבאנר יוצג כאן רק אם isPendingVerification פועל */}
                            <VerificationBanner />

                            {user ? (
                                <div className="flex items-center gap-4">
                                    <div className="hidden xl:flex flex-col items-end">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">שלום</span>
                                        <span className="text-sm font-bold text-white tracking-tight">{user.name || user.email?.split('@')[0]}</span>
                                    </div>

                                    <button
                                        onClick={logout}
                                        className="p-3 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/50 transition-all duration-300"
                                        title="Logout"
                                    >
                                        <LogOut size={20} />
                                    </button>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="relative group flex items-center gap-2 sm:gap-3 bg-white text-black px-4 sm:px-8 py-3 rounded-lg sm:rounded-xl font-black text-xs sm:text-sm uppercase tracking-tighter transition-all duration-300 hover:bg-cyan-400 hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-cyan-500/40 overflow-hidden"
                                >
                                    <User size={18} className="transition-transform group-hover:rotate-12" />
                                    <span className="whitespace-nowrap">Sign In</span>
                                    <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"></span>
                                </Link>
                            )}
                        </div>
                    </div>

                </div>
            </div>
        </header>
    );
}

'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../Context/AuthContext';
import { User, LogOut, Gamepad2, Settings } from 'lucide-react';
import VerificationBanner from '../VerificationBanner/VerificationBanner';
import SearchBar from '../Search/SearchBar';

const navItems = [
    { name: 'Dashboard', href: '/dashboard' },
    { name: 'Community', href: '/community' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
];

export default function Navbar() {
    const pathname = usePathname();
    // 1. הוספנו כאן את ה-loading מהקונטקסט
    const { user, loading, logout, isAdmin } = useAuth(); 
    
    // ניהול מצב התפריט הנפתח
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const menuRef = useRef(null);

    // סגירת התפריט בלחיצה מחוץ לאזור שלו
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        // הוספת המאזין כשהתפריט פתוח
        if (isProfileMenuOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isProfileMenuOpen]);

    return (
        <header className="fixed top-0 left-0 right-0 z-50">
            {/* רקע זכוכית (Glassmorphism) */}
            <div className="absolute inset-0 bg-[#0b0e14]/90 backdrop-blur-xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.8)]"></div>

            <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12">
                <div className="flex justify-between items-center h-24 gap-3 sm:gap-6 lg:gap-8">

                    {/* --- 1. לוגו --- */}
                    <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                        <Link href="/" className="group flex items-center space-x-3 transition-all duration-300 active:scale-95">
                            <div className="relative">
                                <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20 group-hover:opacity-60 transition-opacity duration-500"></div>
                                <Gamepad2 className="w-9 h-9 sm:w-10 sm:h-10 text-cyan-400 relative z-10 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                            </div>
                            <span className="text-xl sm:text-2xl font-black tracking-tighter text-white group-hover:text-cyan-400 transition-colors duration-300 uppercase">
                                Game<span className="text-cyan-500">On</span>
                            </span>
                        </Link>
                    </div>

                    {/* --- 2. ניווט מרכזי --- */}
                    <nav className="hidden lg:flex items-center justify-center flex-grow space-x-2">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            const isDashboard = item.href === '/dashboard';

                            if (isDashboard && !user) return null;

                            const activeColor = (isAdmin && isDashboard) ? 'text-amber-400' : 'text-cyan-400';
                            const inactiveColor = (isAdmin && isDashboard) ? 'text-amber-600/80 hover:text-amber-400' : 'text-slate-400 group-hover:text-white';
                            const underlineColor = (isAdmin && isDashboard)
                                ? 'from-amber-400 to-yellow-600 shadow-[0_0_10px_#fbbf24]'
                                : 'from-cyan-500 to-blue-600 shadow-[0_0_10px_rgba(6,182,212,0.5)]';

                            return (
                                <Link key={item.name} href={item.href} className="group relative px-5 py-2">
                                    <span className={`text-sm font-bold uppercase tracking-widest transition-all duration-300 ${isActive ? activeColor : inactiveColor}`}>
                                        {(isDashboard && isAdmin) ? 'Dashboard' : item.name}
                                    </span>
                                    <span className={`absolute bottom-0 left-0 h-0.5 bg-gradient-to-r transition-all duration-300 ${underlineColor} ${isActive ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* --- 3. אזור פונקציות --- */}
                    <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
                        <div className="hidden md:block min-w-[280px] xl:min-w-[350px]">
                            <SearchBar />
                        </div>
                        
                        <div className="h-8 w-[1px] bg-white/10 hidden sm:block"></div>

                        <div className="flex items-center gap-4">
                            <VerificationBanner />

                            {/* 2. כאן הוספנו את בדיקת ה-loading */}
                            {loading ? (
                                // תצוגת "שלד" טעינה (Skeleton) עם אפקט אנימציה פועם
                                <div className="flex items-center gap-4 animate-pulse">
                                    <div className="hidden xl:flex flex-col items-end gap-1.5">
                                        <div className="h-2 w-8 bg-slate-700/50 rounded"></div>
                                        <div className="h-3 w-16 bg-slate-700/50 rounded"></div>
                                    </div>
                                    <div className="w-12 h-12 rounded-xl bg-slate-800/50 border border-slate-700/50"></div>
                                </div>
                            ) : user ? (
                                // המשתמש מחובר - מציגים את הפרופיל (הקוד המקורי שלך)
                                <div className="flex items-center gap-4">
                                    <div className="hidden xl:flex flex-col items-end">
                                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">שלום</span>
                                        <span className="text-sm font-bold text-white tracking-tight">
                                            {user.name || user.email?.split('@')[0]}
                                        </span>
                                    </div>

                                    {/* מעטפת לתמונת הפרופיל והתפריט הנפתח */}
                                    <div className="relative" ref={menuRef}>
                                        
                                        {/* תמונת פרופיל / אווטאר - משמשת ככפתור הפעלה */}
                                        <div 
                                            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                            className="relative group cursor-pointer active:scale-95 transition-transform"
                                        >
                                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl blur opacity-30 group-hover:opacity-75 transition duration-300"></div>
                                            <div className="relative w-12 h-12 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center overflow-hidden">
                                                {user.profilePicture ? (
                                                    <img
                                                        src={user.profilePicture}
                                                        alt={user.name || "Profile"}
                                                        className="w-full h-full object-cover"
                                                        referrerPolicy="no-referrer"
                                                    />
                                                ) : (
                                                    <span className="text-xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-400 to-purple-500">
                                                        {(user.name || user.email || 'G')[0].toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* תפריט נפתח (Dropdown) עם אנימציה */}
                                        <div 
                                            className={`absolute right-0 mt-3 w-56 rounded-2xl bg-[#131823]/95 backdrop-blur-xl border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.8)] overflow-hidden transition-all duration-300 origin-top-right ${
                                                isProfileMenuOpen 
                                                    ? 'opacity-100 scale-100 translate-y-0 visible' 
                                                    : 'opacity-0 scale-95 -translate-y-2 invisible'
                                            }`}
                                        >
                                            <div className="p-2 flex flex-col gap-1">
                                                {/* קישור לפרופיל / הגדרות */}
                                                <Link 
                                                    href="/dashboard/profile" 
                                                    onClick={() => setIsProfileMenuOpen(false)}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-colors group"
                                                >
                                                    <Settings size={18} className="text-slate-400 group-hover:text-cyan-400 transition-colors" />
                                                    <span className="text-sm font-semibold">Settings / Profile</span>
                                                </Link>

                                                {/* קו מפריד עדין */}
                                                <div className="h-[1px] bg-white/5 my-1 mx-2"></div>

                                                {/* כפתור התנתקות */}
                                                <button
                                                    onClick={() => {
                                                        logout();
                                                        setIsProfileMenuOpen(false);
                                                    }}
                                                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-red-400 hover:bg-red-500/10 transition-colors group w-full text-left"
                                                >
                                                    <LogOut size={18} className="text-slate-400 group-hover:text-red-400 transition-colors" />
                                                    <span className="text-sm font-semibold">Logout</span>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                </div>
                            ) : (
                                // המשתמש לא מחובר - מציגים כפתור התחברות
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
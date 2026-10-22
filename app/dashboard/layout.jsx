'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Library, PlusCircle, LayoutDashboard, Settings, Newspaper, ShieldCheck, MessageSquare, Heart, FolderKanban } from 'lucide-react';

import { useAuth } from '../Context/AuthContext'; 

export default function DashboardLayout({ children }) {
    const { user, isAdmin } = useAuth();
    const pathname = usePathname();

    // רשימת הטאבים הראשיים של המשתמש
    const tabs = [
        { path: '/dashboard/profile', icon: <Settings size={18} />, label: 'Profile' },
        { path: '/dashboard/favorites-list', icon: <Heart size={18} />, label: 'Favorites' },
        { path: '/dashboard/wishlist-gallery', icon: <LayoutDashboard size={18} />, label: 'Wishlist Gallery' },
        { path: '/dashboard/purchased-games-list', icon: <Library size={18} />, label: 'Purchased Games' },
    ];

    // יוצג רק למנהל
    const adminTabs = [
        { path: '/dashboard/purchases', icon: <PlusCircle size={18} />, label: 'Purchases' },
        { path: '/dashboard/add-game', icon: <PlusCircle size={18} />, label: 'Add Game' },
        { path: '/dashboard/categories-manager', icon: <FolderKanban size={18} />, label: 'Categories Manager' },
        { path: '/dashboard/users', icon: <MessageSquare size={18} />, label: 'Users Control' },
        { path: '/dashboard/news-manager', icon: <Newspaper size={18} />, label: 'News Manager' },
        { path: '/dashboard/access-control', icon: <ShieldCheck size={18} />, label: 'Access Control' },
    ];

    // רשימת נתיבים שדורשים הרשאת מנהל (כדי לחסום משתמש רגיל שמנסה להיכנס דרך ה-URL)
    const adminPaths = adminTabs.map(tab => tab.path);
    const isAccessDenied = !isAdmin && adminPaths.includes(pathname);

    return (
        <>
            {user && (
                <div className="min-h-screen relative overflow-hidden text-slate-200 flex flex-col md:flex-row bg-[#020617]">
                    {/* BACKGROUND LAYER */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/30 rounded-full blur-[140px]" />
                        <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[140px]" />
                        <div className="absolute top-[40%] left-[50%] w-[350px] h-[350px] bg-pink-500/20 rounded-full blur-[140px]" />
                        <div className="absolute inset-0 opacity-[0.06] mix-blend-overlay bg-[url('https://www.transparenttextures.com/patterns/noise-pattern-with-subtle-cross-lines.png')]" />
                    </div>

                    {/* Sidebar */}
                    <aside className="w-full md:w-64 bg-white/5 backdrop-blur-2xl border-r border-white/10 shadow-2xl shadow-black/40 p-6 flex flex-col gap-10">
                        {/* Header */}
                        <div className="flex items-center gap-3 px-2">
                            <div className="bg-purple-600 p-2 rounded-xl shadow-lg shadow-purple-500/20">
                                <LayoutDashboard size={20} />
                            </div>
                            <span className={`font-bold text-xl ${isAdmin ? 'text-amber-400' : 'text-white'}`}>
                                {user?.role || 'User'}
                            </span>
                        </div>

                        {/* NAV */}
                        <nav className="flex flex-col gap-2 relative">
                            {tabs.map(tab => (
                                <TabLink key={tab.path} {...tab} currentPath={pathname} />
                            ))}

                            {isAdmin && adminTabs.map(tab => (
                                <TabLink key={tab.path} {...tab} currentPath={pathname} />
                            ))}
                        </nav>

                        <div className="mt-auto text-emerald-400 text-[10px] font-bold uppercase tracking-widest flex items-center gap-2">
                            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                            Online
                        </div>
                    </aside>

                    {/* MAIN */}
                    <main className="flex-1 p-8 md:p-12 relative z-10 overflow-y-auto">
                        <div className="max-w-5xl">
                            {isAccessDenied ? (
                                <div className="text-red-500 font-bold mt-4 p-4 bg-red-500/10 rounded-xl border border-red-500/20">
                                    אין לך הרשאה לצפות בדף זה.
                                </div>
                            ) : (
                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={pathname} // המפתח כאן אומר ל-Framer Motion לעשות אנימציה כל פעם שה-URL משתנה
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        transition={{ duration: 0.25 }}
                                    >
                                        {/* כאן ירונדר התוכן של העמוד הנוכחי */}
                                        {children}
                                    </motion.div>
                                </AnimatePresence>
                            )}
                        </div>
                    </main>
                </div>
            )}
        </>
    );
}

/* ---------------- TAB LINK COMPONENT ---------------- */
// עכשיו משתמש ב-Link במקום button
function TabLink({ path, icon, label, currentPath }) {
    const isActive = currentPath === path || currentPath.startsWith(`${path}/`);

    return (
        <Link
            href={path}
            className={`
                relative flex items-center gap-3 px-4 py-3 rounded-xl
                transition-all duration-300
                hover:scale-[1.02] hover:bg-white/5
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
        </Link>
    );
}
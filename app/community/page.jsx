'use client';

import { motion } from 'framer-motion';
import { Users, MessageSquare, Trophy, CalendarDays, Search, Star, Flame, LayoutGrid } from 'lucide-react';
import { useState } from 'react';

// --- DATA MOCKS (נתונים לדוגמה) ---
const forumCategories = [
    { id: 1, name: 'General Discussion', posts: '15.2K', icon: MessageSquare, color: 'text-blue-400' },
    { id: 2, name: 'Game News & Updates', posts: '8.1K', icon: Flame, color: 'text-red-400' },
    { id: 3, name: 'Tournaments & Esports', posts: '4.5K', icon: Trophy, color: 'text-amber-400' },
    { id: 4, name: 'Creations & Fan Art', posts: '10.9K', icon: LayoutGrid, color: 'text-emerald-400' },
];

const activeThreads = [
    { id: 1, title: 'CyberPunk 2077 - New DLC Discussion', author: 'NeoGamer', replies: 342, views: '1.2K', avatar: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=Neo' },
    { id: 2, title: 'Weekly Speedrun Challenge: Hollow Knight', author: 'VoidWalker', replies: 120, views: '890', avatar: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=Void' },
    { id: 3, title: '[Poll] Best Indie Game of 2024?', author: 'PixelQueen', replies: 561, views: '2.5K', avatar: 'https://api.dicebear.com/8.x/pixel-art/svg?seed=Pixel' },
];

const upcomingEvents = [
    { id: 1, title: 'GameOn Summer Major 2024', date: 'July 15-17', type: 'Tournament' },
    { id: 2, title: 'Indie Dev AMA - BlueSprite Studio', date: 'July 20', type: 'Live Stream' },
];

// --- FADE IN ANIMATION VARIANTS ---
const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.4 } }
};

export default function CommunityPage() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <div className="min-h-screen bg-[#0b1220] text-slate-200 px-6 md:px-16 py-12 relative overflow-hidden font-sans">
            
            {/* Background Glows - מותאם מהדוגמה שלך */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-100px] right-[-100px] w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[160px]" />
                <div className="absolute bottom-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[140px]" />
            </div>

            {/* --- HERO SECTION --- */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center max-w-4xl mx-auto mb-16 relative z-10"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm mb-4">
                    <Star size={14} className="animate-pulse" />
                    <span>The Heart of Gaming</span>
                </div>
                <h1 className="text-5xl md:text-6xl font-extrabold tracking-tighter bg-gradient-to-r from-white via-slate-200 to-purple-400 bg-clip-text text-transparent mb-5">
                    GameOn Community Hub
                </h1>
                <p className="text-slate-400 text-xl max-w-2xl mx-auto leading-relaxed">
                    Connect, compete, and share with thousands of players worldwide. Your next adventure starts here.
                </p>

                {/* Search Bar */}
                <div className="mt-10 relative max-w-xl mx-auto">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input 
                        type="text"
                        placeholder="Search forums, players, events..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-full py-3.5 pl-12 pr-6 text-slate-100 placeholder:text-slate-500 focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition outline-none"
                    />
                </div>
            </motion.div>

            {/* --- QUICK STATS & UPCOMING EVENTS --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12 max-w-7xl mx-auto relative z-10">
                {/* Stats */}
                <motion.div 
                    variants={containerVariants} initial="hidden" animate="visible"
                    className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4"
                >
                    <StatCard icon={Users} label="Members" value="150K+" color="text-purple-400" />
                    <StatCard icon={MessageSquare} label="Posts Today" value="12.8K" color="text-blue-400" />
                    <StatCard icon={Flame} label="Online Now" value="45.2K" color="text-red-400" />
                    <StatCard icon={Trophy} label="Tournaments" value="12 Active" color="text-amber-400" />
                </motion.div>

                {/* Events Widget */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                    className="bg-white/5 border border-white/10 rounded-3xl p-6"
                >
                    <div className="flex items-center gap-3 mb-5">
                        <CalendarDays className="text-purple-300" />
                        <h3 className="text-xl font-bold text-white">Upcoming Events</h3>
                    </div>
                    <div className="space-y-4">
                        {upcomingEvents.map(event => (
                            <div key={event.id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0 last:pb-0">
                                <div>
                                    <p className="font-medium text-slate-100">{event.title}</p>
                                    <p className="text-xs text-purple-300">{event.type}</p>
                                </div>
                                <div className="text-sm font-mono text-slate-400 bg-white/5 px-3 py-1 rounded-md">{event.date}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* --- MAIN CONTENT: FORUMS & ACTIVITY --- */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 max-w-7xl mx-auto relative z-10">
                
                {/* Forum Categories */}
                <motion.div 
                    variants={containerVariants} initial="hidden" animate="visible"
                    className="xl:col-span-1 space-y-4"
                >
                    <h2 className="text-2xl font-bold text-white mb-6">Explore Forums</h2>
                    {forumCategories.map(cat => (
                        <motion.div key={cat.id} variants={itemVariants} whileHover={{ x: 5 }} className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 cursor-pointer hover:bg-white/10 transition-all">
                            <div className={`p-3 rounded-xl bg-slate-800/50 border border-white/10 ${cat.color}`}>
                                <cat.icon size={24} />
                            </div>
                            <div>
                                <h4 className="font-semibold text-slate-100">{cat.name}</h4>
                                <p className="text-sm text-slate-400">{cat.posts} Posts</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Hot Threads */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                    className="xl:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold text-white">Hot Discussions</h2>
                        <button className="text-sm text-purple-300 hover:text-purple-200 transition">View All</button>
                    </div>
                    
                    <div className="space-y-3">
                        {activeThreads.map(thread => (
                            <motion.div 
                                key={thread.id} 
                                whileHover={{ y: -2, backgroundColor: 'rgba(255,255,255,0.08)' }}
                                className="flex items-center gap-4 bg-white/5 p-4 rounded-xl border border-white/5 cursor-pointer transition-all"
                            >
                                <img src={thread.avatar} alt={thread.author} className="w-10 h-10 rounded-full bg-slate-700" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-slate-100 truncate hover:text-purple-300">{thread.title}</p>
                                    <p className="text-xs text-slate-500">by {thread.author}</p>
                                </div>
                                <div className="flex gap-6 text-center text-sm text-slate-400">
                                    <div><p className="font-semibold text-slate-200">{thread.replies}</p><p className="text-xs">Replies</p></div>
                                    <div><p className="font-semibold text-slate-200">{thread.views}</p><p className="text-xs">Views</p></div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

            </div>

            {/* --- CALL TO ACTION (CTA) --- */}
            <motion.div
                initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ duration: 0.8 }}
                className="mt-24 max-w-4xl mx-auto text-center bg-gradient-to-b from-purple-600/20 to-blue-600/10 border border-purple-500/20 rounded-3xl p-12 relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div> {/* הוספת גריד עדין לרקע אם יש */}
                <h3 className="text-3xl font-bold text-white mb-4 relative z-10">New Here?</h3>
                <p className="text-slate-300 mb-8 max-w-md mx-auto relative z-10">Join the discussion, create your profile, and start earning community badges!</p>
                <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold px-10 py-3.5 rounded-full shadow-lg shadow-purple-500/20 hover:scale-105 transition-transform relative z-10">
                    Create Your Account
                </button>
            </motion.div>

        </div>
    );
}

// --- HELPER COMPONENTS ---

function StatCard({ icon: Icon, label, value, color }) {
    return (
        <motion.div 
            variants={itemVariants}
            whileHover={{ y: -5, borderColor: 'rgba(168, 85, 247, 0.4)' }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 text-center transition-all duration-300"
        >
            <div className={`flex justify-center ${color} mb-2`}>
                <Icon size={24} strokeWidth={1.5} />
            </div>
            <div className="text-2xl font-extrabold text-white tracking-tight">{value}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">{label}</div>
        </motion.div>
    );
}
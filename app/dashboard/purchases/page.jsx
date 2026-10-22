"use client";

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Clock,CornerUpLeft, RotateCcw, TrendingUp, RefreshCw, Receipt, User, Gamepad2, CheckCircle2, XCircle, Inbox, AlertTriangle, Sparkles, Calendar, ShoppingBag } from 'lucide-react';
import Pagination from '../../Component/Pagination/Pagination';
import { useAdminPurchases, useAdminRefundPurchase } from '../../hooks/games/usePurchaseGame';




// 1. הגדרת המצבים השונים (מומלץ לשים מחוץ ל-return, בתוך הקומפוננטה)
const getStatusConfig = (status) => {
    switch (status) {
        case 'completed':
            return {
                label: 'הושלם',
                colors: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
                Icon: CheckCircle2
            };
        case 'refunded':
            return {
                label: 'הוחזר',
                colors: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
                Icon: CornerUpLeft
            };
        case 'pending':
        default:
            return {
                label: 'ממתין',
                colors: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
                Icon: Clock 
            };
    }
};

// קומפוננטה להצגת סטטוס הרכישה עם צבעים ואייקון
const StatusBadge = ({ status }) => {
    const { label, colors, Icon } = getStatusConfig(status);

    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colors}`}>
            <Icon className="w-3.5 h-3.5" />
            {label}
        </span>
    );
};


// פונקציה לקבלת תאריך היום בפורמט YYYY-MM-DD
const getTodayString = () => new Date().toISOString().split('T')[0];
// הגדרות האנימציה של המכולה והפריטים
const containerVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, staggerChildren: 0.08 } }
};
// הגדרות האנימציה של כל פריט ברשימה
const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0 }
};


export default function Purchases() {
    const today = getTodayString();

    const defaultFilters = {
        receiptId: '',
        userName: '',
        gameName: '',
        fromDate: today,
        toDate: today
    };

    const [searchInput, setSearchInput] = useState(defaultFilters);
    const [activeFilters, setActiveFilters] = useState(defaultFilters);
    const [page, setPage] = useState(1);

    const { data, isLoading, isError, error } = useAdminPurchases(activeFilters, page);// פונקציה לקבלת נתוני הרכישות מהשרת עם הסינון והעמוד הנוכחי
    const { refundPurchase, isRefunding } = useAdminRefundPurchase();// פונקציה לטיפול בלחיצה על כפתור הזיכוי

    // רשימת הרכישות (לעמוד הנוכחי)
    const purchasesList = data?.data || [];

    // הסטטיסטיקות המוכנות מהשרת. אם אין, יהיה null כמו שביקשת
    const stats = data?.statistics || null;

    // סך הכל עמודים
    const totalPages = data?.pagination?.totalPages || 1;


    // פונקציה לטיפול בלחיצה על כפתור הסינון
    const handleSearch = (e) => {
        e.preventDefault();
        setActiveFilters(searchInput);
        setPage(1);
    };

    // פונקציה לאיפוס הסינון לערכי ברירת המחדל
    const handleReset = () => {
        setSearchInput(defaultFilters);
        setActiveFilters(defaultFilters);
        setPage(1);
    };

    // פונקציה לטיפול בלחיצה על כפתור הזיכוי
    const handleRefundClick = async (purchaseId) => {
        if (window.confirm('האם אתה בטוח שברצונך לזכות רכישה זו?')) {
            try {
                await refundPurchase(purchaseId);
            } catch (err) {
                alert('שגיאה בביצוע הזיכוי. אנא נסה שוב.');
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300 gap-4" dir="rtl">
                <RefreshCw className="w-10 h-10 animate-spin text-indigo-500" />
                <p className="text-lg font-medium animate-pulse">טוען נתונים...</p>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6" dir="rtl">
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-2xl p-8 max-w-md text-center">
                    <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                    <h3 className="text-xl font-bold text-rose-400 mb-2">ארעה שגיאה</h3>
                    <p className="text-slate-400 text-sm">{error?.message || 'שגיאה בטעינת הנתונים'}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 font-sans selection:bg-indigo-500 selection:text-white" dir="rtl">
            <motion.div
                className="max-w-7xl mx-auto space-y-8"
                initial="hidden"
                animate="visible"
                variants={containerVariants}
            >
                <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-800">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
                                ניהול רכישות וקבלות
                            </h1>
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                        </div>
                        <p className="text-slate-400 text-sm mt-1">מעקב, סינון וביצוע זיכויים בזמן אמת לפי טווח תאריכים</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                    <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 p-6 border border-slate-800/80 shadow-xl backdrop-blur-xl group hover:border-emerald-500/50 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">הכנסות נטו</p>
                                <h3 className="text-2xl font-black text-white mt-2 font-mono">
                                    ₪{(stats?.totalSoldAmount || 0).toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 z-10">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 p-6 border border-slate-800/80 shadow-xl backdrop-blur-xl group hover:border-indigo-500/50 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">משחקים שנמכרו</p>
                                <h3 className="text-2xl font-black text-indigo-300 mt-2 font-mono">
                                    {stats?.totalSoldGames || 0}
                                </h3>
                            </div>
                            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 z-10">
                                <ShoppingBag className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 p-6 border border-slate-800/80 shadow-xl backdrop-blur-xl group hover:border-amber-500/50 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">כמות זיכויים</p>
                                <h3 className="text-2xl font-black text-white mt-2 font-mono">
                                    {stats?.totalRefundedGames || 0}
                                </h3>
                            </div>
                            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 z-10">
                                <RefreshCw className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 to-slate-900/80 p-6 border border-slate-800/80 shadow-xl backdrop-blur-xl group hover:border-rose-500/50 transition-all duration-300">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-full blur-2xl group-hover:bg-rose-500/20 transition-all" />
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">סכום שזוכה</p>
                                <h3 className="text-2xl font-black text-rose-400 mt-2 font-mono">
                                    ₪{(stats?.totalRefundedAmount || 0).toLocaleString('he-IL', { minimumFractionDigits: 2 })}
                                </h3>
                            </div>
                            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 z-10">
                                <CornerUpLeft className="w-6 h-6" />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <motion.form
                    variants={itemVariants}
                    onSubmit={handleSearch}
                    className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl shadow-xl backdrop-blur-md grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-end"
                >
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Receipt className="w-3.5 h-3.5 text-indigo-400" /> מספר קבלה
                        </label>
                        <input
                            type="text"
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={searchInput.receiptId}
                            onChange={(e) => setSearchInput({ ...searchInput, receiptId: e.target.value })}
                            placeholder="מזהה קבלה..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-indigo-400" /> שם משתמש
                        </label>
                        <input
                            type="text"
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={searchInput.userName}
                            onChange={(e) => setSearchInput({ ...searchInput, userName: e.target.value })}
                            placeholder="שם משתמש..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Gamepad2 className="w-3.5 h-3.5 text-indigo-400" /> שם משחק
                        </label>
                        <input
                            type="text"
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={searchInput.gameName}
                            onChange={(e) => setSearchInput({ ...searchInput, gameName: e.target.value })}
                            placeholder="שם משחק..."
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> מתאריך
                        </label>
                        <input
                            type="date"
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={searchInput.fromDate}
                            onChange={(e) => setSearchInput({ ...searchInput, fromDate: e.target.value })}
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-indigo-400" /> עד תאריך
                        </label>
                        <input
                            type="date"
                            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                            value={searchInput.toDate}
                            onChange={(e) => setSearchInput({ ...searchInput, toDate: e.target.value })}
                            style={{ colorScheme: 'dark' }}
                        />
                    </div>

                    <div className="flex gap-2">
                        <button
                            type="submit"
                            className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-3 rounded-xl shadow-lg shadow-indigo-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-sm"
                        >
                            <Search className="w-4 h-4" /> סינון
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium py-2 px-3 rounded-xl border border-slate-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 text-sm"
                            title="אפס להיום"
                        >
                            <RotateCcw className="w-4 h-4" /> איפוס
                        </button>
                    </div>
                </motion.form>

                <motion.div variants={itemVariants} className="overflow-hidden bg-slate-900/80 border border-slate-800 rounded-2xl shadow-xl backdrop-blur-md">
                    <div className="overflow-x-auto">
                        <table className="w-full text-right border-collapse min-w-[800px]">
                            <thead>
                                <tr className="border-b border-slate-800 bg-slate-950/50 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                    <th className="p-4">מס' קבלה</th>
                                    <th className="p-4">תאריך וזמן</th>
                                    <th className="p-4">שם משתמש</th>
                                    <th className="p-4">שם משחק</th>
                                    <th className="p-4">מחיר</th>
                                    <th className="p-4">סטטוס</th>
                                    <th className="p-4 text-center">פעולות</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-800/60 text-sm whitespace-nowrap">
                                {purchasesList.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="py-16 text-center text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-3">
                                                <div className="p-4 bg-slate-800/50 rounded-full border border-slate-700/50">
                                                    <Inbox className="w-10 h-10 text-slate-400" />
                                                </div>
                                                <h4 className="text-lg font-bold text-slate-200">אין תוצאות כלל</h4>
                                                <p className="text-sm text-slate-400 max-w-sm">
                                                    לא נמצאו רכישות התואמות את הסינון או טווח התאריכים הנבחר.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    <AnimatePresence>
                                        {purchasesList.map((purchase) => (
                                            <motion.tr
                                                key={purchase.id}
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="hover:bg-slate-800/40 transition-colors duration-150 group"
                                            >
                                                <td className="p-4 font-mono text-xs text-indigo-300 font-medium">
                                                    <span className="bg-slate-950 px-2 py-1 rounded border border-slate-800">
                                                        {purchase.transactionId}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-slate-300">
                                                    {new Date(purchase.createdAt).toLocaleDateString('he-IL', {
                                                        year: 'numeric',
                                                        month: '2-digit',
                                                        day: '2-digit',
                                                        hour: '2-digit',
                                                        minute: '2-digit'
                                                    })}
                                                </td>
                                                <td className="p-4 font-medium text-slate-200">
                                                    {purchase.user?.name}
                                                </td>
                                                <td className="p-4 text-slate-300">
                                                    {purchase.game?.title}
                                                </td>
                                                <td className="p-4 font-bold text-slate-100 font-mono">
                                                    ₪{Number(purchase.pricePaid).toFixed(2)}
                                                </td>

                                                {/*תצוגת סטטוס*/}
                                                <td className="p-4">
                                                    <StatusBadge status={purchase.status} />
                                                </td>

                                                <td className="p-4 text-center">
                                                    {purchase.status === 'completed' ? (
                                                        <button
                                                            onClick={() => handleRefundClick(purchase.id)}
                                                            disabled={isRefunding}
                                                            className="text-xs font-medium text-fuchsia-400 hover:text-fuchsia-300 bg-fuchsia-500/10 hover:bg-fuchsia-500/20 border border-fuchsia-500/20 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1.5 mx-auto"
                                                        >
                                                            <RotateCcw className="w-3.5 h-3.5" />
                                                            זיכוי
                                                        </button>
                                                    ) : (
                                                        <span className="text-slate-500 text-xs">-</span>
                                                    )}
                                                </td>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                )}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div dir="ltr" className="p-4 border-t border-slate-800 bg-slate-900/50 flex flex-col items-center rounded-b-2xl">
                            <Pagination
                                totalPages={totalPages}
                                currentPage={page}
                                onPageChange={setPage}
                            />
                            <div className="text-center text-xs font-medium text-slate-500 mt-4 tracking-widest uppercase">
                                Showing {data?.pagination?.itemsPerPage || 0} of {data?.pagination?.totalItems || 0} items
                            </div>
                        </div>
                    )}
                </motion.div>
            </motion.div>
        </div>
    );
}
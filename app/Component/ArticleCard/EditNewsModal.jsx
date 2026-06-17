'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, X, Send, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { useNews } from '../../hooks/useNews';
import { getNewsCategories } from '../../hooks/useNews';

export default function EditNewsModal({ item }) {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    // הוספת fallback בטוח יותר למקרה ש-item מגיע ריק בהתחלה
    const [formData, setFormData] = useState({
        title: item?.title || '',
        excerpt: item?.excerpt || item?.content || '',
        category: item?.category || '',
        image: item?.image || '',
        isHot: !!item?.isHot
    });

    const { updateNews } = useNews();

    // טיפול ב-Mounting לטובת פורטל
    useEffect(() => {
        setMounted(true);
    }, []);

    // סנכרון הנתונים מחדש ברגע שהמודאל נפתח כדי להבטיח שהם מופיעים בטופס
    useEffect(() => {
        if (isOpen && item) {
            setFormData({
                title: item.title || '',
                excerpt: item.excerpt || item.content || '',
                category: item.category || 'Update',
                image: item.image || '',
                isHot: !!item.isHot
            });
        }
    }, [isOpen, item]);

    const handleUpdate = (e) => {
        e.preventDefault();
        e.stopPropagation(); // מונע מאירוע השליחה לזלוג החוצה

        const isUnchanged =
            item.title === formData.title &&
            (item.excerpt === formData.excerpt || item.content === formData.excerpt) &&
            (item.category || 'Update') === formData.category &&
            (item.image || '') === formData.image &&
            (!!item.isHot) === formData.isHot;

        if (isUnchanged) {
            setIsOpen(false);
            return;
        }

        updateNews.mutate(
            { id: item.id, data: formData },
            {
                onSuccess: () => {
                    setIsOpen(false);
                }
            }
        );
    };

    const modalContent = (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={(e) => {
                e.stopPropagation(); // עוצר זליגת לחיצות מהרקע
                setIsOpen(false); // סוגר את המודאל בלחיצה על הרקע הכהה
            }}
        >
            <div
                className="bg-[#0f141d] border border-white/10 w-full max-w-2xl rounded-[24px] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar animate-in zoom-in-95 duration-200 text-right"
                dir="rtl"
                onClick={(e) => e.stopPropagation()} // 🔥 הפתרון המרכזי: עוצר לחיצות בתוך הטופס מלהשפיע על העמוד שמאחוריו
            >
                <div className="sticky top-0 z-10 p-6 border-b border-white/5 flex justify-between items-center bg-[#0f141d]/90 backdrop-blur-md">
                    <h2 className="text-xl font-black text-white flex items-center gap-2">
                        <Edit3 className="text-cyan-400" size={24} />
                        עריכת ידיעה
                    </h2>
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(false);
                        }}
                        className="p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-all"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="p-6 space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        {/* Title */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">כותרת הכתבה *</label>
                            <input
                                required
                                className="w-full bg-[#090b10] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        {/* Category */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">קטגוריה *</label>
                            <select
                                required
                                className="w-full bg-[#090b10] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all appearance-none"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            >
                                {getNewsCategories().map((cat) => (
                                    <option key={cat.value} value={cat.value}>
                                        {cat.value}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Hot Status */}
                        <div className="space-y-2 flex flex-col justify-end">
                            <label className="flex items-center gap-3 p-3 border border-white/10 rounded-xl bg-[#090b10] cursor-pointer hover:bg-white/5 transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-5 h-5 accent-orange-500 cursor-pointer rounded"
                                    checked={formData.isHot}
                                    onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                                />
                                <span className="text-sm font-medium text-white flex items-center gap-1.5">
                                    <Sparkles size={16} className="text-orange-400" />
                                    סמן ככתבה חמה (Hot)
                                </span>
                            </label>
                        </div>

                        {/* Image URL */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-400 ml-1 flex items-center gap-1.5">
                                <ImageIcon size={14} /> קישור לתמונה (URL)
                            </label>
                            <input
                                type="url"
                                className="w-full bg-[#090b10] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all text-left"
                                dir="ltr"
                                value={formData.image}
                                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                            />
                        </div>

                        {/* Excerpt / Content */}
                        <div className="space-y-2 md:col-span-2">
                            <label className="text-sm font-medium text-slate-400 ml-1">תקציר / תוכן *</label>
                            <textarea
                                required
                                rows="4"
                                className="w-full bg-[#090b10] border border-white/10 rounded-xl py-3 px-4 text-white resize-none focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                                value={formData.excerpt}
                                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-white/10 mt-6">
                        <button
                            type="submit"
                            disabled={updateNews?.isPending}
                            className="w-full bg-cyan-500 hover:bg-cyan-400 text-[#090b10] font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)]"
                        >
                            {updateNews?.isPending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                            {updateNews?.isPending ? 'מעדכן נתונים...' : 'שמור שינויים'}
                        </button>
                    </div>
                </form>
            </div >
        </div >
    );

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation(); // חוסם לחיצה על האייטם עצמו בעת פתיחת החלון
                    setIsOpen(true);
                }}
                className="p-3 bg-white/5 rounded-xl text-slate-400 hover:text-cyan-400 transition-all hover:bg-white/10 flex-1 sm:flex-none flex justify-center items-center"
                title="ערוך ידיעה"
            >
                <Edit3 size={18} />
            </button>
            {isOpen && mounted && createPortal(modalContent, document.body)}
        </>
    );
}
"use client";
import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Edit3, X, Send, Loader2 } from 'lucide-react';
import { useNews } from '../../hooks/useNews';


export const EditNewsModal = ({ item }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [formData, setFormData] = useState({ title: item.title, content: item.content });

    const { updateNews } = useNews();

    useEffect(() => {
        setMounted(true);
        // כשפותחים את המודאל, מוודאים שהנתונים מעודכנים למה שיש ב-item
        if (isOpen) {
            setFormData({ title: item.title, content: item.content });
        }
    }, [isOpen, item]);

    const handleUpdate = (e) => {
        e.preventDefault();
        if ((item.content === formData.content && item.title === formData.title)) {
            return; // אין שינויים, לא צריך לעדכן
        }
        updateNews.mutate(
            { id: item.id, data: formData },
            {
                onSuccess: () => {
                    setIsOpen(false);
                    // ה-Hook מריץ invalidateQueries -> האבא מושך נתונים -> ה-useEffect של האבא מעדכן את המסך.
                }
            }
        );
    };

    const modalContent = (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm shadow-2xl">
            <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-right" dir="rtl">
                <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Edit3 size={20} className="text-yellow-500" /> עריכת ידיעה
                    </h2>
                    <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-1">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleUpdate} className="p-6 space-y-4">
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 block mr-1">כותרת</label>
                        <input
                            required
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:border-blue-500 outline-none transition-all"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="text-xs text-slate-500 block mr-1">תוכן</label>
                        <textarea
                            required
                            rows="5"
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white resize-none focus:border-blue-500 outline-none transition-all"
                            value={formData.content}
                            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={updateNews?.isPending} // חסימת הלחיצה כשהבקשה בדרך
                        className="w-full bg-yellow-600 hover:bg-yellow-500 text-black font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70"
                    >
                        {updateNews?.isPending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                        {updateNews.isPending ? 'מעדכן...' : 'שמור שינויים'}
                    </button>
                </form>
            </div>
        </div>
    );

    return (
        <>
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setIsOpen(true);
                }}
                className="p-3 bg-slate-800/50 rounded-xl text-slate-400 hover:text-yellow-500 transition-all hover:bg-slate-800"
            >
                <Edit3 size={20} />
            </button>
            {/* createPortal גורם לרכיב לצוף מעל הגוף כהודעה נפרדת */}
            {isOpen && mounted && createPortal(modalContent, document.body)}
        </>
    );
};
'use client';
import { toast } from 'sonner'
import React, { useState } from 'react';
import { Gamepad2, Globe, Image as ImageIcon, Type, FileText, CheckCircle2, PlusCircle, Activity, Calendar, DollarSign, Percent, Clock } from 'lucide-react';
import { useCategories } from "../../hooks/games/useCategories";
import Category from '../../Component/Category/Category.jsx';
import { gameService } from '../../../services/client/gameService.js';

export default function AddGamePage() {
    const { data: categories, isLoading, isError, error } = useCategories();

    // 1. הוספת כל השדות החסרים ל-State ההתחלתי
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        imageUrl: '',
        gameUrl: '',
        status: 'AVAILABLE', // ערך דיפולטיבי
        releaseDate: '',
        price: 0,
        discountPercentage: 0,
        discountUntil: '',
        selectedCategories: []
    });

    //מוסיף ומוריד בחירה מתוך מערך
    const toggleCategory = (id) => {
        setFormData(prev => ({
            ...prev, //שמור את שאר הנתונים
            selectedCategories: prev.selectedCategories.includes(id) //בדוק אם קיים כבר
                ? prev.selectedCategories.filter(item => item !== id) // הסר אותו
                : [...prev.selectedCategories, id] // הוסף אותו
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.selectedCategories.length === 0) {
            toast.error("Please select at least one category");
            return;
        }

        // 2. טיפול בתאריכים ריקים כדי לא לשלוח מחרוזת ריקה למסד הנתונים
        const payload = {
            ...formData,
            discountUntil: formData.discountUntil || null,
            releaseDate: formData.releaseDate || null
        };
        toast.success('Category toggled ' + JSON.stringify(formData)); // סגירת כל הטוסטים הפתוחים כדי למנוע הצפה

        try {
            await gameService.create(payload);

            toast.success('Game added successfully!');
            // איפוס מלא של כל השדות
            setFormData({
                title: '', description: '', imageUrl: '', gameUrl: '',
                status: 'AVAILABLE', releaseDate: '', price: 0,
                discountPercentage: 0, discountUntil: '', selectedCategories: []
            });
        } catch (err) {
            toast.error('Error adding game: ' + err.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#020617] text-slate-200 p-6 md:p-12">
            <div className="max-w-4xl mx-auto">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-4">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-purple-600 to-blue-600 p-4 rounded-2xl shadow-lg shadow-purple-500/20">
                            <Gamepad2 size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-4xl font-black bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent uppercase tracking-tighter">
                                Game Forge
                            </h1>
                            <p className="text-slate-500 text-sm font-medium tracking-wide">
                                READY TO DEPLOY NEW CONTENT
                            </p>
                        </div>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Primary Info */}
                    <div className="lg:col-span-7 space-y-8">
                        <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-400 mb-4">Core Details</h2>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium ml-1 text-slate-300">
                                    <Type size={18} /> Game Title
                                </label>
                                <input
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 transition-all outline-none text-lg"
                                    placeholder="Enter game name..."
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-medium ml-1 text-slate-300">
                                    <FileText size={18} /> Description
                                </label>
                                <textarea
                                    rows={6}
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-purple-500 transition-all outline-none resize-none"
                                    placeholder="Describe the gameplay, lore, and features..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                ></textarea>
                            </div>
                        </section>

                        {/* 3. אזור חדש: תמחור וזמינות */}
                        <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-emerald-400 mb-4">Pricing & Availability</h2>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium ml-1 text-slate-300">
                                        <Activity size={18} /> סטטוס
                                    </label>
                                    <select
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 transition-all outline-none text-slate-300"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="AVAILABLE">זמין לשחק</option>
                                        <option value="COMING SOON">בקרוב</option>
                                        <option value="BETA">גרסת בטא</option>
                                        <option value="OUT OF STOCK">לא זמין</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium ml-1 text-slate-300">
                                        <Calendar size={18} /> תאריך שחרור
                                    </label>
                                    <input
                                        type="date"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                        value={formData.releaseDate}
                                        onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium ml-1 text-slate-300">
                                        <DollarSign size={18} /> מחיר (₪)
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium ml-1 text-slate-300">
                                        <Percent size={18} /> אחוז הנחה
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                        value={formData.discountPercentage}
                                        onChange={(e) => setFormData({ ...formData, discountPercentage: parseInt(e.target.value) || 0 })}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium ml-1 text-slate-300">
                                        <Clock size={18} /> תוקף הנחה
                                    </label>
                                    <input
                                        type="datetime-local"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-emerald-500 transition-all outline-none"
                                        value={formData.discountUntil}
                                        onChange={(e) => setFormData({ ...formData, discountUntil: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>

                        <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-6">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-blue-400 mb-4">Assets & Links</h2>
                            <div className="grid grid-cols-1 gap-6">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium ml-1 text-slate-300">
                                        <ImageIcon size={18} /> Cover Image URL
                                    </label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-left"
                                        dir="ltr"
                                        placeholder="https://image-host.com/game-cover.jpg"
                                        value={formData.imageUrl}
                                        onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-medium ml-1 text-slate-300">
                                        <Globe size={18} /> Play/Launch URL
                                    </label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 transition-all outline-none text-left"
                                        dir="ltr"
                                        placeholder="https://play-link.com/game-start"
                                        value={formData.gameUrl}
                                        onChange={(e) => setFormData({ ...formData, gameUrl: e.target.value })}
                                    />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Right Column: Categories Selection */}
                    <div className="lg:col-span-5 space-y-8">
                        <section className="bg-slate-900/40 border border-slate-800 p-6 rounded-3xl h-full">
                            <h2 className="text-sm font-bold uppercase tracking-widest text-cyan-400 mb-6">Genre Tags</h2>

                            <Category
                                categories={categories}
                                selectedCategories={formData.selectedCategories}
                                onToggle={toggleCategory}
                                isLoading={isLoading}
                                isError={isError}
                                error={error}
                                containerClassName="flex flex-wrap gap-3"
                                buttonClassName=" px-3 py-1.5 text-xs rounded-full inline-flex items-center gap-2 whitespace-nowrap "
                                activeClassName="bg-cyan-500/20 border-cyan-500 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                inactiveClassName="bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-600"
                                Icon={CheckCircle2}
                            />

                            <div className="mt-12 p-6 rounded-2xl bg-gradient-to-b from-purple-600/10 to-transparent border border-purple-500/20">
                                <p className="text-xs text-slate-400 mb-6 text-center italic">
                                    Make sure all information is correct before pushing to production.
                                </p>
                                <button
                                    type="submit"
                                    className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-400 text-white font-black py-5 rounded-2xl shadow-xl shadow-purple-900/20 transition-all transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-3 text-lg"
                                >
                                    <PlusCircle size={24} /> PUBLISH GAME
                                </button>
                            </div>
                        </section>
                    </div>
                </form>
            </div>
        </div>
    );
}




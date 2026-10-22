import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Edit2, Tag, Save, Image as ImageIcon, Link2, DollarSign, Percent, Calendar, Activity, Clock } from 'lucide-react';
import Category from '../../Category/Category';
import { useCategories } from '../../../hooks/games/useCategories';
import { useGameActions } from '../../../hooks/games/useGame';


// פונקציית עזר להמרת תאריכים מפורמט DB לפורמט שמתאים לשדות קלט מסוג Date/DateTime
const formatDateForInput = (dateString, includeTime = false) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    // החזרת פורמט YYYY-MM-DDTHH:mm עבור datetime-local או YYYY-MM-DD עבור date
    return includeTime ? date.toISOString().slice(0, 16) : date.toISOString().split('T')[0];
};

export default function EditingGame({ game }) {
    const { updateGame } = useGameActions();
    const { data: categories, isLoading: isLoadingCat, isError: isErrorCat, error: errorCat } = useCategories();
    const [editingGame, setEditingGame] = useState(null);

    // אתחול נתוני המשחק לתוך ה-State בעת פתיחת חלון העריכה
    const handleEditClick = (game) => {
        setEditingGame({
            ...game,
            selectedCategoryIds: game?.categoryIds || [], // שמירת ה-IDs של הקטגוריות שנבחרו ב-State נפרד
            // המרת תאריכים לפורמט תקין עבור ה-Inputs
            releaseDate: formatDateForInput(game.releaseDate, false),
            discountUntil: formatDateForInput(game.discountUntil, true)
        });

    };


    const toggleCategory = (id) => {
        setEditingGame(prev => ({
            ...prev, //שמור את שאר הנתונים
            selectedCategoryIds: prev.selectedCategoryIds.includes(id) //בדוק אם קיים כבר
                ? prev.selectedCategoryIds.filter(item => item !== id) // הסר אותו
                : [...prev.selectedCategoryIds, id] // הוסף אותו
        }));
    };

    // שליחת הנתונים המעודכנים לשרת וטיפול בתגובה
    const Update = async () => {
        // הכנת האובייקט לשליחה (טיפול בערכי Null אם השדות ריקים)
        const payload = {
            ...editingGame,
            discountUntil: editingGame.discountUntil || null,
            releaseDate: editingGame.releaseDate || null
        };
        updateGame(payload, {
            onSuccess: () => {
                setEditingGame(null); // סוגר את המודל רק אם זה הצליח
            }
        });
    };

    // רכיב פנימי לייצור שדות קלט אחידים מבחינה עיצובית
    const InputField = ({ label, icon: Icon, type = "text", ...props }) => (
        <div className="space-y-2">
            <label className="text-xs font-bold text-blue-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                <Icon size={14} /> {label}
            </label>
            <input
                type={type}
                className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm font-medium text-slate-200 placeholder:text-slate-700"
                {...props}
            />
        </div>
    );

    // בניית תוכן המודל משתנה נפרד לשמירה על עץ קומפוננטות נקי
    const modalContent = editingGame ? (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-slate-900 border border-slate-700/50 w-full max-w-6xl rounded-3xl shadow-[0_0_80px_-15px_rgba(56,189,248,0.15)] overflow-hidden flex flex-col max-h-[95vh] relative">

                {/* אפקט תאורה עליון לעיצוב מרשים */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50 blur-sm"></div>

                {/* כותרת המודל */}
                <div className="bg-slate-950/50 p-6 border-b border-slate-800/80 flex justify-between items-center shrink-0">
                    <h2 className="text-2xl font-black flex items-center gap-4 tracking-wide">
                        <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]">
                            <Edit2 size={22} />
                        </div>
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-slate-400">עריכת נתונים:</span>
                        <span className="text-white drop-shadow-md">{editingGame.title}</span>
                    </h2>
                    <button onClick={() => setEditingGame(null)} className="p-2.5 bg-slate-800/50 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-full transition-all hover:scale-105 hover:rotate-90">
                        <X size={20} />
                    </button>
                </div>

                {/* גוף המודל - אזור נגלל */}
                <div className="p-8 overflow-y-auto custom-scrollbar flex-1 space-y-8">

                    {/* גריד מרכזי: חלוקה למידע כללי, תמחור ומדיה */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* עמודה 1: מדיה וקישורים */}
                        <div className="space-y-6 bg-slate-950/30 p-6 rounded-2xl border border-slate-800/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                                <ImageIcon size={18} className="text-cyan-400" /> מדיה ונתיבים
                            </h3>

                            <div className="aspect-video w-full bg-slate-950 rounded-xl border border-slate-700/50 overflow-hidden relative group shadow-inner">
                                <img
                                    src={editingGame.imageUrl}
                                    alt="Preview"
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    onError={(e) => e.target.src = 'https://via.placeholder.com/400x225?text=No+Image'}
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                    <span className="text-xs text-slate-300 font-medium">תצוגה מקדימה</span>
                                </div>
                            </div>

                            <InputField
                                label="נתיב תמונה (Image URL)"
                                icon={ImageIcon}
                                value={editingGame.imageUrl || ''}
                                onChange={(e) => setEditingGame({ ...editingGame, imageUrl: e.target.value })}
                                dir="ltr"
                            />

                            <InputField
                                label="נתיב הפעלה (Game URL)"
                                icon={Link2}
                                value={editingGame.gameUrl || ''}
                                onChange={(e) => setEditingGame({ ...editingGame, gameUrl: e.target.value })}
                                dir="ltr"
                            />
                        </div>

                        {/* עמודה 2: מידע כללי */}
                        <div className="space-y-6 bg-slate-950/30 p-6 rounded-2xl border border-slate-800/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                                <Activity size={18} className="text-purple-400" /> פרטים כלליים
                            </h3>

                            <InputField
                                label="שם המשחק"
                                icon={Edit2}
                                value={editingGame.title || ''}
                                onChange={(e) => setEditingGame({ ...editingGame, title: e.target.value })}
                            />

                            <div className="space-y-2">
                                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                                    <Edit2 size={14} /> תיאור
                                </label>
                                <textarea
                                    rows={5}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-4 outline-none resize-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-slate-300 text-sm leading-relaxed"
                                    value={editingGame.description || ''}
                                    onChange={(e) => setEditingGame({ ...editingGame, description: e.target.value })}
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-blue-400 uppercase tracking-wider ml-1 flex items-center gap-2">
                                        <Activity size={14} /> סטטוס
                                    </label>
                                    <select
                                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl p-3 outline-none focus:border-blue-500 transition-all text-sm font-medium text-slate-200"
                                        value={editingGame.status || 'AVAILABLE'}
                                        onChange={(e) => setEditingGame({ ...editingGame, status: e.target.value })}
                                    >
                                        <option value="AVAILABLE">זמין לשחק</option>
                                        <option value="COMING SOON">בקרוב</option>
                                        <option value="BETA">גרסת בטא</option>
                                        <option value="OUT OF STOCK">לא זמין</option>
                                    </select>
                                </div>

                                <InputField
                                    label="תאריך שחרור"
                                    icon={Calendar}
                                    type="date"
                                    value={editingGame.releaseDate || ''}
                                    onChange={(e) => setEditingGame({ ...editingGame, releaseDate: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* עמודה 3: תמחור ומבצעים */}
                        <div className="space-y-6 bg-slate-950/30 p-6 rounded-2xl border border-slate-800/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
                                <DollarSign size={18} className="text-emerald-400" /> תמחור והנחות
                            </h3>

                            <InputField
                                label="מחיר בסיס (₪)"
                                icon={DollarSign}
                                type="number"
                                step="0.01"
                                min="0"
                                value={editingGame.price || ''}
                                onChange={(e) => setEditingGame({ ...editingGame, price: parseFloat(e.target.value) || 0 })}
                            />

                            <div className="relative p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 overflow-hidden">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-bl-full blur-2xl"></div>
                                <div className="space-y-4 relative z-10">
                                    <InputField
                                        label="אחוז הנחה (%)"
                                        icon={Percent}
                                        type="number"
                                        min="0"
                                        max="100"
                                        value={editingGame.discountPercentage || ''}
                                        onChange={(e) => setEditingGame({ ...editingGame, discountPercentage: parseInt(e.target.value) || 0 })}
                                    />

                                    <InputField
                                        label="הנחה בתוקף עד"
                                        icon={Clock}
                                        type="datetime-local"
                                        value={editingGame.discountUntil || ''}
                                        onChange={(e) => setEditingGame({ ...editingGame, discountUntil: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>

                    </div>

                    {/* אזור הקטגוריות - פריסה לכל רוחב המודל */}
                    <div className="bg-slate-950/30 p-6 rounded-2xl border border-slate-800/50">
                        <label className="flex items-center gap-2 text-sm font-bold text-indigo-400 uppercase tracking-wider mb-6 border-b border-slate-800 pb-3">
                            <Tag size={18} /> תיוג קטגוריות
                        </label>
                        <Category
                            categories={categories}
                            selectedCategories={editingGame.selectedCategoryIds}
                            onToggle={toggleCategory}
                            isLoading={isLoadingCat}
                            isError={isErrorCat}
                            error={errorCat}
                            keys={'id'}
                            containerClassName="flex flex-row flex-wrap gap-3 items-center"
                            buttonClassName="gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 border inline-flex items-center justify-center cursor-pointer shadow-sm hover:shadow-md"
                            activeClassName="bg-indigo-600/90 border-indigo-500 text-white shadow-[0_0_20px_rgba(79,70,229,0.4)] scale-[1.02]"
                            inactiveClassName="bg-slate-900 border-slate-700 text-slate-400 hover:border-slate-500 hover:text-slate-200 hover:bg-slate-800"
                            Icon={Tag}
                        />
                    </div>
                </div>

                {/* אזור פעולות עליון / תחתון (Footer) */}
                <div className="p-6 bg-slate-950/80 border-t border-slate-800 flex gap-4 shrink-0 backdrop-blur-md">
                    <button
                        onClick={Update}
                        className="flex-1 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-black text-lg py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all active:scale-[0.98] flex items-center justify-center gap-3 tracking-wide"
                    >
                        <Save size={22} /> שמור שינויים במערכת
                    </button>
                    <button
                        onClick={() => setEditingGame(null)}
                        className="px-10 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-white font-medium rounded-xl transition-all flex items-center justify-center"
                    >
                        ביטול
                    </button>
                </div>
            </div>
        </div>
    ) : null;

    // רינדור הכפתור המקדים ופורטל המודל
    return (
        <>
            <button
                onClick={() => handleEditClick(game)}
                className="p-2.5 bg-slate-800/80 backdrop-blur-md hover:bg-cyan-600/20 text-cyan-400 hover:text-cyan-300 rounded-xl transition-all shadow-lg border border-cyan-500/20 hover:border-cyan-500/50 group"
                title="ערוך משחק"
            >
                <Edit2 size={18} className="group-hover:scale-110 transition-transform" />
            </button>

            {editingGame && createPortal(modalContent, document.body)}
        </>
    );
}
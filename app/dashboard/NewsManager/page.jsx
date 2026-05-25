"use client";
import React, { useState } from 'react';
import { Search, Plus, Trash2, Newspaper, Send, X, Loader2, Calendar } from 'lucide-react';
import { useNews } from '../../hooks/useNews'; // Hook מעודכן עם useInfiniteQuery
import { EditNewsModal } from './EditNewsModal';
import FormatDate from '../../Component/FormatDate/FormatDate';

export default function NewsManager() {
  // --- 1. ניהול State של ה-UI בלבד ---
  // שמ לב: מחקנו את ה-page ואת ה-localNews. React Query מנהל את הנתונים!
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ title: '', content: '' });

  // --- 2. צריכת הנתונים מה-Hook ---
  // אנחנו מקבלים את כל מה שאנחנו צריכים ישרות מה-Hook (כולל פונקציות הגלילה)
  const {
    allNews, // מערך שטוח ומסונן של כל הידיעות (במקום filteredNews)
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    addNews,
    deleteNews
  } = useNews(5, searchTerm);

  // --- 3. Handlers ---

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.content) return;

    addNews.mutate(formData, {
      onSuccess: () => {
        // אין יותר צורך ב-setLocalNews! 
        // ה-Hook מבצע Invalidate וטוען את המידע החדש אוטומטית למטמון.
        setIsModalOpen(false);
        setFormData({ title: '', content: '' });
      }
    });
  };

  const handleDeleteClick = (id) => {
    if (confirm('האם למחוק את הידיעה לצמיתות?')) {
      // גם כאן, אין צורך בניהול רשימה ידנית. ה-Hook יעלים את הידיעה.
      deleteNews.mutate(id);
    }
  };

  // --- 4. Render ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans" dir="rtl">
      {/* CSS עבור אנימציית הרעידה */}
      <style>{`
        @keyframes shake {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-15deg); }
          75% { transform: rotate(15deg); }
        }
        .shake-on-hover:hover .trash-icon {
          animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
          color: #ef4444; 
        }
      `}</style>

      <div className="max-w-5xl mx-auto space-y-8">

        {/* --- Header Area --- */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 backdrop-blur-sm shadow-xl">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <span className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-900/20">
                <Newspaper size={24} className="text-white" />
              </span>
              עדכונים וחדשות
            </h1>
            <p className="text-slate-400 mt-2 text-sm">ניהול התוכן המוצג באתר ({allNews?.length || 0} ידיעות מוצגות)</p>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative group w-full md:w-64">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
              <input
                type="text"
                placeholder="חיפוש חופשי..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pr-10 pl-4 outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all shadow-inner"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 py-3 rounded-xl flex items-center gap-2 font-bold shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.02] active:scale-95 whitespace-nowrap"
            >
              <Plus size={20} /> <span className="hidden sm:inline">הוסף חדש</span>
            </button>
          </div>
        </div>

        {/* --- Content List --- */}
        <div className="space-y-4">
          {allNews?.length === 0 && !isLoading ? (
            <div className="text-center py-20 bg-slate-900/30 rounded-3xl border border-slate-800 border-dashed">
              <div className="inline-block p-4 bg-slate-800/50 rounded-full mb-4">
                <Search size={32} className="text-slate-600" />
              </div>
              <p className="text-slate-500 text-lg">לא נמצאו ידיעות תואמות</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {allNews?.map((item, index) => (
                <div
                  key={item.id || index}
                  className="group relative bg-slate-900 border border-slate-800 hover:border-slate-700 p-5 rounded-2xl transition-all hover:shadow-xl hover:shadow-black/20 hover:-translate-y-1 shake-on-hover"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-2 flex-1">
                      <FormatDate releaseDate={item.createdAt} />
                      <h3 className="text-xl font-bold text-white leading-tight group-hover:text-blue-400 transition-colors">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 text-sm leading-relaxed max-w-3xl">
                        {item.content}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <EditNewsModal item={item} />
                      <button
                        onClick={() => handleDeleteClick(item.id)}
                        disabled={deleteNews.isPending}
                        className="p-3 bg-slate-800/50 rounded-xl text-slate-400 transition-colors hover:bg-slate-800 focus:outline-none"
                        title="מחק ידיעה"
                      >
                        {deleteNews.isPending && deleteNews.variables === item.id ? (
                          <Loader2 size={20} className="animate-spin text-blue-500" />
                        ) : (
                          <Trash2 size={20} className="trash-icon transition-transform" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* --- Load More Button (מתואם ל-Infinite Query) --- */}
        <div className="flex justify-center pb-10">
          {isLoading ? (
            <div className="flex items-center gap-2 text-slate-400">
              <Loader2 size={18} className="animate-spin" /> טוען ידיעות...
            </div>
          ) : hasNextPage ? (
            <button
              onClick={() => fetchNextPage()}
              disabled={isFetchingNextPage}
              className="group flex items-center gap-2 px-8 py-3 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isFetchingNextPage ? (
                <> <Loader2 size={18} className="animate-spin" /> מעדכן... </>
              ) : (
                <> הראה לי עוד <span className="group-hover:translate-y-0.5 transition-transform">↓</span> </>
              )}
            </button>
          ) : allNews?.length > 0 ? (
            <div className="text-slate-500 text-sm">אין עוד עדכונים ישנים להצגה</div>
          ) : null}
        </div>
      </div>

      {/* --- Modal Form --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 rounded-t-3xl">
              <h2 className="text-xl font-bold text-white">פרסום עדכון חדש</h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 mr-1">כותרת</label>
                <input
                  required
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  placeholder="לדוגמה: עדכון גרסה 2.0..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 mr-1">תוכן ההודעה</label>
                <textarea
                  required
                  rows="4"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl py-3 px-4 text-white resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all"
                  placeholder="מה חדש במערכת?"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={addNews.isPending}
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-blue-900/40 hover:shadow-blue-900/60"
                >
                  {addNews.isPending ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                  {addNews.isPending ? "מפרסם..." : "פרסם עכשיו"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
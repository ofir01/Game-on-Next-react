'use client';

import React, { useState } from 'react';
import {
  Newspaper,
  Send,
  Loader2,
  Sparkles,
  Image as ImageIcon,
  Info,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { useNews } from '../../hooks/News/useNews';
import {getNewsCategories} from '../../hooks/News/useNews'

export default function CreateNews() {
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    category: 'Update',
    image: '',
    isHot: false
  });

  const [showSuccess, setShowSuccess] = useState(false);

  //    פונקציית ההוספה מההוק
  const { addNews } = useNews();

  const handleAddSubmit = (e) => {
    e.preventDefault();
    if (!formData.title || !formData.excerpt) return;

    addNews.mutate(formData, {
      onSuccess: () => {
        // הצגת אנימציית הצלחה
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);

        // איפוס הטופס
        setFormData({
          title: '',
          excerpt: '',
          category: 'Update',
          image: '',
          isHot: false
        });
      }
    });
  };

  return (
    <div className="min-h-screen bg-[#090b10] text-slate-200 p-4 md:p-8 font-sans relative overflow-hidden" dir="rtl">

      {/* רקע דקורטיבי - Glow Effects */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-lime-500/10 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>

      <div className="max-w-7xl mx-auto space-y-8">

        {/* כותרת העמוד */}
        <div className="flex flex-col gap-2 mb-10">
          <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-300 flex items-center gap-4">
            <span className="p-3 bg-white/5 border border-white/10 rounded-2xl shadow-xl backdrop-blur-md">
              <Newspaper size={32} className="text-lime-400" />
            </span>
            יצירת ידיעה חדשה
          </h1>
          <p className="text-slate-400 text-lg md:text-xl font-medium max-w-2xl">
            הזן את פרטי הכתבה בטופס וראה כיצד היא תיראה בזמן אמת בתצוגה המקדימה.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* עמודה ימנית: הטופס (תופס 7 עמודות) */}
          <div className="lg:col-span-7 bg-[#0f141d]/80 border border-white/10 rounded-[32px] p-6 md:p-8 shadow-2xl backdrop-blur-xl relative">

            {showSuccess && (
              <div className="absolute inset-0 z-20 bg-[#0f141d]/95 rounded-[32px] flex flex-col items-center justify-center animate-in fade-in duration-300">
                <CheckCircle2 size={80} className="text-lime-400 mb-4 animate-bounce" />
                <h2 className="text-3xl font-bold text-white">הידיעה פורסמה!</h2>
                <p className="text-slate-400 mt-2">התוכן עלה בהצלחה למערכת.</p>
              </div>
            )}

            <form onSubmit={handleAddSubmit} className="space-y-6">

              <div className="space-y-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-4">
                  <Info size={18} className="text-lime-400" />
                  <h3 className="text-lg font-bold text-white">פרטים כלליים</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* כותרת */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">כותרת הכתבה <span className="text-red-400">*</span></label>
                    <input
                      required
                      className="w-full bg-[#090b10] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 outline-none transition-all shadow-inner text-lg"
                      placeholder="הזן כותרת מושכת..."
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>

                  {/* קטגוריה */}
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-300 ml-1">קטגוריה <span className="text-red-400">*</span></label>
                    <div className="relative">
                      <select
                        required
                        className="w-full bg-[#090b10] border border-white/10 rounded-xl py-3 px-4 text-white focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 outline-none transition-all appearance-none cursor-pointer"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {getNewsCategories().map((cat) => (
                          <option key={cat.value} value={cat.value}>
                            {cat.value}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                        ▼
                      </div>
                    </div>
                  </div>

                  {/* כתבה חמה */}
                  <div className="space-y-2 flex flex-col justify-end">
                    <label className="flex items-center gap-3 p-3 border border-white/10 rounded-xl bg-[#090b10] cursor-pointer hover:bg-white/5 hover:border-orange-500/30 transition-all group h-[50px]">
                      <div className="relative flex items-center justify-center">
                        <input
                          type="checkbox"
                          className="peer sr-only"
                          checked={formData.isHot}
                          onChange={(e) => setFormData({ ...formData, isHot: e.target.checked })}
                        />
                        <div className="w-6 h-6 rounded border-2 border-slate-600 peer-checked:border-orange-500 peer-checked:bg-orange-500 transition-all"></div>
                        <CheckCircle2 size={16} className="absolute text-[#090b10] opacity-0 peer-checked:opacity-100 transition-opacity" />
                      </div>
                      <span className="text-sm font-bold text-white flex items-center gap-2 group-hover:text-orange-100 transition-colors">
                        <Sparkles size={16} className={formData.isHot ? "text-orange-400" : "text-slate-500"} />
                        סמן ככתבה חמה (Hot)
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="space-y-6 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-2 border-b border-white/10 pb-4">
                  <ImageIcon size={18} className="text-lime-400" />
                  <h3 className="text-lg font-bold text-white">מדיה וקישורים</h3>
                </div>

                {/* קישור לתמונה */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-300 ml-1 flex items-center gap-1.5">
                    קישור לתמונה (URL)
                  </label>
                  <div className="relative group">
                    <ImageIcon size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-lime-400 transition-colors" />
                    <input
                      type="url"
                      className="w-full bg-[#090b10] border border-white/10 rounded-xl py-3 pr-12 pl-4 text-white focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 outline-none transition-all text-left"
                      placeholder="https://example.com/image.jpg"
                      dir="ltr"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* תקציר */}
              <div className="space-y-2 bg-white/[0.02] border border-white/5 rounded-2xl p-6">
                <label className="text-sm font-semibold text-slate-300 ml-1 flex items-center gap-2 mb-2 border-b border-white/10 pb-4">
                  <Newspaper size={18} className="text-lime-400" />
                  <span className="text-lg font-bold text-white">תקציר / תוכן <span className="text-red-400">*</span></span>
                </label>
                <textarea
                  required
                  rows="4"
                  className="w-full bg-[#090b10] border border-white/10 rounded-xl py-4 px-4 text-white resize-none focus:ring-2 focus:ring-lime-500/50 focus:border-lime-500/50 outline-none transition-all shadow-inner mt-4"
                  placeholder="הזן את תקציר הכתבה שיוצג בכרטיסייה..."
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                />
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={addNews?.isPending}
                  className="w-full bg-gradient-to-r from-lime-400 to-lime-500 hover:from-lime-300 hover:to-lime-400 text-[#090b10] text-lg font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all disabled:opacity-70 shadow-[0_0_30px_rgba(163,230,53,0.3)] hover:shadow-[0_0_40px_rgba(163,230,53,0.5)] hover:scale-[1.01] active:scale-[0.99]"
                >
                  {addNews?.isPending ? (
                    <Loader2 size={24} className="animate-spin" />
                  ) : (
                    <Send size={24} />
                  )}
                  {addNews?.isPending ? "מעלה נתונים לשרת..." : "פרסם ידיעה עכשיו"}
                </button>
              </div>
            </form>
          </div>

          {/* עמודה שמאלית: תצוגה מקדימה (תופס 5 עמודות) */}
          <div className="lg:col-span-5 sticky top-8">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Eye size={20} className="text-lime-400" />
              <h2 className="text-xl font-bold text-white">תצוגה מקדימה חיה</h2>
            </div>

            {/* כרטיסיית התצוגה המקדימה - מדמה את העיצוב מהמסך הראשי */}
            <div className="bg-[#0f141d] border border-white/10 p-5 rounded-[24px] shadow-2xl transition-all flex flex-col gap-5 overflow-hidden group">

              {/* Thumbnail Image */}
              <div className="relative w-full h-56 rounded-2xl overflow-hidden shrink-0 bg-[#090b10] border border-white/5">
                {formData.image ? (
                  <img
                    src={formData.image}
                    alt="Preview"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}

                {/* Fallback איקון אם אין תמונה או שהקישור שבור */}
                <div className={`w-full h-full flex items-center justify-center bg-white/5 ${formData.image ? 'hidden' : 'flex'}`}>
                  <ImageIcon className="text-slate-600 opacity-50 h-16 w-16" />
                </div>

                {formData.isHot && (
                  <div className="absolute top-3 right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 animate-pulse">
                    <Sparkles size={14} />
                    <span className="text-xs font-bold">HOT</span>
                  </div>
                )}
              </div>

              {/* Content Preview */}
              <div className="flex-1 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                  <span className="bg-lime-400/10 text-lime-400 border border-lime-400/20 px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                    {formData.category || 'Category'}
                  </span>
                  <div className="text-slate-500 text-xs font-medium bg-white/5 px-3 py-1 rounded-full">
                    ממש עכשיו
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white leading-tight mb-3 break-words">
                  {formData.title || <span className="text-slate-600">כותרת הכתבה תופיע כאן...</span>}
                </h3>

                <p className="text-slate-400 text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {formData.excerpt || <span className="text-slate-600">תקציר הכתבה יוצג כאן ברגע שתתחיל להקליד...</span>}
                </p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex gap-3 text-blue-200 text-sm">
              <Info size={20} className="text-blue-400 shrink-0" />
              <p>
                התצוגה המקדימה ממחישה כיצד הכרטיסייה תופיע באתר לגולשים. ודא שהתמונה נטענת כראוי ושהטקסט קריא.
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
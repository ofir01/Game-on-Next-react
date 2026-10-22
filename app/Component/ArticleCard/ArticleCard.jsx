import { motion } from 'framer-motion';
import { Gamepad2, Flame } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useNews } from '../../hooks/News/useNews'; 
import EditNewsModal from './EditNewsModal';
import FormatDate from '../../Component/FormatDate/FormatDate';

export default function ArticleCard({ article, onClick }) {
    const { isAdmin } = useAuth();
    const { deleteNews } = useNews(); // שליפת פונקציית המחיקה מה-Hook

    const handleDeleteClick = (id) => {
        if (confirm('האם למחוק את הידיעה לצמיתות?')) {
            deleteNews.mutate(id);
        }
    };




    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3 }}
            onClick={onClick}
            className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl border border-white/5 bg-[#0f141d]/40 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-white/10 hover:bg-[#0f141d]/80 hover:shadow-xl"
        >
            {/* תמונת הכתבה */}
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-950">
                {article.image ? (
                    <img
                        src={article.image}
                        alt={article.title}
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full items-center justify-center bg-zinc-900">
                        <Gamepad2 size={40} className="text-white/5" />
                    </div>
                )}

                {article.isHot && (
                    <span className="absolute right-3 top-3 flex items-center gap-1 rounded-full bg-orange-500/90 px-2.5 py-1 text-[10px] font-black text-white shadow-lg backdrop-blur-md">
                        <Flame size={12} className="animate-pulse" />
                        Hot
                    </span>
                )}
            </div>

            {/* תוכן הכרטיסייה */}
            <div className="flex flex-grow flex-col p-5">
                {/* קטגוריה ותאריך */}
                <div className="mb-3 flex items-center justify-between text-[11px] font-medium text-zinc-500">
                    <span className="rounded-md border border-lime-400/10 bg-lime-400/5 px-2 py-0.5 font-bold text-lime-400">
                        {article.category}
                    </span>
                    <div className="flex items-center gap-1">
                        <FormatDate releaseDate={article?.createdAt} />
                    </div>
                </div>

                {/* כותרת */}
                <h2 className="mb-2 line-clamp-2 text-base font-black leading-snug text-white transition-colors group-hover:text-lime-400">
                    {article.title}
                </h2>

                {/* תמצית הטקסט */}
                <p className="mb-4 line-clamp-2 text-xs leading-relaxed text-zinc-400">
                    {article.excerpt}
                </p>

                {/* תגיות */}
                <div className="mt-auto flex flex-wrap gap-1.5 border-t border-white/[0.03] pt-3">
                    {article?.tags?.slice(0, 2).map((t) => (
                        <span key={t} className="rounded bg-white/5 px-2 py-0.5 text-[10px] text-zinc-500">
                            #{t}
                        </span>
                    ))}
                </div>

                {/* כפתורי ניהול לאדמין בלבד בסוף ה-ArticleCard */}
                {isAdmin && (
                    <div className="mt-4 flex gap-2 border-t border-white/10 pt-3">
                        <EditNewsModal item={article} />
                        <button
                            onClick={(e) => {
                                e.stopPropagation(); // מונע מעבר לכתבה בלחיצה על עריכה
                                handleDeleteClick(article.id);
                            }}
                            className="flex-1 rounded bg-red-500/10 py-1.5 text-xs font-bold text-red-400 hover:bg-red-500/20 transition-colors"
                        >
                            מחק כתבה
                        </button>
                        {/* כדי לערוך מכאן, מומלץ להפנות את האדמין לעמוד הניהול במקום להעמיס מודאלים בעמוד הציבורי */}
                    </div>
                )}
            </div>
        </motion.div>
    );
}
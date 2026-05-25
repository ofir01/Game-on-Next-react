export default function Line({ news }) {
    if (!news || news.length === 0) return null;

    return (
        <div className="overflow-hidden bg-[#020617] py-3 border-y border-purple-500/20 w-full shadow-inner">
            {/* תגית LIVE קטנה משמאל שנתקעת במקום */}
            <div className="bg-purple-600 text-[10px] font-bold px-2 py-0.5 ml-4 rounded flex items-center gap-1 z-10 shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                <span className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
                NEWS
            </div>
            <div className="flex whitespace-nowrap animate-marquee hover-pause gap-12">
                {/* לופ ראשון של הודעות */}
                {news?.map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
                        <span className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                            {item.title}:
                        </span>
                        <span className="text-sm text-slate-400">
                            {item.content}
                        </span>
                    </div>
                ))}

                {/* לופ שני - חשוב מאוד! כדי שהתנועה תהיה חלקה ללא קפיצות בסוף */}
                {news?.map((item) => (
                    <div key={`dup-${item.id}`} className="flex items-center gap-3">
                        <span className="w-2 h-2 bg-purple-500 rounded-full shadow-[0_0_8px_#a855f7]" />
                        <span className="text-sm font-bold text-slate-100 uppercase tracking-wide">
                            {item.title}:
                        </span>
                        <span className="text-sm text-slate-400">
                            {item.content}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
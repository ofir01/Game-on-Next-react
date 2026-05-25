import React from 'react';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

export default function Pagination({ totalPages, currentPage, onPageChange }) {
    if (totalPages <= 1) return null;

    // לוגיקה ליצירת רשימת העמודים להצגה
    const getPageNumbers = () => {
        const pages = [];
        const showMax = 2; // כמה עמודים להראות מכל צד של העמוד הנוכחי

        for (let i = 1; i <= totalPages; i++) {
            // תמיד נראה את הראשון, האחרון, הנוכחי והשכנים שלו
            if (
                i === 1 || 
                i === totalPages || 
                (i >= currentPage - showMax && i <= currentPage + showMax)
            ) {
                pages.push(i);
            } else if (
                i === currentPage - showMax - 1 || 
                i === currentPage + showMax + 1
            ) {
                // מוסיף "..." רק אם יש פער
                pages.push('...');
            }
        }
        // ניקוי כפילויות של "..."
        return pages.filter((item, index) => pages.indexOf(item) === index);
    };

    return (
        <div className="flex flex-wrap justify-center items-center gap-2 mt-10 mb-6">
            {/* כפתור אחורה */}
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 bg-[#1c2128] border border-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-20 transition-all"
            >
                <ChevronLeft size={18} />
            </button>

            {/* רשימת מספרים חכמה */}
            <div className="flex items-center gap-1.5">
                {getPageNumbers().map((page, index) => (
                    <React.Fragment key={index}>
                        {page === '...' ? (
                            <span className="px-2 text-gray-600">
                                <MoreHorizontal size={16} />
                            </span>
                        ) : (
                            <button
                                onClick={() => onPageChange(page)}
                                className={`min-w-[40px] h-10 rounded-lg font-bold text-sm transition-all border ${
                                    currentPage === page
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.4)]'
                                        : 'bg-[#1c2128] border-gray-800 text-gray-400 hover:border-gray-600 hover:text-gray-200'
                                }`}
                            >
                                {page}
                            </button>
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* כפתור קדימה */}
            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 bg-[#1c2128] border border-gray-800 rounded-lg text-gray-400 hover:text-white disabled:opacity-20 transition-all"
            >
                <ChevronRight size={18} />
            </button>
        </div>
    );
}
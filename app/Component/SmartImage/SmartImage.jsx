import { useState } from "react";

function Skeleton({ className = "" }) {
    return (
        <div className={`animate-pulse bg-gray-700/50 rounded-md relative overflow-hidden before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent ${className}`} />
    );
}

// קומפוננטה פנימית להצגת "תמונה חסרה" מעוצבת
const EmptyPlaceholder = () => (
    <div className="flex flex-col items-center justify-center w-full h-full bg-[#1b2838] border border-white/5">
        <svg 
            className="w-8 h-8 text-slate-500 opacity-40 mb-1" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
        >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v12a1 1 0 01-1 1H5a1 1 0 01-1-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13H9m3 3V10" />
        </svg>
        <span className="text-[10px] text-slate-500/60 font-bold uppercase tracking-widest">No Media</span>
    </div>
);

export default function SmartImage({ url, alt, containerClassName = "", imageClassName = "" }) {
    const [isLoaded, setIsLoaded] = useState(false);
    const [hasError, setHasError] = useState(false);

    // בדיקה אם ה-URL בכלל קיים
    const isUrlMissing = !url || url.trim() === "";

    return (
        <div className={`relative overflow-hidden bg-[#0b0e14] ${containerClassName}`}>
            
            {/* אם אין URL או שהייתה שגיאה - מציגים את ה-Placeholder הריק המעוצב */}
            {(isUrlMissing || hasError) ? (
                <EmptyPlaceholder />
            ) : (
                <>
                    {/* Skeleton מוצג רק אם יש URL ועדיין לא נטען */}
                    {!isLoaded && (
                        <Skeleton className="absolute inset-0 w-full h-full z-10" />
                    )}

                    <img
                        src={url}
                        alt={alt}
                        loading="lazy"
                        onLoad={() => setIsLoaded(true)}
                        onError={() => setHasError(true)}
                        className={`${imageClassName} transition-opacity duration-500 ${
                            isLoaded ? "opacity-100" : "opacity-0"
                        }`}
                    />
                    
                    {/* אפקט צללית פנימית ליופי */}
                    <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_15px_rgba(0,0,0,0.4)] opacity-60"></div>
                </>
            )}
        </div>
    );
}
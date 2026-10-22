'use client';
import { useState } from 'react';
import { Send, MailWarning, Loader2, Clock } from 'lucide-react';
import { useVerificationBanner } from '../../hooks/VerificationBanner/useVerificationBanner'; 

export default function VerificationBanner() {
    // משיכת כל הלוגיקה מה-Hook 
    const {
        dontShowBanner,
        cooldown,
        isSending,
        handleResend
    } = useVerificationBanner();

    const [isHovered, setIsHovered] = useState(false);

    if (dontShowBanner) return null;// אם אין צורך להראות את הבאנר, פשוט לא מחזירים כלום

    return (
        <div
            className="fixed bottom-6 right-25 z-50 flex items-center gap-3 transition-all duration-500 ease-in-out"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <div className={`
                group flex items-center bg-slate-900/90 backdrop-blur-md 
                border border-amber-500/40 rounded-full p-1.5 
                shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_30px_rgba(245,158,11,0.4)]
                transition-all duration-500 overflow-hidden
                ${isHovered ? 'w-[260px]' : 'w-[48px] sm:w-[260px]'} 
            `}>

                {/* אייקון מהבהב */}
                <div className="flex-shrink-0 relative flex items-center justify-center w-8 h-8 bg-amber-500/20 rounded-full ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-40"></span>
                    <MailWarning className="w-4 h-4 text-amber-400 relative z-10" />
                </div>

                {/* טקסט */}
                <div className={`
                    flex flex-col whitespace-nowrap transition-all duration-300
                    ${isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4 sm:opacity-100 sm:translate-x-0'}
                `}>
                    <span className="text-slate-200 text-xs font-bold tracking-wide">
                        נדרש אימות חשבון
                    </span>
                </div>

                {/* כפתור הפעולה */}
                <div className={`
                    mr-auto transition-all duration-300
                    ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95 sm:opacity-100 sm:scale-100'}
                `}>
                    <button
                        onClick={handleResend}
                        disabled={cooldown > 0 || isSending}
                        className={`
                            relative flex items-center justify-center gap-2 h-8 px-4 rounded-full
                            font-bold text-[11px] uppercase tracking-wider transition-all duration-300
                            ${cooldown > 0
                                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                                : 'bg-amber-500 text-slate-950 hover:bg-amber-400 hover:scale-105 active:scale-95'
                            }
                        `}
                    >
                        {isSending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : cooldown > 0 ? (
                            <>
                                <span className="font-mono">{cooldown}s</span>
                                <Clock className="w-3 h-3" />
                            </>
                        ) : (
                            <>
                                <span>send again </span>
                                <Send className="w-3 h-3" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
'use client';
import React, { useEffect, useState } from 'react';
import { Gamepad2, Cpu, Wifi } from 'lucide-react';

// =========================================
// קומפוננטת Loader עם אנימציה של דלתות סגורות
// =========================================
export default function GamingLoader({ isLoading }) {
  // מצב פנימי כדי לנהל את האנימציה של היציאה (Unmount)
  const [shouldRender, setShouldRender] = useState(isLoading);

  useEffect(() => {
    if (isLoading) {
      setShouldRender(true);
    } else {
      // נחכה שהאנימציה של הדלתות תסתיים לפני שנעלים את הקומפוננטה מה-DOM
      const timer = setTimeout(() => {
        setShouldRender(false);
      }, 1000); // הזמן צריך להיות תואם ל-duration של ה-CSS
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center pointer-events-none">
      
      {/* --- דלת עליונה --- */}
      <div 
        className={`absolute top-0 left-0 w-full h-[50vh] bg-slate-950 border-b-2 border-purple-500/50 shadow-[0_0_50px_rgba(168,85,247,0.3)] z-10 transition-transform duration-700 ease-in-out will-change-transform flex items-end justify-center overflow-hidden
        ${isLoading ? 'translate-y-0' : '-translate-y-full'}`}
      >
        {/* קישוטים לדלת העליונה - דפוס רשת */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="text-slate-800/20 font-black text-9xl absolute -bottom-10 select-none tracking-widest">LOADING</div>
      </div>

      {/* --- דלת תחתונה --- */}
      <div 
        className={`absolute bottom-0 left-0 w-full h-[50vh] bg-slate-950 border-t-2 border-blue-500/50 shadow-[0_0_50px_rgba(59,130,246,0.3)] z-10 transition-transform duration-700 ease-in-out will-change-transform flex items-start justify-center overflow-hidden
        ${isLoading ? 'translate-y-0' : 'translate-y-full'}`}
      >
        {/* קישוטים לדלת התחתונה */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#4f46e5_1px,transparent_1px)] [background-size:16px_16px]" />
        <div className="text-slate-800/20 font-black text-9xl absolute -top-10 select-none tracking-widest">SYSTEM</div>
      </div>

      {/* --- קו האמצע הזוהר (מופיע רק כשהדלתות סגורות) --- */}
      <div 
        className={`absolute w-full h-[2px] bg-white shadow-[0_0_30px_#fff,0_0_60px_#a855f7] z-20 transition-opacity duration-300
        ${isLoading ? 'opacity-100 delay-500' : 'opacity-0'}`}
      />

      {/* --- תוכן הטעינה (במרכז) --- */}
      <div className={`relative z-30 flex flex-col items-center gap-6 transition-all duration-500 ${isLoading ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
        
        {/* אייקון מרכזי מפעם */}
        <div className="relative">
          <div className="absolute inset-0 bg-purple-600 rounded-full blur-xl opacity-40 animate-pulse" />
          <div className="w-24 h-24 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center relative shadow-2xl">
            <Gamepad2 className="w-12 h-12 text-purple-400 animate-bounce" />
            
            {/* נקודות קישוט */}
            <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full animate-ping" />
            <div className="absolute bottom-2 left-2 w-2 h-2 bg-blue-500 rounded-full" />
          </div>
        </div>

        {/* טקסט וסטטוס */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 uppercase animate-pulse">
            Loading...
          </h2>
          <div className="flex items-center gap-3 text-xs font-mono text-slate-500 justify-center">
            <span className="flex items-center gap-1"><Cpu size={12} /> CPU: OK</span>
            <span className="flex items-center gap-1"><Wifi size={12} /> NET: OK</span>
          </div>
        </div>

        {/* בר טעינה (Health Bar Style) */}
        <div className="w-64 h-3 bg-slate-900 rounded-full border border-slate-700 overflow-hidden relative">
          <div className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 animate-[loadingBar_2s_ease-in-out_infinite] w-full origin-left" />
        </div>
      </div>
    </div>
  );
}



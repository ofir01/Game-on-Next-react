import React, { useState, useRef } from 'react';
// יש לוודא שפונקציית getCoachAdvice תומכת בקבלת gameName ו-gameState הכללי
import { getCoachAdvice } from './aiService';

export default function AIComponent({ 
    gameName = "משחק כללי",
    gameState, 
    showImageControls = false, 
    themeInput = '',
    setThemeInput = () => {},
    isGeneratingImage = false,
    generateAIPuzzleImage = () => {},
    handleImageUpload = () => {}
}) {
    const [coachMessage, setCoachMessage] = useState("המאמן ממתין בסבלנות למהלכים שלך...");
    const [isLoading, setIsLoading] = useState(false);
    const fileInputRef = useRef(null);

    const handleAskCoach = async () => {
        setIsLoading(true);
        setCoachMessage("המאמן מנתח את המצב...");
        
        // שליחת שם המשחק ומצב המשחק ל-AI, כדי שיוכל להגיב בהתאם גם אם המשחק טרם התחיל
        const advice = await getCoachAdvice(gameName, gameState);
        
        if (advice) {
            setCoachMessage(advice);
        } else {
            setCoachMessage("המאמן יצא להפסקת קפה, תסתדר לבד.");
        }
        setIsLoading(false);
    };

    return (
        <div className="w-full flex flex-col gap-4 text-right" dir="rtl">
            {/* שורת יצירת / העלאת תמונה - מוצגת רק אם התנאי מתקיים */}
            {showImageControls && (
                <div className="flex flex-col md:flex-row items-center gap-4 w-full">
                    <input
                        type="text"
                        value={themeInput}
                        onChange={(e) => setThemeInput(e.target.value)}
                        placeholder="איזו תמונה לייצר ב-AI? (למשל: יער פיות בלילה)"
                        className="flex-1 w-full px-4 py-3 rounded-xl border border-slate-700 bg-slate-900/50 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all text-base md:text-lg"
                        disabled={isGeneratingImage}
                    />
                    
                    <button
                        onClick={generateAIPuzzleImage}
                        disabled={isGeneratingImage || !themeInput.trim()}
                        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold rounded-xl transition-all shadow-md flex justify-center items-center gap-2 whitespace-nowrap w-full md:w-auto text-base md:text-lg"
                    >
                        {isGeneratingImage ? <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div> : "צור תמונה ✨"}
                    </button>

                    <span className="text-slate-400 font-medium">או</span>

                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        ref={fileInputRef}
                        id="image-upload-ai"
                    />
                    <label
                        htmlFor="image-upload-ai"
                        className="px-6 py-3 bg-slate-700/80 hover:bg-slate-600 cursor-pointer text-white font-semibold rounded-xl transition-all border border-slate-600 shadow-md flex justify-center items-center gap-2 whitespace-nowrap w-full md:w-auto text-base md:text-lg m-0"
                    >
                        העלה תמונה 📤
                    </label>
                </div>
            )}

            {/* שורת מאמן ה-AI */}
            <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/60 p-3 md:p-4 rounded-xl border border-slate-700/60 w-full">
                <button
                    onClick={handleAskCoach}
                    disabled={isLoading}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-70 text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 whitespace-nowrap w-full md:w-auto text-base md:text-lg shrink-0"
                >
                    {isLoading ? "חושב..." : "מאמן ה-AI 💡"}
                </button>
                <div className="flex-1 text-slate-300 font-medium italic min-h-[44px] flex items-center px-2 text-center md:text-right text-sm md:text-base leading-relaxed">
                    {coachMessage}
                </div>
            </div>
        </div>
    );
}
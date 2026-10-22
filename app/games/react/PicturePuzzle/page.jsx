"use client";
import { toast } from 'sonner'

import React, { useState, useEffect } from 'react';

// --- הגדרות דרגות הקושי ---
const DIFFICULTY_CONFIG = {
  easy: { label: 'קל', images: 6, rows: 2, cols: 3, attempts: 10 },
  medium: { label: 'בינוני', images: 9, rows: 3, cols: 3, attempts: 14 },
  hard: { label: 'קשה', images: 12, rows: 4, cols: 3, attempts: 16 }
};

// מפתח ה-API 
const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENERATION_CONFIG_API_KEY;

// --- פונקציית עזר לקריאות API עם מנגנון השהיה (Retry) ---
const fetchWithRetry = async (url, options, retries = 5) => {
  let delay = 1000;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay));
      delay *= 2; // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    }
  }
};

export default function App() {
  // --- הגדרות ה-State הראשיות ---
  const [difficulty, setDifficulty] = useState('easy');
  const [board, setBoard] = useState([]);
  const [allImages, setAllImages] = useState([]);
  const [attempts, setAttempts] = useState(0);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [rowFeedback, setRowFeedback] = useState({});

  // --- States עבור יכולות ה-AI ---
  const [themeInput, setThemeInput] = useState("");
  const [isGeneratingImages, setIsGeneratingImages] = useState(false);
  const [aiCoachMessage, setAiCoachMessage] = useState("");
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // --- פעולה: אתחול המשחק ---
  const initializeGame = (customImages = null, targetDifficulty = difficulty) => {
    const config = DIFFICULTY_CONFIG[targetDifficulty];
    const totalImages = config.images;

    // 1. יצירת תמונות (רנדומליות או מותאמות אישית)
    const images = customImages || Array.from({ length: totalImages }, (_, i) => ({
      id: `img_${i + 1}`,
      url: `https://picsum.photos/seed/${Math.floor(Math.random() * 10000)}/200/200`
    }));
    setAllImages(images);

    // 2. ערבוב מראש של התמונות לצורך מיקומן ההתחלתי על הלוח
    const shuffledImages = [...images].sort(() => Math.random() - 0.5);

    // 3. יצירת הלוח כאשר כל המשבצות כבר מאוכלסות בתמונות המעורבבות
    const initialBoard = [];
    let imgIndex = 0;
    for (let r = 1; r <= config.rows; r++) {
      for (let c = 1; c <= config.cols; c++) {
        initialBoard.push({
          slotId: `r${r}-c${c}`,
          row: r,
          expectedImageId: images[imgIndex].id, // המיקום הנכון שצריך להגיע אליו
          currentImageId: shuffledImages[imgIndex].id // המיקום המעורבב ההתחלתי
        });
        imgIndex++;
      }
    }
    setBoard(initialBoard);

    // 4. הגדרת שאר ערכי המשחק
    setAttempts(config.attempts);
    setRowFeedback({});
    setIsGameOver(false);
    setHasWon(false);
    setAiCoachMessage("");
    setApiError("");
  };

  useEffect(() => {
    initializeGame(null, 'easy');
  }, []);

  // --- פעולה: שינוי רמת קושי ---
  const handleDifficultyChange = (newDifficulty) => {
    setDifficulty(newDifficulty);
    initializeGame(null, newDifficulty);
  };

  // --- פעולה תלוית AI: יצירת משחק מותאם אישית לפי נושא ---
  const generateAIGame = async () => {
    if (!themeInput.trim()) {
      setApiError("נא להזין נושא קודם!");
      return;
    }

    setIsGeneratingImages(true);
    setApiError("");
    setAiCoachMessage("");

    const config = DIFFICULTY_CONFIG[difficulty];

    try {
      // בקשת פרומפטים באנגלית מהמודל הטקסטואלי
      const textUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const textPayload = {
        contents: [{
          parts: [{ text: `The user wants a game theme based on "${themeInput}". Generate a JSON array of exactly ${config.images} distinct, highly detailed, visually striking image generation prompts in English based on this theme. Make them visually distinct so they are easy to tell apart in a puzzle game.` }]
        }],
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: "ARRAY",
            items: { type: "STRING" }
          }
        }
      };

      const textResponse = await fetchWithRetry(textUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(textPayload)
      });

      const promptsArray = JSON.parse(textResponse.candidates[0].content.parts[0].text);

      // יצירת התמונות באמצעות מודל Imagen
      const imageUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;

      const imagePromises = promptsArray.map(async (prompt, index) => {
        const imagePayload = {
          instances: { prompt: prompt },
          parameters: { sampleCount: 1 }
        };
        const imgRes = await fetchWithRetry(imageUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(imagePayload)
        });

        const base64Image = imgRes.predictions[0].bytesBase64Encoded;
        return {
          id: `ai_img_${index + 1}`,
          url: `data:image/png;base64,${base64Image}`
        };
      });

      const customImages = await Promise.all(imagePromises);
      initializeGame(customImages, difficulty);
      setThemeInput("");

    } catch (err) {
      console.error(err);
      setApiError("אופס! משהו השתבש בייצור התמונות. נסה נושא אחר.");
    } finally {
      setIsGeneratingImages(false);
    }
  };

  // --- פעולה תלוית AI: התייעצות עם המאמן האישי ---
  const getAICoachAdvice = async () => {
    setIsCoachLoading(true);
    setApiError("");

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      let situation = "";
      if (isGameOver && hasWon) situation = "השחקן ניצח את המשחק!";
      else if (isGameOver && !hasWon) situation = "השחקן הפסיד את המשחק כי נגמרו לו הניסיונות.";

      const config = DIFFICULTY_CONFIG[difficulty];
      const prompt = `אתה פרשן מצחיק ועוקצני (אבל אוהב) של משחק מחשבה בסגנון בול-פגיעה עם תמונות.
      מצב השחקן: ${situation}. רמת קושי: ${config.label}. ניסיונות שנותרו: ${attempts} מתוך ${config.attempts}.
      תן לשחקן משפט קצר (עד 15 מילים) בעברית שמתייחס למצבו הנוכחי. תהיה קליל ומשעשע.`;

      const payload = {
        contents: [{ parts: [{ text: prompt }] }]
      };

      const response = await fetchWithRetry(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const advice = response.candidates[0].content.parts[0].text;
      setAiCoachMessage(advice);

    } catch (err) {
      console.error(err);
      setApiError("המאמן כרגע בהפסקת קפה, נסה שוב מאוחר יותר.");
    } finally {
      setIsCoachLoading(false);
    }
  };

  // --- פעולות הגרירה (Drag and Drop) - החלפה פשוטה וישירה ---
  const handleDragStart = (e, slotId) => {
    e.dataTransfer.setData("sourceSlotId", slotId);
    e.currentTarget.style.opacity = '0.4';
  };

  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
  }

  const handleDropOnSlot = (e, targetSlotId) => {
    e.preventDefault();
    if (isGameOver) return;

    const sourceSlotId = e.dataTransfer.getData("sourceSlotId");
    if (!sourceSlotId || sourceSlotId === targetSlotId) return;

    setBoard(prevBoard => {
      const newBoard = prevBoard.map(slot => ({ ...slot }));
      const sourceIndex = newBoard.findIndex(s => s.slotId === sourceSlotId);
      const targetIndex = newBoard.findIndex(s => s.slotId === targetSlotId);

      if (sourceIndex > -1 && targetIndex > -1) {
        // החלפת התמונות (IDs) בין שתי המשבצות
        const temp = newBoard[sourceIndex].currentImageId;
        newBoard[sourceIndex].currentImageId = newBoard[targetIndex].currentImageId;
        newBoard[targetIndex].currentImageId = temp;
      }
      return newBoard;
    });
  };

  const allowDrop = (e) => e.preventDefault();

  // --- פעולה: בדיקת התוצאה (אישור) ---
  const submitGuess = () => {
    if (isGameOver) return;

    const config = DIFFICULTY_CONFIG[difficulty];
    let totalExactMatches = 0;
    const newRowFeedback = {};

    for (let r = 1; r <= config.rows; r++) {
      let exact = 0;
      let partial = 0;
      const rowSlots = board.filter(slot => slot.row === r);

      rowSlots.forEach(slot => {
        if (slot.currentImageId === slot.expectedImageId) {
          exact++;
          totalExactMatches++;
        } else {
          // בדיקה האם התמונה קיימת בכלל בשורה הזו (אך במיקום אחר)
          const isInSameRow = rowSlots.some(otherSlot =>
            otherSlot.expectedImageId === slot.currentImageId
          );
          if (isInSameRow) partial++;
        }
      });
      newRowFeedback[r] = { exact, partial };
    }

    setRowFeedback(newRowFeedback);
    const newAttempts = attempts - 1;
    setAttempts(newAttempts);
    setAiCoachMessage("");

    if (totalExactMatches === config.images) {
      setIsGameOver(true);
      setHasWon(true);
    } else if (newAttempts === 0) {
      setIsGameOver(true);
      setHasWon(false);
    }
  };

  // רכיב פנימי לקונפטי 
  const Confetti = () => {
    const colors = ['#fce18a', '#ff726d', '#b48def', '#f4306d', '#42e2b8', '#4caf50', '#ffeb3b'];
    return (
      <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
        {Array.from({ length: 150 }).map((_, i) => (
          <div
            key={i}
            className="absolute top-[-20px] animate-confetti"
            style={{
              left: `${Math.random() * 100}vw`,
              width: `${Math.random() * 10 + 5}px`,
              height: `${Math.random() * 20 + 10}px`,
              backgroundColor: colors[Math.floor(Math.random() * colors.length)],
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 1.5}s`,
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div dir="rtl" className="min-h-screen flex flex-col items-center py-10 px-4 font-sans text-gray-800 relative overflow-hidden animated-gradient-bg">

      <style>
        {`
          /* רקע מרגיע ומונפש */
          .animated-gradient-bg {
            background: linear-gradient(-45deg, #e0c3fc, #8ec5fc, #a1c4fd, #c2e9fb);
            background-size: 400% 400%;
            animation: gradient-bg 12s ease infinite;
          }
          @keyframes gradient-bg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }

          @keyframes confetti-fall {
            0% { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
            100% { transform: translateY(110vh) rotate(720deg); opacity: 0; }
          }
          .animate-confetti { animation: confetti-fall linear forwards; }
          
          @keyframes pop-in {
            0% { transform: scale(0.5); opacity: 0; }
            100% { transform: scale(1); opacity: 1; }
          }
          .animate-pop-in { animation: pop-in 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
          
          /* אנימציית נפילה/ירידה לבועת הניסיונות */
          @keyframes drop-in {
            0% { transform: translateY(-25px) scale(1.3); opacity: 0; }
            60% { transform: translateY(4px) scale(0.9); opacity: 1; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
          }
          .animate-drop-in { animation: drop-in 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards; }

          /* אנימציות עדינות לסמני הפגיעה */
          @keyframes float-slow {
            0%, 100% { transform: translateY(0) scale(1); }
            50% { transform: translateY(-2px) scale(1.05); }
          }
          .animate-float-slow { animation: float-slow 2s ease-in-out infinite; }
          
          @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 0 8px rgba(251, 191, 36, 0.4); transform: scale(1); }
            50% { box-shadow: 0 0 15px rgba(251, 191, 36, 0.8); transform: scale(1.05); }
          }
          .animate-pulse-glow { animation: pulse-glow 2s ease-in-out infinite; }

          .loader {
            border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #fff;
            border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}
      </style>

      {hasWon && <Confetti />}

      { }
      {isGameOver && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-indigo-900/40 backdrop-blur-md transition-opacity">
          <div className="bg-white/90 p-8 rounded-[2rem] shadow-2xl text-center max-w-sm w-full mx-4 animate-pop-in border border-white/50">
            <h2 className={`text-5xl font-extrabold mb-4 drop-shadow-sm ${hasWon ? 'text-emerald-500' : 'text-rose-500'}`}>
              {hasWon ? 'ניצחון! 🏆' : 'הפסדת 😔'}
            </h2>
            <button
              onClick={() => initializeGame()}
              className="w-full px-6 py-4 bg-gradient-to-l from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xl rounded-2xl transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              שחק שוב
            </button>
          </div>
        </div>
      )}

      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-800 to-purple-800 drop-shadow-sm text-center">משחק ניחוש תמונות</h1>

      { }
      {/* --- תפריט בחירת רמת קושי --- */}
      <div className="flex bg-white/40 p-1.5 rounded-full backdrop-blur-md shadow-sm border border-white/60 mb-6 relative z-10">
        {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
          <button
            key={key}
            onClick={() => handleDifficultyChange(key)}
            className={`px-6 py-2 rounded-full font-bold transition-all duration-300 ${difficulty === key
              ? 'bg-purple-600 text-white shadow-md transform scale-105'
              : 'text-purple-900 hover:bg-white/50'
              }`}
          >
            {config.label}
          </button>
        ))}
      </div>


      {/* פאנל בינה מלאכותית */}
      <div className="w-full max-w-2xl bg-white/70 backdrop-blur-md rounded-[2rem] p-6 shadow-lg border border-white/80 mb-8 relative z-10">
        {/* יצירת נושא חדש */}
        <div className="flex flex-col md:flex-row gap-3 mb-4">
          <input
            type="text"
            value={themeInput}
            onChange={(e) => setThemeInput(e.target.value)}
            placeholder="בחר נושא לתמונות (למשל: חיות,רכבים...)"
            className="flex-1 px-4 py-3 rounded-2xl border-2 border-purple-100 focus:outline-none focus:border-purple-400 bg-white/80 transition-colors"
            disabled={isGeneratingImages}
          />
          <button
            onClick={generateAIGame}
            disabled={isGeneratingImages || !themeInput.trim()}
            className="px-6 py-3 bg-gradient-to-l from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-60 text-white font-bold rounded-2xl transition-all shadow-md flex justify-center items-center gap-2"
          >
            {isGeneratingImages ? <div className="loader"></div> : "צור לוח משחק מותאם אישית"}
          </button>
        </div>

        {/* מאמן AI */}
        <div className="flex flex-col md:flex-row items-center gap-4 p-4 bg-indigo-50/80 rounded-2xl border border-indigo-100">
          <button
            onClick={getAICoachAdvice}
            disabled={isCoachLoading}
            className="px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 disabled:opacity-60 text-white font-bold rounded-xl shadow transition-all flex items-center gap-2 whitespace-nowrap"
          >
            {isCoachLoading ? "חושב..." : "💡 קבל טיפ ממאמן ה-AI"}
          </button>
          <div className="flex-1 text-indigo-900 font-medium italic min-h-[40px] flex items-center bg-white/50 px-4 py-2 rounded-xl">
            {aiCoachMessage ? `"${aiCoachMessage}"` : "המאמן ממתין לפנייתך..."}
          </div>
        </div>

        {apiError && <p className="text-rose-500 font-bold mt-3 text-center">{apiError}</p>}
      </div>

      { }
      {/* הלוח המרכזי שבו מגררים ומחליפים ישירות - עכשיו מעל הכפתורים */}
      <div className="flex flex-col items-center gap-4 mb-8 relative z-10 w-full max-w-2xl">
        <h2 className="text-xl font-bold text-indigo-900 bg-white/50 px-6 py-1.5 rounded-full backdrop-blur-sm border border-white/60">
          לוח הפאזל (גרור תמונה על תמונה אחרת כדי להחליף ביניהן)
        </h2>

        <div className="flex flex-col gap-4 p-5 bg-white/40 backdrop-blur-xl rounded-[2rem] shadow-lg border border-white/60 w-full">
          {Array.from({ length: DIFFICULTY_CONFIG[difficulty].rows }).map((_, rowIndex) => {
            const r = rowIndex + 1;
            const rowSlots = board.filter(slot => slot.row === r);
            const rFeedback = rowFeedback[r] || { exact: 0, partial: 0 };

            return (
              <div key={`row-${r}`} className="flex items-center justify-between gap-4 md:gap-6 p-3 bg-white/60 rounded-2xl shadow-sm border border-white/80">

                {/* משבצות השורה */}
                <div className="grid grid-cols-3 gap-3 md:gap-4 flex-1">
                  {rowSlots.map(slot => {
                    const image = allImages.find(img => img.id === slot.currentImageId);
                    return (
                      <div
                        key={slot.slotId}
                        onDrop={(e) => handleDropOnSlot(e, slot.slotId)}
                        onDragOver={allowDrop}
                        className="aspect-square border-2 border-dashed border-indigo-300 rounded-2xl flex items-center justify-center bg-indigo-50/50 relative overflow-hidden shadow-inner transition-colors hover:border-indigo-500 hover:bg-indigo-50"
                      >
                        {image && (
                          <img
                            src={image.url}
                            draggable={!isGameOver}
                            onDragStart={(e) => handleDragStart(e, slot.slotId)}
                            onDragEnd={handleDragEnd}
                            className="w-full h-full object-cover cursor-grab active:cursor-grabbing hover:scale-105 transition-transform duration-300 select-none"
                            alt="game-img"
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* אזור הרמזים (בול פגיעה) */}
                <div className="flex flex-wrap gap-2 w-14 md:w-20 justify-center items-center bg-indigo-900/5 p-2 rounded-xl min-h-[80px]">
                  {Array.from({ length: rFeedback.exact }).map((_, i) => (
                    <div key={`exact-${i}`} className="relative w-6 h-6 md:w-7 md:h-7 flex items-center justify-center animate-float-slow" title="בול (מקום מדויק)">
                      <div className="absolute inset-0 bg-emerald-400 rounded-full blur-[4px] opacity-70"></div>
                      <div className="relative w-5 h-5 md:w-6 md:h-6 bg-gradient-to-tr from-emerald-600 to-green-400 rounded-full border-2 border-white shadow-sm flex items-center justify-center">
                        <span className="text-white text-[10px] font-bold">✓</span>
                      </div>
                    </div>
                  ))}

                  {Array.from({ length: rFeedback.partial }).map((_, i) => (
                    <div key={`partial-${i}`} className="relative w-5 h-5 md:w-6 md:h-6 flex items-center justify-center animate-pulse-glow" title="פגיעה (באותה שורה)">
                      <div className="absolute inset-0 bg-amber-400 rounded-full blur-[4px] opacity-60"></div>
                      <div className="relative w-4 h-4 md:w-5 md:h-5 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full border-2 border-white"></div>
                    </div>
                  ))}

                  {rFeedback.exact === 0 && rFeedback.partial === 0 && Object.keys(rowFeedback).length > 0 && (
                    <div className="w-5 h-5 md:w-6 md:h-6 flex items-center justify-center opacity-40 bg-gray-200 rounded-full border border-gray-300">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full"></div>
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      </div>

      { }
      {/* סרגל כלים תחתון חדש ומעוצב בשורה אחת */}
      <div className="relative z-10 w-full max-w-lg mx-auto flex flex-row-reverse items-center justify-center gap-6 bg-white/70 backdrop-blur-xl px-6 py-4 rounded-[2.5rem] shadow-xl border border-white/80 mt-2">

        {/* כפתור ערבוב מחדש */}
        <button
          onClick={() => initializeGame()}
          className="flex-1 py-3.5 bg-white text-indigo-600 hover:bg-indigo-50 font-bold text-lg rounded-full transition-all duration-300 shadow-sm border-2 border-indigo-100"
        >
          ערבב מחדש
        </button>

        {/* כפתור אישור הניחוש עם תגית מספר ניסיונות מרחפת מעליו */}
        <div className="relative flex-[1.5]">
          {/* בועת מספר ניסיונות - אנימציה מתופעלת על ידי שינוי ה-key בכל פעם שהערך מתעדכן */}
          <div
            key={attempts}
            className="absolute -top-4 -right-3 z-20 bg-gradient-to-br from-rose-400 to-rose-600 text-white w-10 h-10 flex items-center justify-center rounded-full shadow-lg border-[3px] border-white font-black text-xl animate-drop-in pointer-events-none"
            title="ניסיונות שנותרו"
          >
            {attempts}
          </div>

          <button
            onClick={submitGuess}
            disabled={isGameOver}
            className="w-full py-3.5 bg-gradient-to-l from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed text-white font-black text-xl rounded-full transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
          >
            בדוק אותי
          </button>
        </div>

      </div>

    </div>
  );
}
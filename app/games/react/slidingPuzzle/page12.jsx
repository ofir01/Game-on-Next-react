"use client";


import React, { useState, useEffect, useCallback, useRef } from 'react';

// --- הגדרות המשחק ---
const TILE_MARGIN = 4; // מרווח בין החלקים

const DIFFICULTY_CONFIG = {
  easy: { label: 'קל (3x3)', size: 3, tileSize: 140 }, // הגדלתי את הבלוקים
  medium: { label: 'בינוני (4x4)', size: 4, tileSize: 110 },
  hard: { label: 'קשה (5x5)', size: 5, tileSize: 85 }
};

// --- הגדרות סרטוני הדרכה ---
// כאן נמצאים הסרטונים. כדי לעדכן לתיקייה המקומית שלך, פשוט שנה את ה-src. 
// לדוגמה: src: './videos/my-video.mp4'
const TUTORIAL_VIDEOS = [
  { id: 1, title: 'איך לפתור פאזל 3x3 (דוגמה)', src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 2, title: 'טריקים למתקדמים (דוגמה)', src: 'https://www.w3schools.com/html/mov_bbb.mp4' }
];

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_GENERATION_CONFIG_API_KEY;

// פונקציית עזר לקריאות API עם מנגנון השהיה (Retry)
const fetchWithRetry = async (url, options, retries = 3) => {
  let delay = 1000;
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(res => setTimeout(res, delay));
      delay *= 2;
    }
  }
};

export default function AISlidingPuzzle() {
  // --- Game State ---
  const [difficulty, setDifficulty] = useState('medium');
  const [gridSize, setGridSize] = useState(DIFFICULTY_CONFIG.medium.size);
  const [tileSize, setTileSize] = useState(DIFFICULTY_CONFIG.medium.tileSize);
  const [board, setBoard] = useState([]);
  const [isWon, setIsWon] = useState(false);
  const [moves, setMoves] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // --- Image & Modes State ---
  const [themeInput, setThemeInput] = useState("");
  const [puzzleImage, setPuzzleImage] = useState(null); // שמירת ה-URL של התמונה
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [gameMode, setGameMode] = useState('numbers'); // 'numbers' או 'picture'
  const [showTargetImage, setShowTargetImage] = useState(true); // הצגה/הסתרה של תמונת מטרה
  const fileInputRef = useRef(null); // לחיבור כפתור העלאת הקובץ

  // --- AI State ---
  const [aiCoachMessage, setAiCoachMessage] = useState("");
  const [isCoachLoading, setIsCoachLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  // --- Tutorials State ---
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  // מציאת שכנים חוקיים
  const getValidNeighbors = (index, size) => {
    const neighbors = [];
    const row = Math.floor(index / size);
    const col = index % size;

    if (row > 0) neighbors.push(index - size); // למעלה
    if (row < size - 1) neighbors.push(index + size); // למטה
    if (col > 0) neighbors.push(index - 1); // שמאלה
    if (col < size - 1) neighbors.push(index + 1); // ימינה

    return neighbors;
  };

  const initializeGame = useCallback(() => {
    // יצירת לוח פתור (1 עד סוף, ובסוף 0)
    let newBoard = Array.from({ length: gridSize * gridSize - 1 }, (_, i) => i + 1);
    newBoard.push(0);

    // ערבוב תקין (אלגוריתם הליכה רנדומלית כדי להבטיח פתירות)
    let emptyIndex = newBoard.length - 1;
    // נערבב יותר פעמים עבור לוחות גדולים יותר כדי לוודא עירבוב איכותי
    const shuffleCount = gridSize * gridSize * 15;
    let lastIndex = -1;

    for (let i = 0; i < shuffleCount; i++) {
      const neighbors = getValidNeighbors(emptyIndex, gridSize);
      // מנסים למנוע חזרה על אותו מהלך ברצף לערבוב איכותי יותר
      let validMoves = neighbors.filter(n => n !== lastIndex);
      if (validMoves.length === 0) validMoves = neighbors;

      const randomNeighbor = validMoves[Math.floor(Math.random() * validMoves.length)];

      [newBoard[emptyIndex], newBoard[randomNeighbor]] = [newBoard[randomNeighbor], newBoard[emptyIndex]];
      lastIndex = emptyIndex;
      emptyIndex = randomNeighbor;
    }

    setBoard([...newBoard]);
    setMoves(0);
    setIsWon(false);
    setIsPlaying(true);
    setAiCoachMessage("");
  }, [gridSize]);

  // אתחול המשחק כשהגודל משתנה או בטעינה ראשונה
  useEffect(() => {
    initializeGame();
  }, [gridSize, initializeGame]);

  // שינוי דרגת קושי
  const handleDifficultyChange = (level) => {
    setDifficulty(level);
    setGridSize(DIFFICULTY_CONFIG[level].size);
    setTileSize(DIFFICULTY_CONFIG[level].tileSize);
  };

  // לחיצה על חלק
  const handleTileClick = (index) => {
    if (isWon || !isPlaying) return;

    const emptyIndex = board.indexOf(0);
    const validNeighbors = getValidNeighbors(emptyIndex, gridSize);

    if (validNeighbors.includes(index)) {
      const newBoard = [...board];
      newBoard[emptyIndex] = newBoard[index];
      newBoard[index] = 0;

      setBoard(newBoard);
      const newMoves = moves + 1;
      setMoves(newMoves);
      checkWin(newBoard);
    }
  };

  // בדיקת ניצחון
  const checkWin = (currentBoard) => {
    for (let i = 0; i < currentBoard.length - 1; i++) {
      if (currentBoard[i] !== i + 1) return;
    }
    setIsWon(true);
    setIsPlaying(false);
    getAICoachAdvice(true); // הודעת ניצחון מה-AI
  };

  // טיפול בהעלאת תמונה
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPuzzleImage(reader.result);
        setGameMode('picture');
        initializeGame();
        setApiError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const generateAIPuzzleImage = async () => {
    if (!themeInput.trim()) {
      setApiError("נא להזין נושא לתמונה!");
      return;
    }

    setIsGeneratingImage(true);
    setApiError("");
    setAiCoachMessage("");

    try {
      const textUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
      const textPayload = {
        contents: [{
          parts: [{ text: `Translate the following theme to English and write a highly detailed, visually striking, and colorful image generation prompt suitable for a picture puzzle game. The theme is: "${themeInput}". Just return the prompt.` }]
        }]
      };

      const textResponse = await fetchWithRetry(textUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(textPayload)
      });

      const enhancedPrompt = textResponse.candidates[0].content.parts[0].text;

      const imageUrl = `https://generativelanguage.googleapis.com/v1beta/models/imagen-3.0-generate-001:predict?key=${apiKey}`;
      const imagePayload = {
        instances: { prompt: enhancedPrompt },
        parameters: { sampleCount: 1 }
      };

      const imgRes = await fetchWithRetry(imageUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(imagePayload)
      });

      if (imgRes.predictions && imgRes.predictions.length > 0) {
        const base64Image = imgRes.predictions[0].bytesBase64Encoded;
        setPuzzleImage(`data:image/png;base64,${base64Image}`);
        setGameMode('picture'); // עובר אוטומטית למצב תמונה כשנוצרת אחת
        initializeGame(); // ערבוב מחדש
        setThemeInput("");
      } else {
        throw new Error("No image generated");
      }

    } catch (err) {
      console.error(err);
      setApiError("אופס! משהו השתבש ביצירת התמונה. נסה נושא אחר או בדוק את מפתח ה-API.");
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const getAICoachAdvice = async (justWon = false) => {
    setIsCoachLoading(true);
    setApiError("");

    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

      let situation = justWon ? "השחקן בדיוק פתר את הפאזל!" : `השחקן עשה ${moves} מהלכים ועדיין מנסה לפתור את הפאזל של ${gridSize}x${gridSize}.`;
      const hasPicture = gameMode === 'picture' ? "זהו פאזל תמונה." : "זהו פאזל מספרים קלאסי.";

      const prompt = `אתה מאמן ופרשן מצחיק, ציני (אבל מעודד) של משחק פאזל הזזה (15-puzzle). 
      מצב השחקן: ${situation}. ${hasPicture}
      תן לשחקן משפט קצר (עד 15 מילים) בעברית שמתייחס למצבו הנוכחי. תהיה קליל ומשעשע. אל תיתן הוראות איך לפתור, רק הערה מצחיקה.`;

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
      setApiError("המאמן יצא להפסקת קפה, נסה שוב מאוחר יותר.");
    } finally {
      setIsCoachLoading(false);
    }
  };

  // חישוב הרקע של כל משבצת (אם משחקים במצב תמונה)
  const getTileBackgroundStyle = (tileNumber) => {
    if (tileNumber === 0) return {};

    const correctIndex = tileNumber - 1;
    const row = Math.floor(correctIndex / gridSize);
    const col = correctIndex % gridSize;

    const backgroundPosX = 100 - ((col / (gridSize - 1)) * 100);
    const backgroundPosY = (row / (gridSize - 1)) * 100;

    return {
      backgroundImage: `url(${puzzleImage})`,
      backgroundSize: `${gridSize * 100}% ${gridSize * 100}%`,
      backgroundPosition: `${backgroundPosX}% ${backgroundPosY}%`,
      color: 'transparent' // מסתיר את המספר אם יש תמונה
    };
  };

  const showImage = gameMode === 'picture' && puzzleImage;

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4 font-sans text-slate-100 overflow-x-hidden">

      {/* רקע */}
      <style>
        {`
          .animated-gradient-bg {
            background: linear-gradient(-45deg, #1e293b, #0f172a, #1e1b4b, #312e81);
            background-size: 400% 400%;
            animation: gradient-bg 15s ease infinite;
          }
          @keyframes gradient-bg {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
          .loader {
            border: 3px solid rgba(255,255,255,0.3); border-top: 3px solid #fff;
            border-radius: 50%; width: 20px; height: 20px; animation: spin 1s linear infinite;
          }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        `}
      </style>
      <div className="absolute inset-0 animated-gradient-bg -z-10 opacity-80"></div>

      <div className="w-full max-w-6xl flex flex-col items-center gap-8 z-10">

        {/* כותרת */}
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 drop-shadow-md mb-2">
            פאזל הזזה חכם 🧩
          </h1>
          <p className="text-slate-300 text-lg">שחק במספרים או צור/העלה תמונה למשחק!</p>
        </div>

        { }
        {/* חלונית שליטה ובחירה */}
        <div className="w-full max-w-4xl bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-700/50">

          {/* בורר מצב משחק ודרגות קושי */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b border-slate-700">

            {/* דרגות קושי וכפתור סרטונים */}
            <div className="flex flex-wrap justify-center gap-2 bg-slate-900/60 p-1.5 rounded-xl border border-slate-700">
              {Object.entries(DIFFICULTY_CONFIG).map(([key, config]) => (
                <button
                  key={key}
                  onClick={() => handleDifficultyChange(key)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all text-sm ${difficulty === key ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'}`}
                >
                  {config.label}
                </button>
              ))}

              {/* כפתור סרטוני הדרכה */}
              <button
                onClick={() => setIsTutorialOpen(true)}
                className="px-4 py-2 rounded-lg font-bold transition-all text-sm text-amber-300/80 hover:text-amber-300 hover:bg-slate-700/50 flex items-center gap-1 border-r border-slate-700 mr-1 pr-3"
              >
                🎓 הדרכות
              </button>
            </div>

            {/* מצב משחק (תמונה או מספרים) */}
            <div className="flex bg-slate-900/60 p-1.5 rounded-xl border border-slate-700">
              <button
                onClick={() => setGameMode('numbers')}
                className={`px-5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${gameMode === 'numbers' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'}`}
              >
                🔢 מספרים
              </button>
              <button
                onClick={() => { if (puzzleImage) setGameMode('picture') }}
                disabled={!puzzleImage}
                className={`px-5 py-2 rounded-lg font-bold transition-all flex items-center gap-2 ${gameMode === 'picture' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400'} ${!puzzleImage ? 'opacity-40 cursor-not-allowed' : 'hover:text-slate-200'}`}
                title={!puzzleImage ? "ספק תמונה כדי לפתוח" : ""}
              >
                🖼️ תמונה
              </button>
            </div>

          </div>

          {/* יצירת תמונה ב-AI או העלאה */}
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <input
              type="text"
              value={themeInput}
              onChange={(e) => setThemeInput(e.target.value)}
              placeholder="איזו תמונה לייצר ב-AI? (למשל: יער פיות בלילה)"
              className="flex-1 px-4 py-3 rounded-xl border border-slate-600 bg-slate-900/50 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-lg"
              disabled={isGeneratingImage}
            />
            <button
              onClick={generateAIPuzzleImage}
              disabled={isGeneratingImage || !themeInput.trim()}
              className="px-6 py-3 bg-gradient-to-l from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 text-lg whitespace-nowrap"
            >
              {isGeneratingImage ? <div className="loader"></div> : "צור תמונה ✨"}
            </button>

            <span className="text-slate-400 self-center hidden md:block">או</span>

            {/* כפתור העלאת תמונה נסתר שמופעל על ידי Label */}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              ref={fileInputRef}
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="px-6 py-3 bg-slate-700 hover:bg-slate-600 cursor-pointer text-white font-bold rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 text-lg whitespace-nowrap border border-slate-500"
            >
              העלה תמונה 📤
            </label>
          </div>

          {/* מאמן אישי */}
          <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/40 p-4 rounded-xl border border-slate-700/50">
            <button
              onClick={() => getAICoachAdvice(false)}
              disabled={isCoachLoading}
              className="px-5 py-2.5 bg-indigo-600/80 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold rounded-lg shadow transition-all flex items-center gap-2 whitespace-nowrap border border-indigo-400/30"
            >
              {isCoachLoading ? "חושב..." : "💡 מאמן ה-AI"}
            </button>
            <div className="flex-1 text-cyan-100 font-medium italic min-h-[44px] flex items-center px-2 text-center md:text-right">
              {aiCoachMessage ? `"${aiCoachMessage}"` : "המאמן ממתין בסבלנות למהלכים שלך..."}
            </div>
          </div>

          {apiError && <p className="text-rose-400 font-bold mt-3 text-center text-sm">{apiError}</p>}
        </div>





        {/* אזור המשחק הראשי - הפאזל מימין (או למעלה במובייל) והמטרה משמאל */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full">

          {/* לוח הפאזל המרכזי והמוגדל (צד ימין / ראשון) */}
          <div className="bg-slate-800/90 backdrop-blur-sm p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-600 mx-auto lg:mr-0 relative order-1">

            <div className="flex justify-between items-center mb-8">
              <div className="bg-slate-900/80 px-5 py-2.5 rounded-xl border border-slate-600 shadow-inner">
                <span className="text-slate-400 font-medium text-lg">צעדים:</span>
                <span className="text-2xl font-black text-cyan-400 mr-3">{moves}</span>
              </div>

              <button
                onClick={initializeGame}
                className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-xl transition-colors border border-slate-500 shadow-md"
              >
                ערבב מחדש
              </button>
            </div>

            <div
              className="relative bg-slate-950 rounded-2xl p-2 border-4 border-slate-700 shadow-[inset_0_4px_20px_rgba(0,0,0,0.5)] mx-auto overflow-hidden"
              style={{
                width: (tileSize + TILE_MARGIN) * gridSize + TILE_MARGIN * 2,
                height: (tileSize + TILE_MARGIN) * gridSize + TILE_MARGIN * 2
              }}
            >
              {board.map((tileNumber, index) => {
                if (tileNumber === 0) return null;

                const row = Math.floor(index / gridSize);
                const col = index % gridSize;

                const topPosition = row * (tileSize + TILE_MARGIN) + TILE_MARGIN;
                const rightPosition = col * (tileSize + TILE_MARGIN) + TILE_MARGIN;
                const isCorrectPosition = tileNumber === index + 1;

                const tileBgStyle = showImage ? getTileBackgroundStyle(tileNumber) : {};

                return (
                  <div
                    key={tileNumber}
                    onClick={() => handleTileClick(index)}
                    className={`absolute flex items-center justify-center font-black rounded-xl cursor-pointer select-none transition-all duration-300 ease-out hover:scale-[0.96] hover:brightness-110 shadow-lg border-2
                                ${!showImage
                        ? (isCorrectPosition
                          ? 'bg-gradient-to-br from-slate-600 to-slate-700 border-slate-500 text-emerald-200 shadow-none' // צבע רגוע יותר כשבמקום במצב מספרים
                          : 'bg-gradient-to-br from-indigo-500 to-blue-600 border-indigo-400 text-white') // צבע בולט כשלא במקום
                        : ''}
                                ${showImage && isCorrectPosition ? 'border-emerald-400/50' : 'border-slate-900/40'}
                                `}
                    style={{
                      width: tileSize,
                      height: tileSize,
                      top: topPosition,
                      right: rightPosition,
                      fontSize: `${tileSize * 0.4}px`, // גודל טקסט דינמי לפי הבלוק
                      transitionProperty: 'top, right, transform, border-color, background-color',
                      ...tileBgStyle
                    }}
                  >
                    {/* הצגת המספר אם אין תמונה או אם מוגדר שקוף ב-CSS */}
                    {(!showImage) && tileNumber}
                  </div>
                );
              })}
            </div>

            {isWon && (
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-900/85 backdrop-blur-md rounded-[2.5rem]">
                <div className="bg-slate-800 p-10 rounded-3xl border-2 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.3)] text-center animate-bounce">
                  <h2 className="text-4xl font-extrabold text-emerald-400 mb-4">כל הכבוד! 🎉</h2>
                  <p className="text-slate-200 text-lg mb-8">פתרת פאזל של {gridSize}x{gridSize} ב-{moves} צעדים.</p>
                  <button
                    onClick={initializeGame}
                    className="px-8 py-4 bg-gradient-to-l from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white text-xl font-bold rounded-2xl transition-all shadow-lg"
                  >
                    שחק שוב
                  </button>
                </div>
              </div>
            )}
          </div>

          { }
          {/* הצגת תמונת מטרה צידית קטנה (צד שמאל / שני במובייל) */}
          {puzzleImage && (
            <div className="w-full lg:w-80 flex flex-col items-center bg-slate-800/80 p-5 rounded-[2rem] border border-slate-600 shadow-2xl order-2">
              <h3 className="text-slate-200 font-bold mb-4 text-xl flex items-center justify-between w-full">
                <div className="flex items-center gap-2">
                  <span>🎯</span> תמונת המטרה
                </div>
              </h3>

              {showTargetImage ? (
                <div className="rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 w-full aspect-square bg-slate-900 transition-all">
                  <img src={puzzleImage} alt="תמונת המטרה המלאה" className="w-full h-full object-cover" />
                </div>
              ) : (
                <div className="rounded-xl border-4 border-dashed border-slate-600 w-full aspect-square bg-slate-900/50 flex items-center justify-center transition-all">
                  <p className="text-slate-400 font-medium">התמונה מוסתרת</p>
                </div>
              )}

              <button
                onClick={() => setShowTargetImage(!showTargetImage)}
                className="mt-4 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-medium rounded-lg transition-colors border border-slate-500 w-full"
              >
                {showTargetImage ? "הסתר תמונה 👁️‍🗨️" : "הצג תמונה 👁️"}
              </button>

              {gameMode === 'numbers' && (
                <div className="mt-5 p-3 bg-indigo-900/40 border border-indigo-500/30 rounded-xl text-center">
                  <p className="text-sm text-indigo-200 font-medium">אתה משחק כרגע במצב מספרים, אבל התמונה נשמרת כאן למקרה שתרצה לחזור אליה! 🖼️</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* מודאל (חלון קופץ) עבור סרטוני ההדרכה */}
      {isTutorialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-800 p-6 md:p-8 rounded-[2rem] border border-slate-600 shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">

            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-yellow-500">
                סרטוני הדרכה 🎓
              </h2>
              <button
                onClick={() => setIsTutorialOpen(false)}
                className="text-slate-400 hover:text-rose-400 transition-colors text-4xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="overflow-y-auto pr-2 flex flex-col gap-6 flex-1 pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#475569 #1e293b' }}>
              {TUTORIAL_VIDEOS.map(video => (
                <div key={video.id} className="bg-slate-900/70 p-4 rounded-2xl border border-slate-700 shadow-inner">
                  <h3 className="text-xl font-bold text-slate-200 mb-3 pl-2 border-l-4 border-amber-400">{video.title}</h3>
                  <video
                    controls
                    className="w-full rounded-xl shadow-md bg-black"
                    preload="metadata"
                  >
                    <source src={video.src} type="video/mp4" />
                    הדפדפן שלך לא תומך בהצגת סרטוני וידאו.
                  </video>
                </div>
              ))}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
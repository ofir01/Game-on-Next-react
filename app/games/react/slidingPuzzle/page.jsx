"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import AIComponent from './AIComponent'; // ודא שהנתיב תואם

// --- הגדרות המשחק ---
const TILE_MARGIN = 4;

const DIFFICULTY_CONFIG = {
  easy: { label: 'קל (3x3)', size: 3, tileSize: 140 },
  medium: { label: 'בינוני (4x4)', size: 4, tileSize: 110 },
  hard: { label: 'קשה (5x5)', size: 5, tileSize: 85 }
};

const TUTORIAL_VIDEOS = [
  { id: 1, title: 'איך לפתור פאזל 3x3 (דוגמה)', src: 'https://www.w3schools.com/html/mov_bbb.mp4' },
  { id: 2, title: 'טריקים למתקדמים (דוגמה)', src: 'https://www.w3schools.com/html/mov_bbb.mp4' }
];

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
  const [puzzleImage, setPuzzleImage] = useState(null);
  const [gameMode, setGameMode] = useState('numbers');
  const [showTargetImage, setShowTargetImage] = useState(true);
  
  // --- AI Generation State ---
  const [themeInput, setThemeInput] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // --- Tutorials State ---
  const [isTutorialOpen, setIsTutorialOpen] = useState(false);

  const getValidNeighbors = (index, size) => {
    const neighbors = [];
    const row = Math.floor(index / size);
    const col = index % size;

    if (row > 0) neighbors.push(index - size);
    if (row < size - 1) neighbors.push(index + size);
    if (col > 0) neighbors.push(index - 1);
    if (col < size - 1) neighbors.push(index + 1);

    return neighbors;
  };

  const initializeGame = useCallback(() => {
    let newBoard = Array.from({ length: gridSize * gridSize - 1 }, (_, i) => i + 1);
    newBoard.push(0);

    let emptyIndex = newBoard.length - 1;
    const shuffleCount = gridSize * gridSize * 15;
    let lastIndex = -1;

    for (let i = 0; i < shuffleCount; i++) {
      const neighbors = getValidNeighbors(emptyIndex, gridSize);
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
  }, [gridSize]);

  useEffect(() => {
    initializeGame();
  }, [gridSize, initializeGame]);

  const handleDifficultyChange = (level) => {
    setDifficulty(level);
    setGridSize(DIFFICULTY_CONFIG[level].size);
    setTileSize(DIFFICULTY_CONFIG[level].tileSize);
  };

  const handleTileClick = (index) => {
    if (isWon || !isPlaying) return;

    const emptyIndex = board.indexOf(0);
    const validNeighbors = getValidNeighbors(emptyIndex, gridSize);

    if (validNeighbors.includes(index)) {
      const newBoard = [...board];
      newBoard[emptyIndex] = newBoard[index];
      newBoard[index] = 0;

      setBoard(newBoard);
      setMoves(moves + 1);
      checkWin(newBoard);
    }
  };

  const checkWin = (currentBoard) => {
    for (let i = 0; i < currentBoard.length - 1; i++) {
      if (currentBoard[i] !== i + 1) return;
    }
    setIsWon(true);
    setIsPlaying(false);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPuzzleImage(reader.result);
        setGameMode('picture');
        initializeGame();
      };
      reader.readAsDataURL(file);
    }
  };

  // פונקציית דמה ליצירת תמונה - תחליף בלוגיקה האמיתית שלך
  const handleGenerateAIPuzzleImage = async () => {
    if (!themeInput.trim()) return;
    setIsGeneratingImage(true);
    // TODO: קריאה ל-API של יצירת תמונה
    setTimeout(() => {
        setIsGeneratingImage(false);
        // לאחר קבלת התמונה - עדכן את setPuzzleImage(url) ו-setGameMode('picture')
    }, 2000);
  };

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
      color: 'transparent'
    };
  };

  const showImage = gameMode === 'picture' && puzzleImage;

  // --- אובייקט מצב המשחק שיועבר לקומפוננטת ה-AI ---
  const gameState = {
    board,
    moves,
    isWon,
    isPlaying,
    gridSize,
    difficulty,
    gameMode
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-900 flex flex-col items-center py-10 px-4 font-sans text-slate-100 overflow-x-hidden">
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
        `}
      </style>
      <div className="absolute inset-0 animated-gradient-bg -z-10 opacity-80"></div>

      <div className="w-full max-w-6xl flex flex-col items-center gap-8 z-10">

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 drop-shadow-md mb-2">
            פאזל הזזה חכם 🧩
          </h1>
          <p className="text-slate-300 text-lg">שחק במספרים או צור/העלה תמונה למשחק!</p>
        </div>

        <div className="w-full max-w-4xl bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl shadow-2xl border border-slate-700/50">

          <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 pb-6 border-b border-slate-700">
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

              <button
                onClick={() => setIsTutorialOpen(true)}
                className="px-4 py-2 rounded-lg font-bold transition-all text-sm text-amber-300/80 hover:text-amber-300 hover:bg-slate-700/50 flex items-center gap-1 border-r border-slate-700 mr-1 pr-3"
              >
                🎓 הדרכות
              </button>
            </div>

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

          {/* שילוב קומפוננטת ה-AI החיצונית */}
          <AIComponent 
             gameName="פאזל הזזה"
             gameState={gameState} 
             showImageControls={true} 
             themeInput={themeInput}
             setThemeInput={setThemeInput}
             isGeneratingImage={isGeneratingImage}
             generateAIPuzzleImage={handleGenerateAIPuzzleImage}
             handleImageUpload={handleImageUpload}
          />

        </div>

        {/* --- אזור המשחק הראשי מופיע כאן כמו קודם --- */}
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center w-full">
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
                    className={`absolute flex items-center justify-center font-black rounded-xl cursor-pointer select-none transition-all duration-300 ease-out hover:scale-[0.96] hover:brightness-110 shadow-lg border-2 ${!showImage ? (isCorrectPosition ? 'bg-gradient-to-br from-slate-600 to-slate-700 border-slate-500 text-emerald-200 shadow-none' : 'bg-gradient-to-br from-indigo-500 to-blue-600 border-indigo-400 text-white') : ''} ${showImage && isCorrectPosition ? 'border-emerald-400/50' : 'border-slate-900/40'}`}
                    style={{
                      width: tileSize,
                      height: tileSize,
                      top: topPosition,
                      right: rightPosition,
                      fontSize: `${tileSize * 0.4}px`,
                      transitionProperty: 'top, right, transform, border-color, background-color',
                      ...tileBgStyle
                    }}
                  >
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

      {isTutorialOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
           {/* ... מודל ההדרכות נשאר ללא שינוי ... */}
        </div>
      )}
    </div>
  );
}
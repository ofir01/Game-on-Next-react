"use client";

import React, { useState, useEffect } from 'react';
import './App.css'; // נניח שיש קובץ CSS בסיסי לעיצוב

// --- משתני עזר לסימולציה של נתיבי תמונות וסאונד ---
// בפרויקט אמיתי יש לייבא תמונות אמיתיות
const ASSETS = {
  questionMark: "https://via.placeholder.com/100x100?text=?", 
  animals: Array.from({ length: 9 }, (_, i) => `https://via.placeholder.com/100x100/FF5733/FFFFFF?text=Animal${i + 1}`),
  background: "#2c3e50", // צבע רקע במקום תמונה כבדה
  sounds: {
    success: new Audio('https://www.soundjay.com/misc/sounds/bell-ringing-05.mp3'), // סאונד לדוגמה
    failure: new Audio('https://www.soundjay.com/button/sounds/button-10.mp3'), // סאונד לדוגמה
  }
};

// --- רכיב ראשי ---
function App() {
  // ניהול מסכים: 'login', 'level', 'game'
  const [currentScreen, setCurrentScreen] = useState('login');
  
  // נתוני שחקן
  const [playerData, setPlayerData] = useState({ name: '', password: '' });
  
  // נתוני משחק
  const [level, setLevel] = useState(1);

  // פונקציה לשינוי מסך
  const navigate = (screen) => {
    setCurrentScreen(screen);
  };

  // רינדור המסך המתאים
  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: ASSETS.background, color: 'white', textAlign: 'center', fontFamily: 'Arial' }}>
      {currentScreen === 'login' && (
        <LoginScreen 
          setPlayerData={setPlayerData} 
          onLogin={() => navigate('level')} 
        />
      )}

      {currentScreen === 'level' && (
        <LevelScreen 
          playerName={playerData.name}
          onSelectLevel={(selectedLevel) => {
            setLevel(selectedLevel);
            navigate('game');
          }} 
        />
      )}

      {currentScreen === 'game' && (
        <GameScreen 
          level={level} 
          playerData={playerData}
          onBack={() => navigate('level')}
          onReset={() => navigate('game')} // טריק לאיפוס פשוט ע"י רינדור מחדש
        />
      )}
    </div>
  );
}

// --- מסך 1: התחברות ---
function LoginScreen({ setPlayerData, onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username && password) {
      setPlayerData({ name: username, password: password });
      onLogin();
    } else {
      alert("Please enter both username and password");
    }
  };

  return (
    <div style={{ padding: '50px' }}>
      <h1>Welcome to the Guessing Game</h1>
      <div style={{ background: 'rgba(255,255,255,0.1)', padding: '40px', borderRadius: '10px', display: 'inline-block' }}>
        <h2>Registration / Login</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '300px' }}>
          <input 
            type="text" 
            placeholder="Username" 
            value={username} 
            onChange={(e) => setUsername(e.target.value)}
            style={{ padding: '10px' }}
          />
          <div style={{ display: 'flex', gap: '5px' }}>
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)}
              style={{ flex: 1, padding: '10px' }}
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <button type="submit" style={{ padding: '10px', background: 'orange', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Login
          </button>
        </form>
      </div>
    </div>
  );
}

// --- מסך 2: בחירת רמה ---
function LevelScreen({ playerName, onSelectLevel }) {
  return (
    <div style={{ padding: '50px' }}>
      <h1>💀 CHOOSE YOUR LEVEL 💀</h1>
      <p>Hello, {playerName}</p>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '50px' }}>
        {[1, 2, 3].map((lvl) => (
          <button 
            key={lvl} 
            onClick={() => onSelectLevel(lvl)}
            style={{ 
              padding: '30px', 
              fontSize: '20px', 
              cursor: 'pointer', 
              background: '#f0ad4e', 
              border: '2px solid white',
              borderRadius: '10px'
            }}
          >
            Level {lvl}
          </button>
        ))}
      </div>
    </div>
  );
}

// --- מסך 3: המשחק עצמו ---
function GameScreen({ level, playerData, onBack }) {
  // קבועים
  const MAX_MOVES = 20;
  const TOTAL_SLOTS = level * 3; // 3 עמודות * מספר שורות (רמה)

  // State
  const [moves, setMoves] = useState(0);
  const [shuffledTargets, setShuffledTargets] = useState([]); // המיקומים הנכונים (מזהי תמונות)
  const [placedItems, setPlacedItems] = useState({}); // איפה המשתמש הניח תמונות: { slotIndex: imageId }
  const [gameStatus, setGameStatus] = useState('playing'); // playing, won, lost
  const [rowProgress, setRowProgress] = useState(Array(level).fill(0)); // התקדמות לכל שורה

  // אתחול המשחק (מקביל ל-START_GAME והגרלת המיקומים)
  useEffect(() => {
    // יצירת מערך של מזהים (0 עד 8)
    let positions = Array.from({ length: 9 }, (_, i) => i);
    // ערבוב (Shuffle)
    for (let i = positions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [positions[i], positions[j]] = [positions[j], positions[i]];
    }
    // לקיחת רק את כמות התמונות הנדרשת לרמה זו
    // אבל לפי הלוגיקה המקורית, יש מאגר של תמונות והגרלה של מיקומים
    // כאן נפשט: shuffledTargets הם ה-IDs שצריכים להיות בכל סלוט (0 עד TOTAL_SLOTS-1)
    
    // בוא נצמד ללוגיקה המקורית: יש 9 תמונות. אנו בוחרים מיקומים אקראיים ל"תשובות".
    // כדי לפשט ל-React: כל סלוט יקבל ID נכון אקראי.
    const targets = positions.slice(0, TOTAL_SLOTS);
    setShuffledTargets(targets);

    // השמעת מוזיקה (הערה: בדפדפנים חוסמים אוטומטית, נדרשת אינטראקציה)
    // new Audio('path/to/music.mp3').play();
  }, [level, TOTAL_SLOTS]);

  // לוגיקת גרירה (HTML5 DND)
  const handleDragStart = (e, imageId) => {
    e.dataTransfer.setData("imageId", imageId);
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // חובה כדי לאפשר Drop
  };

  const handleDrop = (e, slotIndex) => {
    e.preventDefault();
    if (gameStatus !== 'playing') return;

    const imageId = parseInt(e.dataTransfer.getData("imageId"));
    
    // עדכון המיקום: סלוט X מכיל תמונה Y
    const newPlacedItems = { ...placedItems, [slotIndex]: imageId };
    setPlacedItems(newPlacedItems);
  };

  // הסרה של תמונה מסלוט (קליק ימני בקוד המקורי)
  const handleRemoveItem = (e, slotIndex) => {
    e.preventDefault(); // מניעת תפריט קליק ימני
    if (gameStatus !== 'playing') return;
    
    const newPlacedItems = { ...placedItems };
    delete newPlacedItems[slotIndex];
    setPlacedItems(newPlacedItems);
  };

  // פונקציית בדיקה (Check)
  const checkGame = () => {
    let correctCount = 0;
    let newMoves = moves + 1;
    
    // חישוב ניקוד ושורות
    const newRowProgress = [...rowProgress];

    // בדיקת התאמות מדויקות
    shuffledTargets.forEach((targetId, index) => {
      if (placedItems[index] === targetId) {
        correctCount++;
      }
    });

    // בדיקת "אותה שורה" (Logic simplified from python same_line)
    // הקוד המקורי בודק אם התמונה קיימת בטווח האינדקסים של השורה
    for (let row = 0; row < level; row++) {
      let rowCorrect = 0;
      const start = row * 3;
      const end = start + 3;
      
      // אילו תמונות אמורות להיות בשורה זו?
      const targetIdsInRow = shuffledTargets.slice(start, end);
      
      // אילו תמונות הונחו בשורה זו?
      for (let i = start; i < end; i++) {
        if (placedItems[i] !== undefined && targetIdsInRow.includes(placedItems[i])) {
            rowCorrect++;
        }
      }
      newRowProgress[row] = (rowCorrect / 3) * 100;
    }

    setRowProgress(newRowProgress);
    setMoves(newMoves);

    // בדיקת ניצחון
    if (correctCount === TOTAL_SLOTS) {
      setGameStatus('won');
      ASSETS.sounds.success.play().catch(e => console.log("Audio play failed"));
      mockSaveToDB(playerData, newMoves, level);
      alert("Congratulations! All images are in the correct positions!");
    } else if (newMoves >= MAX_MOVES) {
      setGameStatus('lost');
      ASSETS.sounds.failure.play().catch(e => console.log("Audio play failed"));
      alert("Error: You failed!");
    }
  };

  // סימולציית שמירה ב-DB
  const mockSaveToDB = (player, score, lvl) => {
    console.log("SAVING TO MYSQL (MOCK):");
    console.log(`INSERT INTO guessingPicturegame (player_name, password, CheckMoves, Level) VALUES ('${player.name}', '${player.password}', ${score}, '${lvl}')`);
  };

  // חישוב אילו תמונות כבר הונחו כדי לא להציג אותן במאגר למטה
  const placedImageIds = Object.values(placedItems);

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* צד שמאל: לוח המשחק */}
      <div style={{ flex: 3, padding: '20px' }}>
        <h2>Level: {level} | Moves: {moves}/{MAX_MOVES}</h2>
        
        {/* יצירת הגריד */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(3, 1fr)', 
          gap: '20px', 
          maxWidth: '600px', 
          margin: '0 auto' 
        }}>
          {Array.from({ length: TOTAL_SLOTS }).map((_, index) => {
            const contentId = placedItems[index];
            const isFilled = contentId !== undefined;

            return (
              <div 
                key={index}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
                onContextMenu={(e) => handleRemoveItem(e, index)}
                style={{
                  width: '100px',
                  height: '100px',
                  border: '2px dashed #aaa',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  position: 'relative'
                }}
              >
                {/* תמונת שאלה או תמונה שנגררה */}
                <img 
                  src={isFilled ? ASSETS.animals[contentId] : ASSETS.questionMark} 
                  alt="slot" 
                  style={{ width: '80%', height: '80%', pointerEvents: 'none' }}
                />
                <span style={{ position: 'absolute', top: 0, left: 0, fontSize: '10px' }}>Slot {index}</span>
              </div>
            );
          })}
        </div>

        {/* כפתור בדיקה */}
        <button 
          onClick={checkGame} 
          disabled={gameStatus !== 'playing'}
          style={{ marginTop: '30px', padding: '15px 40px', fontSize: '18px', background: 'green', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          CHECK
        </button>

        <button 
          onClick={onBack} 
          style={{ marginTop: '30px', marginLeft: '10px', padding: '15px', background: 'red', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          EXIT
        </button>
      </div>

      {/* צד ימין: סטטוס ובנק תמונות */}
      <div style={{ flex: 1, background: 'rgba(0,0,0,0.2)', padding: '20px', display: 'flex', flexDirection: 'column' }}>
        <h3>Progress Check</h3>
        {rowProgress.map((prog, idx) => (
          <div key={idx} style={{ marginBottom: '10px', textAlign: 'left' }}>
            <span>Row {idx + 1}: {Math.round(prog)}%</span>
            <div style={{ width: '100%', background: '#eee', height: '10px' }}>
              <div style={{ width: `${prog}%`, background: 'blue', height: '100%' }}></div>
            </div>
          </div>
        ))}
        
        <hr />
        <h3>Drag Animals:</h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', justifyContent: 'center' }}>
          {ASSETS.animals.map((src, id) => {
            // אם התמונה כבר מונחת בלוח, אל תציג אותה בבנק (אופציונלי, מדמה את ההזזה)
            const isPlaced = placedImageIds.includes(id);
            
            return (
              <div 
                key={id}
                draggable={!isPlaced}
                onDragStart={(e) => handleDragStart(e, id)}
                style={{ 
                  opacity: isPlaced ? 0.3 : 1, 
                  cursor: isPlaced ? 'default' : 'grab',
                  border: '1px solid white'
                }}
              >
                <img src={src} alt={`animal-${id}`} style={{ width: '80px', height: '80px', display: 'block' }} />
              </div>
            );
          })}
        </div>
        <p style={{fontSize: '12px', marginTop: '20px'}}>
            * Right click on a slot to remove image<br/>
            * Drag from here to slots
        </p>
      </div>
    </div>
  );
}

export default App;
"use client";


import { useMemo } from "react";
import "./Percentage.css";

// זמן אנימציה בשניות (duration) 
export default function Percentage({ done = 0, pending = 0, turnedIn = 0, failed = 0, duration = 1.6 }) {
  const {
    donePctNum,
    pendingPctNum,
    turnedPctNum,
    failedPctNum,
    // מצטברים למען ה־gradient
    cum1,
    cum2,
    cum3,
    // מחרוזות עם אחוזים לשימוש ב־style
    cum1s,
    cum2s,
    cum3s
  } = useMemo(() => {
    const total = done + pending + turnedIn + failed;
    if (total === 0) {
      return {
        donePctNum: 0,
        pendingPctNum: 0,
        turnedPctNum: 0,
        failedPctNum: 0,
        cum1: 0,
        cum2: 0,
        cum3: 0,
        cum1s: "0%",
        cum2s: "0%",
        cum3s: "0%"
      };
    }

    const doneP = (done / total) * 100;
    const pendingP = (pending / total) * 100;
    const turnedP = (turnedIn / total) * 100;
    const failedP = (failed / total) * 100;

    const cum1 = doneP;
    const cum2 = doneP + pendingP;
    const cum3 = doneP + pendingP + turnedP;

    return {
      donePctNum: +doneP.toFixed(1),
      pendingPctNum: +pendingP.toFixed(1),
      turnedPctNum: +turnedP.toFixed(1),
      failedPctNum: +failedP.toFixed(1),
      cum1,
      cum2,
      cum3,
      cum1s: `${cum1.toFixed(1)}%`,
      cum2s: `${cum2.toFixed(1)}%`,
      cum3s: `${cum3.toFixed(1)}%`
    };
  }, [done, pending, turnedIn, failed]);

  // מפתח ייחודי שיעלה את האלמנט מחדש כשאחוזים משתנים -> אנימציה רצה מחדש
  const fillKey = `${cum1s}-${cum2s}-${cum3s}`;

  // מייצרים את ה־gradient לפי האחוזים המצטברים
  const gradient = `linear-gradient(to right,
  #10b981 0%, #10b981 ${cum1s},      
  #f59e0b ${cum1s}, #f59e0b ${cum2s},   
  #3b82f6 ${cum2s}, #3b82f6 ${cum3s},    
  #ef4444 ${cum3s}, #ef4444 100%         
)`;






  return (
    <div className="mixed-bar-container">
      <div className="mixed-title">מדד התקדמות משימות</div>
      <div className="mixed-bar-track">
        {/* האלמנט שממלא את הפס - key משנה רינדור כדי לאתחל אנימציה */}
        <div
          key={fillKey}
          className="mixed-bar-fill"
          style={{
            background: gradient,
            // יחס זמן האנימציה - העברת משך כ־CSS var (אופציונלי)
            animationDuration: `${duration}s`
          }}
        />
      </div>

      <div className="mixed-info">
        <span className="done">בוצע ({donePctNum}%)</span>
        <span className="pending">ממתין ({pendingPctNum}%)</span>
        <span className="turned">נמסר ({turnedPctNum}%)</span>
        <span className="failed">נכשל ({failedPctNum}%)</span>
      </div>
    </div>
  );
}

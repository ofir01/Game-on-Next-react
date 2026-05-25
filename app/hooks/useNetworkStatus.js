import { useState, useEffect } from 'react';

export function useNetworkStatus() {
  const [status, setStatus] = useState({
    online: true,
    downlink: 0,   // מהירות הורדה משוערת (Mb/s)
    rtt: 0,        // פינג (Ping) במילי-שניות
    saveData: false,
    type: 'wifi'   // סוג חיבור (wifi, 4g, etc.)
  });

  useEffect(() => {
    const handleStatusChange = () => {
      // API מודרני לבדיקת חיבור (נתמך בכרום/אדג')
      const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
      
      if (connection) {
        setStatus({
          online: navigator.onLine,
          downlink: connection.downlink, // מהירות
          rtt: connection.rtt,           // פינג משוער
          saveData: connection.saveData,
          type: connection.effectiveType
        });
      } else {
        // דפדפנים ישנים (פיירפוקס/ספארי) - תמיכה בסיסית
        setStatus(prev => ({
          ...prev,
          online: navigator.onLine,
          type: 'unknown'
        }));
      }
    };

    // בדיקה ראשונית
    handleStatusChange();

    // מאזינים
    window.addEventListener('online', handleStatusChange);
    window.addEventListener('offline', handleStatusChange);
    
    // האזנה לשינויים בתוך אובייקט החיבור (אם קיים)
    if (navigator.connection) {
      navigator.connection.addEventListener('change', handleStatusChange);
    }

    return () => {
      window.removeEventListener('online', handleStatusChange);
      window.removeEventListener('offline', handleStatusChange);
      if (navigator.connection) {
        navigator.connection.removeEventListener('change', handleStatusChange);
      }
    };
  }, []);

  return status;
}
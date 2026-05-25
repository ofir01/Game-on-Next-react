'use client';
import React from 'react';
import { Wifi, WifiOff, Activity } from 'lucide-react';
import { useNetworkStatus } from '../../hooks/useNetworkStatus'; // שים לב לנתיב

export default function NetworkWidget() {
  const { online, rtt, type } = useNetworkStatus();

  // לוגיקה לקביעת צבע ומצב
  const getStatusColor = () => {
    if (!online) return 'border-red-500/50 text-red-500 bg-red-950/80';
    if (rtt > 200 && type !== 'unknown') return 'border-yellow-500/50 text-yellow-500 bg-yellow-950/80'; // פינג גבוה
    return 'border-green-500/50 text-green-500 bg-slate-950/80'; // מצב תקין
  };

  const getConnectionLabel = () => {
    if (!online) return 'DISCONNECTED';
    if (type === 'unknown') return ' CONNECTED';
    return `${type.toUpperCase()} | ${rtt}ms`;
  };

  return (
    <div className={`fixed bottom-4 left-4 z-50 flex items-center gap-3 px-4 py-2 rounded-lg border backdrop-blur-md shadow-lg transition-all duration-500 font-mono text-xs tracking-wider select-none
      ${getStatusColor()}
      ${!online ? 'animate-pulse' : 'hover:scale-105'}
    `}>
      
      {/* אייקון ה-Wifi או הפעילות */}
      <div className="relative">
        {online ? <Wifi size={16} /> : <WifiOff size={16} />}
        {online && (
          <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${online ? 'bg-current' : 'hidden'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${online ? 'bg-current' : 'hidden'}`}></span>
          </span>
        )}
      </div>

      {/* טקסט המידע */}
      <div className="flex flex-col">
        {/* <span className="font-bold leading-none mb-0.5">NET_STATUS</span> */}
        <div className="flex items-center gap-1 opacity-80 text-[10px]">
           {online && <Activity size={10} />}
           <span>{getConnectionLabel()}</span>
        </div>
      </div>
    </div>
  );
}
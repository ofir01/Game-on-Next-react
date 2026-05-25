'use client';

import { toast } from 'sonner';
import React, { useState } from 'react';
import { Users, User, MessageSquare, AlertTriangle, Send, Globe } from 'lucide-react';
import { authService } from '../../../services/client/authService';

export default function Userss() {
    const [userEmail, setUserEmail] = useState('');
    const [message, setmessage] = useState('');
    const [selectedType, setSelectedType] = useState("Warning");

    // מצב חדש: האם שולחים לאחד או לכולם ('single' | 'all')
    const [targetMode, setTargetMode] = useState('single');

    // רשימת כל האפשרויות
    const messageOptions = [
        { id: "Warning", label: '⚠️ אזהרה 1: שפה לא נאותה' },
        { id: "Content_Removed", label: '⛔ אזהרה 2: הסרת תוכן' },
        { id: "FINAL_WARNING", label: '🛑 אזהרה 3: לפני חסימה' },
        { id: "System_Message", label: '📝 הודעה חופשית / עדכון מערכת' },
    ];

    // לוגיקה לסינון האפשרויות לפי המצב הנבחר
    // אם נבחר "כל המשתמשים" - מציגים רק את אופציה 4. אחרת מציגים הכל.
    const displayedOptions = targetMode === 'all'
        ? messageOptions.filter(opt => opt.id === "System_Message")
        : messageOptions;

    const handleUserAction = async (actionType) => {
        try {
            if (actionType === 'send_message') {
                // ולידציה 1: אם זה משתמש יחיד - חובה אימייל
                if (targetMode === 'single' && !userEmail) {
                    return toast.error('נא להזין כתובת אימייל בצד ימין');
                }

                // ולידציה 2: אם נבחרה הודעה חופשית - חובה תוכן
                if (selectedType === "System_Message" && !message.trim()) {
                    return toast.error('חובה לכתוב תוכן עבור הודעה חופשית');
                }

                // אישור לפני שליחה לכולם (כדי למנוע טעויות קריטיות)
                if (targetMode === 'all') {
                    if (!confirm('⚠️ שים לב: אתה עומד לשלוח הודעה לכל המשתמשים במערכת. האם להמשיך?')) {
                        return;
                    }
                }

                // בניית הפיילוד לשרת
                const payload = {
                    email: targetMode === 'single' ? userEmail : undefined, // אימייל רלוונטי רק ליחיד
                    sendToAll: targetMode === 'all', // דגל לשרת: שלח לכולם
                    type: selectedType,
                    customMessage: selectedType === "System_Message" ? message : undefined
                };

                const res = await authService.sendMessage(payload);

                const successMsg = targetMode === 'all'
                    ? 'ההודעה נשלחה בהצלחה לכל המשתמשים!'
                    : `ההודעה נשלחה בהצלחה ל-${userEmail}`;

                toast.success(successMsg);
                setmessage('');

            } else if (actionType === 'delete') {
                // מחיקה תמיד דורשת אימייל (אין מחיקה גורפת כאן לבטיחות)
                if (!userEmail) return toast.error('נא להזין כתובת אימייל למחיקה');

                if (confirm('מחיקת משתמש היא פעולה בלתי הפיכה. להמשיך?')) {
                    const res = await authService.deleteUser(userEmail);
                    toast.success('המשתמש הוסר בהצלחה');
                    setUserEmail('');
                }
            }
        } catch (err) {
            console.error(err);
            const errMsg = err.response?.data?.error || err.response?.data?.message || err.message;
            toast.error('שגיאה: ' + errMsg);
        }
    };





    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
            {/* צד שמאל: ניהול משתמש ספציפי (מחיקה / בחירת משתמש) */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6 h-fit">
                <div className="flex items-center gap-3 text-red-400">
                    <Users size={24} />
                    <h2 className="text-xl font-bold uppercase italic">User Management</h2>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase ml-1">Target User Email</label>
                    <input
                        type="email"
                        className={`w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-red-500 outline-none transition-all ${targetMode === 'all' ? 'opacity-50 cursor-not-allowed' : ''}`}
                        placeholder="player@nexus.com"
                        value={userEmail}
                        onChange={(e) => setUserEmail(e.target.value)}
                        disabled={targetMode === 'all'} // נועלים את האימייל אם שולחים לכולם
                    />
                    {targetMode === 'all' && (
                        <p className="text-xs text-blue-400 mt-1">* Email input disabled while "All Users" is selected</p>
                    )}
                </div>

                <div className="pt-4 border-t border-slate-800 mt-4">
                    <button
                        onClick={() => handleUserAction('delete')}
                        disabled={targetMode === 'all'} // לא מאפשרים מחיקה כשנמצאים במצב "כולם" כדי למנוע בלבול
                        className={`w-full border border-red-900/50 text-red-500 py-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 
                        ${targetMode === 'all' ? 'opacity-30 cursor-not-allowed' : 'hover:bg-red-950/50 hover:border-red-500'}`}
                    >
                        <AlertTriangle size={18} /> BAN & REMOVE USER
                    </button>
                </div>
            </div>

            {/* צד ימין: מערכת ההודעות */}
            <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-blue-400">
                        <MessageSquare size={24} />
                        <h2 className="text-xl font-bold uppercase italic">System Notification</h2>
                    </div>
                </div>

                {/* טאבים לבחירת קהל היעד */}
                <div className="flex p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button
                        onClick={() => {
                            setTargetMode('single');
                            setSelectedType("Warning"); // החזרה לברירת מחדל כשחוזרים ליחיד
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${targetMode === 'single' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <User size={16} /> Single User
                    </button>
                    <button
                        onClick={() => {
                            setTargetMode('all');
                            setSelectedType("System_Message"); // במצב "כולם" מכריחים בחירה של הודעה חופשית
                        }}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-bold transition-all ${targetMode === 'all' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Globe size={16} /> All Users
                    </button>
                </div>

                {/* חיווי למצב "כל המשתמשים" */}
                {targetMode === 'all' && (
                    <div className="bg-blue-900/20 border border-blue-500/30 p-3 rounded-xl flex items-center gap-3 animate-in fade-in duration-300">
                        <Globe className="text-blue-400" size={20} />
                        <span className="text-xs text-blue-200">
                            Broadcast Mode: sending global update to <strong>ALL</strong> users.
                        </span>
                    </div>
                )}

                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Select Message Type</label>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            // אם אנחנו במצב "כולם" - ה-Select לא מאפשר בחירה (כי יש רק אופציה אחת), אבל ויזואלית זה נשאר
                            disabled={targetMode === 'all'}
                            className={`w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer ${targetMode === 'all' ? 'opacity-70' : ''}`}
                        >
                            {displayedOptions.map((option) => (
                                <option key={option.id} value={option.id}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedType === "System_Message" && (
                        <div className="space-y-2 animate-in fade-in zoom-in duration-300">
                            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Custom Message Content</label>
                            <textarea
                                className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 h-32 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                                placeholder={targetMode === 'all' ? "Write a global update message..." : "Type your custom warning here..."}
                                value={message}
                                onChange={(e) => setmessage(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <button
                    onClick={() => handleUserAction('send_message')}
                    className={`w-full py-4 rounded-2xl font-black shadow-lg transition-all flex items-center justify-center gap-2 mt-4 
                    ${targetMode === 'all'
                            ? 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-900/20'
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'}`}
                >
                    <Send size={18} />
                    {targetMode === 'all' ? 'BROADCAST TO EVERYONE' : 'SEND NOTIFICATION'}
                </button>
            </div>
        </div>
    );
}
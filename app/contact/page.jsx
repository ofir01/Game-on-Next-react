'use client';

import React, { useState } from 'react';
import { Mail, User, MessageSquare, Send, CheckCircle2, ShieldAlert, Terminal, Crosshair } from 'lucide-react';
import { contactMessageService } from '../../services/client/ContactMessage';
import { toast } from 'sonner';

export default function ContactUsForm() {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        subject: '',
        message: '',
        _honeypot: '' // שדה נסתר לבוטים
    });

    const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'
    const [focusedField, setFocusedField] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('loading');

        const payload = {
            fullName: formData.fullName,
            email: formData.email,
            subject: formData.subject || 'פנייה כללית',
            message: formData.message,
            _honeypot: formData._honeypot
        };

        try {
            // קריאה ישירה לשרת עם ה-Header המותאם אישית שלך

            const res = await contactMessageService.create(payload);

            if (res.error) {
                throw new Error(res.error);
            }

            setStatus('success');
            setFormData({ fullName: '', email: '', subject: '', message: '', _honeypot: '' });

            // חזרה למצב רגיל אחרי 5 שניות
            setTimeout(() => setStatus('idle'), 5000);
        } catch (error) {
            console.error(error);
            setStatus('error');
            setTimeout(() => setStatus('idle'), 3000);
        }
    };

    return (
        <div className="relative min-h-screen bg-slate-950 flex items-center justify-center p-4 overflow-hidden font-sans" dir="rtl">

            {/* רקע גיימינג - Grid ו-Glow */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-cyan-600/20 rounded-full blur-[120px]"></div>
            </div>

            {/* קונטיינר הטופס */}
            <div className="relative z-10 w-full max-w-4xl grid md:grid-cols-5 gap-0 bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-[0_0_50px_-12px_rgba(168,85,247,0.25)] overflow-hidden">

                {/* צד ימין - מידע ותמיכה */}
                <div className="md:col-span-2 bg-gradient-to-br from-purple-900/40 to-slate-900/90 p-10 border-l border-slate-800 hidden md:flex flex-col justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-sm font-mono mb-8">
                            <Terminal className="w-4 h-4" />
                            <span>System.CommLink()</span>
                        </div>
                        <h2 className="text-4xl font-black text-white mb-4 tracking-tight">
                            תמיכה <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">טקטית</span>
                        </h2>
                        <p className="text-slate-400 leading-relaxed mb-8">
                            נתקלת בבאג? צ'יטר הרס לך את המשחק? או סתם רוצה להציע רעיון לפיצ'ר חדש לזירה? הצוות שלנו זמין ויענה בהקדם.
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex items-center gap-4 text-slate-300">
                            <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center border border-slate-700">
                                <ShieldAlert className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-white">תמיכה טכנית 24/7</h4>
                            </div>
                        </div>
                    </div>
                </div>

                {/* צד שמאל - הטופס עצמו */}
                <div className="md:col-span-3 p-8 sm:p-10">
                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* שדה Honeypot נסתר מבוטים */}
                        <input
                            type="text"
                            name="_honeypot"
                            style={{ display: 'none' }}
                            tabIndex="-1"
                            autoComplete="off"
                            value={formData._honeypot}
                            onChange={handleChange}
                        />

                        {/* כותרת למובייל */}
                        <div className="md:hidden mb-8">
                            <h2 className="text-3xl font-black text-white tracking-tight">צור קשר</h2>
                            <p className="text-sm text-slate-400 mt-2">הזן את פרטיך ונחזור אליך בהקדם.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            {/* שדה שם מלא */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">שם מלא / כינוי</label>
                                <div className={`relative flex items-center bg-slate-950/50 rounded-xl border transition-all duration-300 ${focusedField === 'fullName' ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-slate-800'}`}>
                                    <User className={`absolute right-4 w-5 h-5 transition-colors ${focusedField === 'fullName' ? 'text-purple-400' : 'text-slate-500'}`} />
                                    <input
                                        type="text" name="fullName" required
                                        value={formData.fullName} onChange={handleChange}
                                        onFocus={() => setFocusedField('fullName')} onBlur={() => setFocusedField(null)}
                                        className="w-full bg-transparent border-none text-white px-12 py-3.5 focus:ring-0 placeholder:text-slate-600 outline-none"
                                        placeholder="Player One"
                                    />
                                </div>
                            </div>

                            {/* שדה אימייל */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">דואר אלקטרוני</label>
                                <div className={`relative flex items-center bg-slate-950/50 rounded-xl border transition-all duration-300 ${focusedField === 'email' ? 'border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.2)]' : 'border-slate-800'}`}>
                                    <Mail className={`absolute right-4 w-5 h-5 transition-colors ${focusedField === 'email' ? 'text-cyan-400' : 'text-slate-500'}`} />
                                    <input
                                        type="email" name="email" required
                                        value={formData.email} onChange={handleChange}
                                        onFocus={() => setFocusedField('email')} onBlur={() => setFocusedField(null)}
                                        className="w-full bg-transparent border-none text-white px-12 py-3.5 focus:ring-0 placeholder:text-slate-600 outline-none"
                                        placeholder="gamer@domain.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* שדה נושא (Subject) */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">נושא הפנייה</label>
                            <div className={`relative flex items-center bg-slate-950/50 rounded-xl border transition-all duration-300 ${focusedField === 'subject' ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-slate-800'}`}>
                                <Crosshair className={`absolute right-4 w-5 h-5 transition-colors ${focusedField === 'subject' ? 'text-purple-400' : 'text-slate-500'}`} />
                                <select
                                    name="subject" required
                                    value={formData.subject} onChange={handleChange}
                                    onFocus={() => setFocusedField('subject')} onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent border-none text-white px-12 py-3.5 focus:ring-0 outline-none appearance-none cursor-pointer"
                                >
                                    <option value="" disabled className="bg-slate-900 text-slate-500">בחר נושא...</option>
                                    <option value="SUPPORT" className="bg-slate-900">דיווח על באג</option>
                                    <option value="SUPPORT" className="bg-slate-900">דיווח על שחקן / צ'יטר</option>
                                    <option value="SUPPORT" className="bg-slate-900">בעיית התחברות / משתמש</option>
                                    <option value="FEEDBACK" className="bg-slate-900">הצעת ייעול</option>
                                    <option value="PARTNERSHIP" className="bg-slate-900">שיתוף פעולה</option>
                                    <option value="GENERAL" className="bg-slate-900">אחר</option>
                                </select>
                            </div>
                        </div>

                        {/* שדה הודעה */}
                        <div className="space-y-2">
                            <div className="flex justify-between items-end">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">תיאור הפנייה</label>
                                <div className="flex flex-col items-end">
                                    <span className={`text-[10px] mb-1 font-medium transition-opacity duration-300 ${formData.message.length > 0 && formData.message.length < 10 ? 'text-orange-400 opacity-100' : 'opacity-0'}`}>
                                        מינימום 10 תווים נדרשים
                                    </span>
                                    <span className={`text-xs font-mono ${formData.message.length < 10 && formData.message.length > 0 ? 'text-orange-500' :
                                        formData.message.length > 500 ? 'text-red-400' : 'text-slate-500'
                                        }`}>
                                        {formData.message.length} / 500
                                    </span>
                                </div>
                            </div>
                            <div className={`relative bg-slate-950/50 rounded-xl border transition-all duration-300 ${focusedField === 'message' ? 'border-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.2)]' : 'border-slate-800'}`}>
                                <MessageSquare className={`absolute right-4 top-4 w-5 h-5 transition-colors ${focusedField === 'message' ? 'text-purple-400' : 'text-slate-500'}`} />
                                <textarea
                                    name="message" required maxLength={500} rows="4"
                                    value={formData.message} onChange={handleChange}
                                    onFocus={() => setFocusedField('message')} onBlur={() => setFocusedField(null)}
                                    className="w-full bg-transparent border-none text-white px-12 py-4 focus:ring-0 placeholder:text-slate-600 outline-none resize-none"
                                    placeholder="מה קרה? פרט כמה שיותר..."
                                ></textarea>
                            </div>
                        </div>

                        {/* כפתור שליחה */}
                        <button
                            type="submit"
                            // הכפתור יהיה חסום אם: טוען, הצליח, ההודעה קצרה מ-10 תווים, או שהמייל ריק
                            disabled={
                                status === 'loading' ||
                                status === 'success' ||
                                formData.message.length < 10 ||
                                !formData.email.includes('@') // בדיקה שהמייל לא ריק ומכיל @
                            }
                            className={`
        relative w-full h-14 rounded-xl font-black text-lg tracking-wider uppercase overflow-hidden transition-all duration-300
        flex items-center justify-center gap-2
        ${(formData.message.length < 10 || !formData.email.includes('@')) && status === 'idle'
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                    : status === 'success'
                                        ? 'bg-green-500 text-white shadow-[0_0_30px_rgba(34,197,94,0.4)]'
                                        : status === 'error'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-gradient-to-r from-purple-600 to-cyan-600 text-white hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] hover:scale-[1.02] active:scale-[0.98]'
                                }
        disabled:opacity-80 disabled:cursor-not-allowed
    `}
                        >
                            {/* אפקט הברק במעבר עכבר - מופיע רק כשהכפתור באמת פעיל */}
                            {formData.message.length >= 10 && formData.email.includes('@') && status === 'idle' && (
                                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
                            )}

                            <div className="relative flex items-center justify-center gap-2">
                                {status === 'idle' && (
                                    <>
                                        <span>
                                            {!formData.email.includes('@')
                                                ? 'הזן אימייל תקין'
                                                : formData.message.length < 10
                                                    ? 'הודעה קצרה מדי'
                                                    : 'שדר נתונים'}
                                        </span>
                                        <Send className={`w-5 h-5 ${(formData.message.length < 10 || !formData.email.includes('@')) ? 'opacity-20' : ''}`} />
                                    </>
                                )}

                                {status === 'loading' && (
                                    <>
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>יוצר קשר עם השרת...</span>
                                    </>
                                )}

                                {status === 'success' && (
                                    <>
                                        <CheckCircle2 className="w-6 h-6 animate-bounce" />
                                        <span>QUEST COMPLETED!</span>
                                    </>
                                )}

                                {status === 'error' && (
                                    <span>החיבור נכשל. נסה שוב.</span>
                                )}
                            </div>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
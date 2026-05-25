"use client";

import { useState } from 'react';
import { authService } from '../../services/client/authService';
import { toast } from 'sonner';
import Link from 'next/link';

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            await authService.forgotPassword(email);
            setIsSubmitted(true);
            toast.success('הוראות לאיפוס הסיסמה נשלחו למייל שלך');
        } catch (error) {
            // ה-api-client שלך כבר מטפל ב-toast של השגיאה
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8">
                <h1 className="text-2xl font-bold text-white text-center mb-2">איפוס סיסמה</h1>

                {!isSubmitted ? (
                    <>
                        <p className="text-slate-400 text-center mb-6 text-sm">
                            הכנס את כתובת האימייל שלך ונשלח לך קישור ליצירת סיסמה חדשה.
                        </p>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-1">אימייל</label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    placeholder="your@email.com"
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                            >
                                {isLoading ? "שולח..." : "שלח קישור לאיפוס"}
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="text-center space-y-4 animate-in fade-in zoom-in duration-300">
                        <div className="w-16 h-16 bg-blue-500/20 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <p className="text-slate-300">המייל נשלח בהצלחה ל-<strong>{email}</strong>.</p>
                        <p className="text-slate-400 text-sm">בדוק את תיבת הדואר הנכנס (וגם בספאם).</p>
                    </div>
                )}

                <div className="mt-6 text-center">
                    <Link href="/login" className="text-blue-400 hover:text-blue-300 text-sm transition-colors">
                        חזרה להתחברות
                    </Link>
                </div>
            </div>
        </div>
    );
}
"use client";

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '../../services/client/authService';
import { toast } from 'sonner';

function ResetPasswordForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!token) {
            toast.error('טוקן חסר או לא תקין');
            return;
        }

        if (password !== confirmPassword) {
            toast.error('הסיסמאות אינן תואמות');
            return;
        }

        setIsLoading(true);
        try {
            await authService.resetPassword(token, password);
            toast.success('הסיסמה שונתה בהצלחה!');
            router.push('/login');
        } catch (error) {
            // טיפול בשגיאה כבר נעשה ב-client
        } finally {
            setIsLoading(false);
        }
    };

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <div className="bg-slate-900 p-8 rounded-2xl border border-red-500/50 text-center">
                    <h2 className="text-white text-xl font-bold mb-4">קישור לא תקין</h2>
                    <p className="text-slate-400 mb-6">נראה שהגעת לעמוד זה ללא טוקן אימות תקין.</p>
                    <button onClick={() => router.push('/forgot-password')} className="text-blue-400 hover:underline">
                        בקש קישור חדש
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8">
                <h1 className="text-2xl font-bold text-white text-center mb-6">קביעת סיסמה חדשה</h1>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">סיסמה חדשה</label>
                        <input
                            type="password"
                            required
                            minLength={6}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="לפחות 6 תווים"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-300 text-sm font-medium mb-1">אימות סיסמה</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="הקלד שוב את הסיסמה"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                    >
                        {isLoading ? "מעדכן..." : "שנה סיסמה והתחבר"}
                    </button>
                </form>
            </div>
        </div>
    );
}



//עוטף את הטופס ברכיב Suspense כדי להציג fallback בזמן טעינה
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>טוען...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
"use client";

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { authService } from '../../services/client/authService';
import { useAuth } from '../Context/AuthContext';

import { toast } from 'sonner';

function VerifyEmail() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const token = searchParams.get('token');

    const { refreshUser } = useAuth();

    // ניהול מצב העמוד: 'loading' | 'success' | 'error'
    const [status, setStatus] = useState('loading');

    // טריק חשוב ל-React 18: מונע קריאה כפולה לשרת ב-Strict Mode
    const hasFetched = useRef(false);

    useEffect(() => {
        // אם אין טוקן ב-URL בכלל
        if (!token) {
            setStatus('error');
            return;
        }

        // מונע ביצוע כפול של הפונקציה
        if (hasFetched.current) return;
        hasFetched.current = true;

        const verifyAccount = async () => {
            try {
                // קריאה לשרת לאימות הטוקן
                await authService.verifyEmail(token);

                // זה יגרום לאפליקציה לרפרש את נתוני המשתמש מאחורי הקלעים
                // וברגע שזה יקרה, הבאנר יעלם אוטומטית בכל מקום באפליקציה!
                await refreshUser();
                setStatus('success');
                toast.success('החשבון אומת בהצלחה! מתחבר...');

            } catch (error) {
                setStatus('error');
                // שים לב: ה-api-client שלך כבר מקפיץ toast.error, אז אין צורך לעשות פה כלום חוץ מלשנות סטטוס
            }
        };

        verifyAccount();
    }, [token, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
            <div className="max-w-md w-full bg-slate-900 rounded-2xl shadow-2xl border border-slate-800 p-8 text-center">

                {/* לוגו או כותרת */}
                <h1 className="text-3xl font-bold text-white mb-6 tracking-wider">GAME ON</h1>

                {status === 'loading' && (
                    <div className="space-y-4">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                        <p className="text-slate-400">מאמת את החשבון שלך, אנא המתן...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white">החשבון אומת!</h2>
                    </div>
                )}

                {status === 'error' && (
                    <div className="space-y-4 animate-in fade-in zoom-in duration-500">
                        <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                        </div>
                        <h2 className="text-xl font-semibold text-white">אופס, משהו השתבש</h2>
                        <p className="text-slate-400">הלינק פג תוקף או שאינו תקין. נסה להתחבר כדי לשלוח לינק חדש.</p>
                    </div>
                )}
            </div>
        </div>
    );
}



export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div>טוען...</div>}>
            <VerifyEmail />
        </Suspense>
    );
}
"use client";
import Link from 'next/link';
import ForgotPassword from '../Component/ForgotPassword/ForgotPassword';

export default function ContainerflipCard(props) {
    return (
        <div className="mt-6 space-y-4 border-t border-slate-800 pt-6">
            
            {/* אזור הכפתורים - מוצג רק אם הפורם סגור */}
            {!props.showForm && (
                <div className="flex flex-col gap-3">
                    {/* כפתור פעולה ראשי (רגיל) */}
                    <button
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 border border-slate-700 disabled:opacity-50"
                        onClick={props.toggle}
                        disabled={props.isLoading}
                    >
                        {props.titleButton}
                    </button>

                    {/* קו מפריד אלגנטי */}
                    <div className="flex items-center gap-3 text-slate-500 text-xs font-semibold uppercase">
                        <div className="h-px w-full bg-slate-700"></div>
                        <span>or</span>
                        <div className="h-px w-full bg-slate-700"></div>
                    </div>

                    {/* כפתור גוגל מעוצב */}
                    <button
                        onClick={props.onGoogleLogin}
                        disabled={props.isLoading}
                        className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-slate-800 font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 disabled:opacity-50"
                    >
                        {/* האייקון הרשמי של גוגל */}
                        <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                        </svg>
                        Continue with Google
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm mt-2">
                {/* טקסט למעבר בין Login ל-Register */}
                <p className="text-slate-400">
                    {props.title}{" "}
                    <span
                        className="text-blue-400 font-semibold cursor-pointer hover:text-blue-300 hover:underline transition-all"
                        onClick={props.flipCard}
                    >
                        {props.titleSpan}
                    </span>
                </p>

                {/* קישור שכחתי סיסמה */}
                <ForgotPassword />
            </div>
        </div>
    );
}
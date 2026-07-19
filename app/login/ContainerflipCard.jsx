"use client";
import Link from 'next/link';
import ForgotPassword from '../Component/ForgotPassword/ForgotPassword';
export default function ContainerflipCard(props) {
    return (
        <div className="mt-6 space-y-4 border-t border-slate-800 pt-6">
            {/* כפתור פעולה ראשי - מוצג רק אם הפורם סגור */}
            {!props.showForm && (
                <button
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-all transform hover:scale-[1.02] active:scale-95 border border-slate-700"
                    onClick={props.toggle}
                >
                    {props.titleButton}
                </button>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
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

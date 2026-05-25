'use client';

import React, { useState, useMemo } from 'react';
import { Send, AlertCircle, Loader2, MessageSquareQuote } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useSubmitComment } from '../../hooks/useGameComments';
import { useGameComments } from '../../hooks/useGameComments';
import { useAuth } from '../../Context/AuthContext';

export default function CommentForm() {
    const [content, setContent] = useState("");
    const { user } = useAuth();
    const params = useParams();

    // שליפת התגובות לבדיקת "כבר הגיב"
    const { data } = useGameComments(params.Slug);
    const { mutate: submitComment, isPending } = useSubmitComment(params.Slug);

    // בדיקה האם המשתמש כבר מופיע ברשימת התגובות הראשיות
    const hasAlreadyCommented = useMemo(() => {
        if (!user || !data?.comments) return false;

        // אנחנו בודקים אם יש תגובה ששייכת למשתמש וגם שהיא תגובה ראשית (בלי אבא) ושלא נמחקה
        return data.comments.some(comment =>
            String(comment.userId) === String(user.id) && (comment.parentId === null || !comment.parentId) && !comment.isDeleted
        );
    }, [data?.comments, user]);



    const handleSubmit = (e) => {
        e.preventDefault();
        if (!content.trim() || hasAlreadyCommented) return;
        submitComment(content);
        setContent("");
    };

    // אם המשתמש לא מחובר, לא מציגים את הטופס
    if (!user) return null;

    return (
        <div className="mb-12">
            {hasAlreadyCommented ? (
                // ==========================================
                // עיצוב הודעת "כבר הגיבת" - מודרני ונעים
                // ==========================================
                <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-5 flex items-start sm:items-center gap-4 text-indigo-300 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div className="bg-indigo-500/20 p-2 rounded-xl">
                        <AlertCircle className="w-6 h-6 text-indigo-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-bold text-gray-100 text-lg">Your review is live!</span>
                        <span className="text-sm opacity-80 leading-relaxed">
                            You've already shared your thoughts on this game. To keep the community fair, we allow one main review per player.
                            Feel free to engage with others in the replies below!
                        </span>
                    </div>
                </div>
            ) : (
                // ==========================================
                // עיצוב הטופס החדש - Glassmorphism & Gradient
                // ==========================================
                <form
                    onSubmit={handleSubmit}
                    className="group relative bg-[#1c2128]/80 backdrop-blur-sm border border-gray-800 rounded-3xl overflow-hidden focus-within:border-indigo-500/50 transition-all duration-300 shadow-2xl"
                >
                    {/* Header עדין לטופס */}
                    <div className="flex items-center gap-2 px-6 py-3 border-b border-gray-800/50 bg-[#0d1117]/30">
                        <MessageSquareQuote className="w-4 h-4 text-indigo-400" />
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Write a Review</span>
                    </div>

                    <textarea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder="What's your take on this game? Share your experience..."
                        className="w-full bg-transparent p-6 text-gray-200 outline-none min-h-[140px] resize-none text-base placeholder:text-gray-600"
                    />

                    {/* Footer של הטופס עם כפתור השליחה */}
                    <div className="flex justify-end items-center px-6 py-4 bg-[#0d1117]/50 border-t border-gray-800/50">
                        <div className="flex items-center gap-4">
                            {content.length > 0 && (
                                <span className="text-xs text-gray-500 font-medium">
                                    {content.length} characters
                                </span>
                            )}
                            <button
                                type="submit"
                                disabled={isPending || !content.trim()}
                                className="relative bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white px-8 py-2.5 rounded-xl font-black text-sm flex items-center gap-2 transition-all active:scale-95 disabled:grayscale shadow-[0_0_20px_rgba(79,70,229,0.2)]"
                            >
                                {isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <>
                                        POST REVIEW
                                        <Send className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* אפקט זוהר קטן בפינה בזמן פוקוס */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 blur-[50px] pointer-events-none group-focus-within:bg-indigo-500/10 transition-colors" />
                </form>
            )}
        </div>
    );
}
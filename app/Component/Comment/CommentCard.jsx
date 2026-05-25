import React, { useState } from 'react';
import { Trash2, Reply, Pencil, X, ChevronDown, ChevronUp } from 'lucide-react'; // הוספתי Chevrons
import RatingStars from '../RatingStars/RatingStars';
import ProtectedAction from '../ProtectedAction/ProtectedAction';

export default function CommentCard({
    comment,
    isDeleted,
    currentUser,
    isAdmin,
    onDelete,
    activeReplyId,
    setActiveReplyId,
    onReplySubmit,
    activeEditId,
    setActiveEditId,
    onEditSubmit,
    depth = 0
}) {
    // סטייטים מקומיים
    const [replyText, setReplyText] = useState("");
    const [editText, setEditText] = useState(comment.content);

    // סטייט חדש: מנהל את פתיחת/סגירת תגובות המשנה
    const [showReplies, setShowReplies] = useState(false);

    const isReplying = activeReplyId === comment.id;
    const isEditing = activeEditId === comment.id;
    const isOwner = currentUser?.id === comment.userId;
    const hasReplies = comment.replies && comment.replies.length > 0;

    const formattedDate = new Date(comment.updatedAt).toLocaleDateString('en-GB', {
        day: 'numeric', month: 'short', year: 'numeric'
    });

    const userName = comment.User?.name || "Anonymous Player";
    const initial = userName.charAt(0).toUpperCase();

    // ==========================================
    // מצב 1: התגובה נמחקה (Soft Delete)
    // ==========================================
    if (isDeleted || comment.isDeleted) {
        return (
            <div className="relative group flex gap-3 sm:gap-5 opacity-60">
                <div className="flex-shrink-0 mt-1">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gray-800/50 border border-gray-700/30 flex items-center justify-center font-black text-gray-500">
                        {initial}
                    </div>
                </div>
                <div className="flex-1 min-w-0 bg-[#1c2128]/50 border border-gray-800/50 rounded-2xl p-4 sm:p-5">
                    <span className="font-bold text-gray-500 mb-2 block">{userName}</span>
                    <p className="text-gray-500 italic text-sm">This comment was deleted.</p>
                </div>
            </div>
        );
    }

    // ==========================================
    // מצב 2: תגובה פעילה (רגילה או במצב עריכה)
    // ==========================================
    return (
        <div className="relative group flex gap-3 sm:gap-5">
            {/* אווטאר מעוצב */}
            <div className="flex-shrink-0 mt-1">
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-[#1c2128] border border-gray-700/60 flex items-center justify-center font-black text-indigo-400 shadow-lg transform rotate-3 group-hover:rotate-0 transition-transform duration-300">
                    {initial}
                </div>
            </div>

            <div className="flex-1 min-w-0">
                {/* גוף התגובה */}
                <div className="bg-[#1c2128]/80 backdrop-blur-sm border border-gray-800 rounded-2xl p-4 sm:p-5 hover:border-gray-700 transition-colors">
                    <div className="flex flex-wrap justify-between items-start gap-2 mb-3 border-b border-gray-800/50 pb-3">
                        <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-gray-100">{userName}</span>
                            {comment.userRating > 0 && (
                                <RatingStars rating={comment.userRating} />
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-xs text-gray-500 bg-[#0d1117] px-2 py-1 rounded-md border border-gray-800">
                                {formattedDate}
                                {comment.createdAt !== comment.updatedAt && ' (Edited)'}
                            </span>

                            {/* כפתורי פעולות (עריכה ומחיקה) */}
                            <div className="flex items-center gap-1">
                                {isOwner && !isEditing && (
                                    <button
                                        onClick={() => {
                                            setActiveEditId(comment.id);
                                            setEditText(comment.content);
                                        }}
                                        className="text-gray-600 hover:text-indigo-400 transition-colors p-1.5 bg-gray-900 rounded-lg border border-transparent hover:border-indigo-500/20"
                                        title="Edit comment"
                                    >
                                        <Pencil className="w-3.5 h-3.5" />
                                    </button>
                                )}

                                {(isAdmin || isOwner) && (
                                    <button
                                        onClick={() => onDelete(comment.id)}
                                        className="text-gray-600 hover:text-red-500 transition-colors p-1.5 bg-gray-900 rounded-lg border border-transparent hover:border-red-500/20"
                                        title="Delete"
                                    >
                                        <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* החלפה בין תצוגת טקסט רגילה לתיבת עריכה */}
                    {isEditing ? (
                        <div className="mt-2 animate-in fade-in">
                            <textarea
                                autoFocus
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="w-full bg-[#0d1117] border border-indigo-500/50 rounded-xl p-3 text-sm text-white outline-none min-h-[80px] resize-none focus:ring-2 focus:ring-indigo-500/20"
                            />
                            <div className="flex justify-end gap-2 mt-2">
                                <button
                                    onClick={() => setActiveEditId(null)}
                                    className="px-3 py-1.5 text-xs font-bold text-gray-400 hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => onEditSubmit(comment.id, editText)}
                                    disabled={!editText.trim() || editText === comment.content}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-gray-300 text-sm sm:text-base leading-relaxed whitespace-pre-wrap">
                            {comment.content}
                        </p>
                    )}
                </div>

                {/* אזור הפעולות התחתון: Reply + פתיחת תגובות משנה */}
                {!isEditing && (
                    <div className="flex items-center gap-4 mt-2 px-2">
                        {/* כפתור Reply מוגבל רק לעומק 0 כדי למנוע קינון יתר */}
                        {depth === 0 && (
                            <ProtectedAction
                                onClick={() => setActiveReplyId(isReplying ? null : comment.id)}
                                title="JOIN THE CHAT"
                                className={`text-xs font-bold flex items-center gap-1.5 transition-colors ${isReplying ? 'text-indigo-400' : 'text-gray-500 hover:text-gray-300'
                                    }`}
                            >
                                {isReplying ? <X className="w-3.5 h-3.5" /> : <Reply className="w-3.5 h-3.5" />}
                                {isReplying ? 'Cancel' : 'Reply'}
                            </ProtectedAction>
                        )}

                        {/* כפתור הצגת תגובות משנה (מופיע רק אם יש ילדים) */}
                        {hasReplies && (
                            <button
                                onClick={() => setShowReplies(!showReplies)}
                                className="text-xs font-bold flex items-center gap-1.5 text-indigo-400/80 hover:text-indigo-400 transition-colors ml-auto sm:ml-0"
                            >
                                {showReplies ? (
                                    <>
                                        <ChevronUp className="w-4 h-4" />
                                        Hide Replies
                                    </>
                                ) : (
                                    <>
                                        <ChevronDown className="w-4 h-4" />
                                        View {comment.replies.length} Replies
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}

                {/* תיבת כתיבת תגובה */}
                {isReplying && (
                    <div className="mt-3 flex gap-3 animate-in fade-in slide-in-from-top-2">
                        <div className="w-0.5 bg-indigo-500/50 rounded-full ml-1" />
                        <div className="flex-1 bg-[#161b22] rounded-xl border border-indigo-900/40 p-1">
                            <textarea
                                autoFocus
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder={`Replying to ${userName}...`}
                                className="w-full bg-transparent border-none p-3 text-sm text-white outline-none min-h-[80px] resize-none"
                            />
                            <div className="flex justify-end p-2 border-t border-gray-800/50">
                                <button
                                    onClick={() => {
                                        onReplySubmit(comment.id, replyText);
                                        setReplyText("");
                                        setShowReplies(true); // פותח אוטומטית את תגובות המשנה כדי שהמשתמש יראה את מה שכתב
                                    }}
                                    disabled={!replyText.trim()}
                                    className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-1.5 rounded-lg text-xs font-bold disabled:opacity-40"
                                >
                                    Post
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* תצוגת תגובות משנה - מותנית עכשיו ב-showReplies */}
                {showReplies && hasReplies && (
                    <div className="mt-5 space-y-5 border-l-2 border-gray-800 pl-4 sm:pl-6 ml-4 animate-in fade-in slide-in-from-top-2">
                        {comment.replies.map((reply) => (
                            <CommentCard
                                key={reply.id}
                                comment={reply}
                                isDeleted={reply.isDeleted}
                                currentUser={currentUser}
                                isAdmin={isAdmin}
                                onDelete={onDelete}
                                activeReplyId={activeReplyId}
                                setActiveReplyId={setActiveReplyId}
                                onReplySubmit={onReplySubmit}
                                activeEditId={activeEditId}
                                setActiveEditId={setActiveEditId}
                                onEditSubmit={onEditSubmit}
                                depth={depth + 1}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
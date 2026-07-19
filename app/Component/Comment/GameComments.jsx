'use client';

import React, { useState } from 'react';
import { MessageSquare, Loader2, AlertTriangle, Trash2, X } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useGameComments } from "../../hooks/useGameComments";
import { useParams } from 'next/navigation';
import CommentCard from './CommentCard';
import Pagination from '../Pagination/Pagination';
import RatingSummary from '../RatingStars/RatingSummary';
import CommentForm from './CommentForm';

export default function GameComments() {
    // משיכת פרטי המשתמש הנוכחי וההרשאות שלו מה-Context
    const { isAdmin, user } = useAuth();
    const { Slug } = useParams();

    const [page, setPage] = useState(1);
    const [selectedRating, setSelectedRating] = useState(null); // null = הכל

    // ניהול מצבים מקומיים (איזו תגובה פתוחה לתגובת-משנה ואיזו פתוחה לעריכה)
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [activeEditId, setActiveEditId] = useState(null);

    // מנגנון ניהול חלון מחיקה ואזהרה עבור מנהלים
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [commentIdToDelete, setCommentIdToDelete] = useState(null);
    const [sendWarning, setSendWarning] = useState(true);
    const [warningReason, setWarningReason] = useState('');

    // שליפת נתונים ופונקציות מה-Hook המותאם
    const { data, isLoading, isError, addReply, deleteComment, editComment, isAddingReply } = useGameComments(Slug, page, selectedRating);

    const comments = data?.comments || [];
    const pagination = data?.pagination || { totalPages: 1, total: 0 };
    const stats = data?.stats || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // ==========================================
    // Mutations & Handlers
    // ==========================================

    // מחיקה - מופעלת בלחיצה על כפתור המחיקה ב-CommentCard
    const onDeleteClick = (comment) => {
        // בדיקה: האם התגובה הזו שייכת למשתמש הנוכחי (משתמש רגיל או מנהל שמחק לעצמו)
        const isOwnComment = comment.userId === user?.id;

        if (isOwnComment) {
            // מחיקה עצמית - תיבת אישור רגילה ומחיקה ישירה ללא מודל אזהרה
            if (window.confirm("Are you sure you want to delete your comment?")) {
                deleteComment({ commentId: comment.id });
            }
        } else if (isAdmin) {
            // מנהל מוחק תגובה של משתמש אחר - פתיחת מודל האזהרה המעוצב
            setCommentIdToDelete(comment.id);
            setWarningReason(`תגובה לא הולמת בקהילת המשחק: ${Slug}`);
            setSendWarning(true);
            setIsDeleteModalOpen(true);
        }
    }

    // אישור המחיקה מתוך המודל של האדמין
    const handleAdminDeleteConfirm = () => {
        deleteComment({
            commentId: commentIdToDelete,
            warningReason,
            sendWarning
        });

        // איפוס הסטייט וסגירת המודל לאחר השליחה לשרת
        setIsDeleteModalOpen(false);
        setCommentIdToDelete(null);
    }

    // הוספת תגובת משנה
    const onReplySubmit = (parentId, content) => {
        addReply({ parentId, content });
        setActiveReplyId(null);
    }

    // עריכת תגובה קיימת
    const onEditSubmit = (commentId, content) => {
        editComment({ commentId, content });
        setActiveEditId(null);
    }

    if (isError) return <div className="text-center p-10 text-red-400">Error loading comments.</div>;

    return (
        <section className="mt-16 max-w-5xl mx-auto px-4" dir="ltr">

            {/* כותרת */}
            <div className="mb-8 border-b border-gray-800 pb-4">
                <h3 className="text-3xl font-black text-white flex items-center gap-3">
                    <MessageSquare className="text-indigo-500" /> Community Voice
                </h3>
            </div>

            {/* בלוק הדירוגים המשולב */}
            <RatingSummary
                stats={stats}
                selectedRating={selectedRating}
                onRatingSelect={(rating) => {
                    setSelectedRating(rating);
                    setPage(1);
                }}
                totalComments={pagination.total}
            />

            {/* הטופס */}
            {user ? <CommentForm /> : <p className="text-center text-gray-500">Log in to post a comment</p>}

            {/* רשימת תגובות */}
            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>
            ) : (
                <div className={`space-y-6 ${isAddingReply ? 'opacity-50' : ''}`}>
                    {comments.map((comment) => {
                        const isDeleted = comment.isDeleted === true;

                        return (
                            <CommentCard
                                key={comment.id}
                                comment={comment}
                                isDeleted={isDeleted}
                                currentUser={user}
                                isAdmin={isAdmin}
                                // מעבירים את אובייקט התגובה המלא כדי לבצע את בדיקת הבעלות ב-onDeleteClick
                                onDelete={onDeleteClick}

                                activeReplyId={activeReplyId}
                                setActiveReplyId={setActiveReplyId}
                                onReplySubmit={(parentId, content) => onReplySubmit(parentId, content)}

                                activeEditId={activeEditId}
                                setActiveEditId={setActiveEditId}
                                onEditSubmit={(commentId, content) => onEditSubmit(commentId, content)}
                            />
                        );
                    })}
                </div>
            )}

            {/* Pagination */}
            <Pagination
                totalPages={pagination.totalPages}
                currentPage={page}
                onPageChange={(newPage) => setPage(newPage)}
            />

            {/* ==========================================
                ADMIN MODERATION MODAL (חלון מחיקה ואזהרה)
               ========================================== */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" dir="rtl">
                    <div className="bg-gray-900 border border-gray-800 rounded-xl max-w-md w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">

                        {/* ראש המודל */}
                        <div className="flex items-center justify-between bg-gray-950 px-6 py-4 border-b border-gray-800">
                            <div className="flex items-center gap-2 text-red-500">
                                <AlertTriangle size={20} />
                                <span className="font-bold text-lg">מחיקת תגובת משתמש</span>
                            </div>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="text-gray-400 hover:text-white transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* גוף המודל */}
                        <div className="p-6 space-y-4">
                            <p className="text-gray-300 text-sm leading-relaxed">
                                אתה עומד למחוק את התגובה הזו מהמערכת. הפעולה תתועד באופן אוטומטי ביומן הפעולות.
                            </p>

                            {/* תיבת סימון לשליחת אזהרה למערכת */}
                            <label className="flex items-center gap-3 bg-gray-950 p-3 rounded-lg border border-gray-800 cursor-pointer select-none hover:border-gray-700 transition-colors">
                                <input
                                    type="checkbox"
                                    checked={sendWarning}
                                    onChange={(e) => setSendWarning(e.target.checked)}
                                    className="w-4 h-4 rounded text-indigo-600 bg-gray-900 border-gray-700 focus:ring-indigo-500"
                                />
                                <span className="text-sm font-medium text-white">שלח אזהרה רשמית למשתמש זה</span>
                            </label>

                            {/* שדה הזנת סיבת האזהרה (מוצג באופן מותנה רק אם ה-Checkbox מסומן) */}
                            {sendWarning && (
                                <div className="space-y-1.5 transition-all">
                                    <label className="text-xs font-semibold text-gray-400">סיבת האזהרה (תישלח למשתמש):</label>
                                    <textarea
                                        rows={3}
                                        value={warningReason}
                                        onChange={(e) => setWarningReason(e.target.value)}
                                        className="w-full bg-gray-950 border border-gray-800 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none font-sans"
                                        placeholder="הזן את סיבת האזהרה..."
                                    />
                                </div>
                            )}
                        </div>

                        {/* כפתורי פעולה בתחתית המודל */}
                        <div className="flex items-center gap-3 px-6 py-4 bg-gray-950 border-t border-gray-800">
                            <button
                                onClick={handleAdminDeleteConfirm}
                                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white text-sm font-bold py-2.5 px-4 rounded-lg transition-colors shadow-lg shadow-red-900/20"
                            >
                                <Trash2 size={16} /> מחק תגובה
                            </button>
                            <button
                                onClick={() => setIsDeleteModalOpen(false)}
                                className="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-sm font-semibold py-2.5 px-4 rounded-lg transition-colors border border-gray-700"
                            >
                                ביטול
                            </button>
                        </div>

                    </div>
                </div>
            )}
        </section>
    );
}
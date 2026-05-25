'use client';

import React, { useState } from 'react';
import { MessageSquare, Loader2 } from 'lucide-react';
import { useAuth } from '../../Context/AuthContext';
import { useGameComments } from "../../hooks/useGameComments";
import { useParams } from 'next/navigation';
import CommentCard from './CommentCard';
import Pagination from '../Pagination/Pagination';
import RatingSummary from '../RatingStars/RatingSummary';
import CommentForm from './CommentForm';

export default function GameComments() {
    // משיכת פרטי המשתמש הנוכחי (כדי שנוכל להעביר ל-CommentCard לבדיקת בעלות)
    const { isAdmin, user } = useAuth();
    const { Slug } = useParams();

    const [page, setPage] = useState(1);
    const [selectedRating, setSelectedRating] = useState(null); // null = הכל

    // ניהול מצבים מקומיים (איזו תגובה פתוחה לתגובת-משנה ואיזו פתוחה לעריכה)
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [activeEditId, setActiveEditId] = useState(null);

    // שליפת נתונים ופונקציות מה-Hook (הוספנו את editComment)
    const { data, isLoading, isError, addReply, deleteComment, editComment, isAddingReply } = useGameComments(Slug, page, selectedRating);

    const comments = data?.comments || [];
    const pagination = data?.pagination || { totalPages: 1, total: 0 };
    const stats = data?.stats || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    // ==========================================
    // Mutations (מחיקה, הוספה ועריכה)
    // ==========================================

    // מחיקה  
    const onDelete = (id) => {
        if (window.confirm("Are you sure?")) {
            deleteComment(id); // הפונקציה הזו כבר מפעילה את ה-onSuccess שבתוך ה-Hook
        }
    }

    // הוספת תגובת משנה
    const onReplySubmit = (parentId, content) => {
        addReply({ parentId, content });
        setActiveReplyId(null);
    }

    // עריכת תגובה קיימת (חדש)
    const onEditSubmit = (commentId, content) => {
        editComment({ commentId, content });
        setActiveEditId(null); // סגירת תיבת העריכה לאחר הצלחה
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

            {/* הטופס  */}
            {user ? <CommentForm /> : <p className="text-center text-gray-500">Log in to post a comment</p>}

            {/* רשימת תגובות */}
            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 className="animate-spin text-indigo-500" /></div>
            ) : (
                <div className={`space-y-6 ${isAddingReply ? 'opacity-50' : ''}`}>
                    {comments.map((comment) => {
                        // ==========================================
                        // בדיקת מחיקה (Soft Delete)
                        // אם התגובה סומנה כמחוקה בשרת, אנחנו מעבירים את המידע ל-CommentCard
                        // כך שיוכל להציג "This comment was deleted" ולהסתיר כפתורי עריכה/מחיקה.
                        // ==========================================
                        const isDeleted = comment.isDeleted === true;

                        return (
                            <CommentCard
                                key={comment.id}
                                comment={comment}
                                isDeleted={isDeleted} // מעביר את סטטוס המחיקה
                                currentUser={user} // מעביר את המשתמש הנוכחי כדי לבדוק מי יכול לערוך
                                isAdmin={isAdmin} // מעביר את סטטוס האדמין כדי לאפשר מחיקה גם למנהלים
                                // פעולת מחיקה (לאדמין)
                                onDelete={(commentId) => onDelete(commentId)}

                                // ניהול מצב הוספת תגובת-משנה
                                activeReplyId={activeReplyId}
                                setActiveReplyId={setActiveReplyId}
                                onReplySubmit={(parentId, content) => onReplySubmit(parentId, content)}

                                // ניהול מצב עריכה (חדש)
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
        </section>
    );
}
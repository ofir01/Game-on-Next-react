import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { commentsService } from '../../services/client/commentsService';
import { toast } from 'sonner';

export const useGameComments = (Slug, page = 1, rating = null) => {
    const queryClient = useQueryClient();

    // 1. שליפת התגובות (Query)
    const query = useQuery({
        queryKey: ['comments', Slug, page, rating],
        queryFn: () => commentsService.get(Slug, page, rating),
        placeholderData: keepPreviousData,
        enabled: !!Slug,
    });

    // 2. מוטציה להוספת תגובה/תגובת משנה
    const addReplyMutation = useMutation({
        mutationFn: (data) =>
            commentsService.postReply(Slug, data),
        onSuccess: () => {
            // מרענן את כל התגובות של המשחק הזה
            queryClient.invalidateQueries(['comments', Slug]);
            toast.success("Reply added successfully!");
        },
    });

    // 3. מוטציה למחיקת תגובה
    const deleteMutation = useMutation({
        mutationFn: ({ commentId, warningReason = null, sendWarning = false }) =>
            commentsService.delete(Slug, { commentId, warningReason, sendWarning }),
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: ['comments', Slug],
                exact: false // כדי להבטיח ריענון של כל העמודים
            });
            toast.success(data.message || "Comment deleted successfully!");
        },
    });



    // 4. מוטציה לעריכת תגובה (חדש)
    const editMutation = useMutation({
        mutationFn: (data) => commentsService.edit(Slug, data),
        onSuccess: (data) => {
            queryClient.invalidateQueries(['comments', Slug]);
            toast.success(data.message || "Comment updated!");
        },
    });

    // מחזירים אובייקט אחד שמכיל הכל
    return {
        // הנתונים והסטטוס של השליפה
        data: query.data,
        isLoading: query.isLoading,
        isError: query.isError,
        isPlaceholderData: query.isPlaceholderData,

        // פונקציות הפעולה (חשופות לקומפוננטה)
        addReply: addReplyMutation.mutate,
        isAddingReply: addReplyMutation.isPending,

        deleteComment: deleteMutation.mutate,
        editComment: editMutation.mutate,
        isEditing: editMutation.isPending,
        isDeleting: deleteMutation.isPending
    };
};








//הטופס לשליחת תגובה
export const useSubmitComment = (Slug) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (commentData) => commentsService.create(Slug, commentData),
        onSuccess: () => {
            // פתרון: ריענון כל השאילתות שמתחילות במערך הזה
            queryClient.invalidateQueries({
                queryKey: ['comments', Slug],
                exact: false // זה מוודא שגם עמוד 1, עמוד 2 וכו' יתרעננו
            });

            toast.success("Comment posted successfully!");
        },
    });
};















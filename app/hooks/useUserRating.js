// hooks/useUserRating.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserRatingService } from '../../services/client/UserRatingService';

export const useUserRating = (Slug) => {
    const queryClient = useQueryClient();

    const ratingQuery = useQuery({
        queryKey: ['userRating', Slug],
        queryFn: () => UserRatingService.getUserRating(Slug),
        enabled: !!Slug,
        // הורדנו את ה-staleTime ל-0 בזמן פיתוח כדי לראות שינויים מיד
        staleTime: 0,
    });

    const mutation = useMutation({
        mutationFn: (rating) => UserRatingService.updateRating(Slug, rating),
        onSuccess: (newData) => {
            // 1. עדכון ידני של ה-Cache עם המבנה המדויק שהשרת מחזיר
            queryClient.setQueryData(['userRating', Slug], newData); 
            // 2. אופציונלי: ריענון כל השאילתות שקשורות לנתוני המשחק הזה
            queryClient.invalidateQueries(['comments', Slug]); 
        },
    });

    return {
        // מחזירים את האובייקט המלא - הקומפוננטה כבר יודעת לפרק אותו
        userRating: ratingQuery.data,
        isLoading: ratingQuery.isLoading,
        rateGame: mutation.mutate,
        isPending: mutation.isPending
    };
};
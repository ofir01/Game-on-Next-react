"use client";
import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { newsService } from '../../../services/client/newsService';

export const useNews = (limit = 5, searchTerm = "") => {
  const queryClient = useQueryClient();

  const infiniteQuery = useInfiniteQuery({
    queryKey: ['news', 'infinite'],

    queryFn: async ({ pageParam = 1 }) => {
      const response = await newsService.get({ page: pageParam, limit });
      // וודא שה-newsService מחזיר את response.data או את האובייקט עצמו
      return response;
    },

    initialPageParam: 1,

    // --- התיקון כאן: חילוץ מתוך אובייקט ה-pagination החדש ---
    getNextPageParam: (lastPage) => {
      // בודק אם יש עוד עמודים לפי הנתונים מהשרת
      const { currentPage, totalPages } = lastPage.pagination;
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },

    // ---  : שיטוח נכון של המפתח news ---
    select: (data) => {
      const allItems = data.pages.flatMap(page => page.news || []);

      return allItems
        .filter(item =>
          item.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.content?.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
  });

  // מוטציות (הוספה, מחיקה, עדכון) - נשארות אותו דבר
  const addMutation = useMutation({
    mutationFn: (newNews) => newsService.create(newNews),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
      // toast.success("הידיעה נוספה בהצלחה");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => newsService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => newsService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['news'] });
    },
  });

  return {
    ...infiniteQuery,
    allNews: infiniteQuery.data || [],
    addNews: addMutation,
    updateNews: updateMutation,
    deleteNews: deleteMutation
  };
};




//שליפת כתבה בודדת
export const useSingleNews = (Slug) => {
  return useQuery({
    queryKey: ['news', 'single', Slug],
    queryFn: async () => {
      const response = await newsService.getBySlug(Slug);
      return response;
    },
    enabled: !!Slug, // ירוץ רק אם יש slug
  });
};




//שולף את כל הקטגוריות האפשריות בחדשות
export const getNewsCategories = () => {
  return [
    { value: 'Update' },
    { value: 'Event' },
    { value: 'Sale' },
    { value: 'Patch' },
    { value: 'Games' },
    { value: 'Feature' }
  ];
}
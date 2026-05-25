"use client";
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { CategoriesService } from '../../services/client/CategoriesService';
import { toast } from 'sonner';


export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    // משתמשים בפונקציה מתוך ה-Service המסודר
    queryFn: () => CategoriesService.getCategories(),
    staleTime: 1000 * 60 * 60, // אפשר אפילו שעה שלמה, קטגוריות לא משתנות לעיתים קרובות
  });
};




//מעדכן את הנתונים כאשר מתבצע שינוי
export const useCategoriesActions = () => {
  const queryClient = useQueryClient();

  // CREATE
  const createCategory = useMutation({
    mutationFn: (name) => CategoriesService.createCategory({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('הקטגוריה נוספה בהצלחה במערכת');
    },
    onError: (err) => {
      toast.error(`שגיאה בעדכון: ${err.message}`);
    },
  });

  // UPDATE
  const updateCategory = useMutation({
    mutationFn: ({ id, name }) =>
      CategoriesService.updateCategory(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('הקטגוריה עודכנה בהצלחה במערכת');
    },
    onError: (err) => {
      toast.error(`שגיאה בעדכון: ${err.message}`);
    },
  });

  // DELETE
  const deleteCategory = useMutation({
    mutationFn: (id) => CategoriesService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success('הקטגוריה נמחקה בהצלחה במערכת');
    },
    onError: (err) => {
      toast.error(`שגיאה בעדכון: ${err.message}`);
    },

  });

  return {
    createCategory,
    updateCategory,
    deleteCategory,
  };
};
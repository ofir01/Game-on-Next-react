"use client";
import { useQuery } from '@tanstack/react-query';
import { authService } from '../../services/client/authService';

export const useUserProfile = () => {
  return useQuery({
    queryKey: ['userProfile'],
    queryFn: async () => {
      try {
        return await authService.getProfile();
      } catch (error) {
        return null;
      }
    },
    retry: false,

    staleTime: 1000 * 30, // המידע נחשב טרי רק ל-30 שניות
    refetchOnWindowFocus: true, // כשחוזרים מהמייל לאתר, הוא יבדוק אוטומטית אם המשתמש אומת
  });
};
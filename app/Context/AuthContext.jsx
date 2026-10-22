"use client";
import { useMemo, useCallback, createContext, useContext } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useUserProfile } from '../hooks/user/useUserProfile';
import { authService } from '../../services/client/authService';
import { toast } from 'sonner';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const queryClient = useQueryClient();
  const { data, isLoading, refetch } = useUserProfile();

  const user = data?.user || null;
  // פונקציית רענון גלובלית שניתן לייבא בכל מקום
  const refreshUser = useCallback(async () => {
    // invalidate אומר ל-React Query שהמידע ישן ומכריח אותו למשוך מחדש מהשרת
    await queryClient.invalidateQueries({ queryKey: ['userProfile'] });
    const result = await refetch();
    return result.data;
  }, [queryClient, refetch]);

  const login = useCallback(async () => {
    await refreshUser();
  }, [refreshUser]);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout API failed", err);
    } finally {
      // איפוס הנתונים ב-Cache
      queryClient.setQueryData(['userProfile'], null);
      // ניקוי כל שאר השאילתות באתר (כדי שלא ישאר מידע ב-Cache)
      queryClient.removeQueries({
        predicate: (query) => query.queryKey[0] !== 'userProfile'
      });
    }
  }, [queryClient]);

  const resendVerification = useCallback(async () => {
    if (!user?.email) return;
    try {
      await authService.resendVerification(user.email);
      toast.success("מייל אימות חדש נשלח לתיבה שלך! 📧");
    } catch (err) {
      toast.error("שגיאה בשליחת המייל. נסה שנית מאוחר יותר.");
    }
  }, [user]);

  const value = useMemo(() => ({
    user,
    loading: isLoading,
    login,
    logout,
    refreshUser,
    resendVerification,
    isAdmin: user?.role === 'ADMIN',
  }), [user, isLoading, login, logout, refreshUser, resendVerification]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
    /*
    //בפעם הראשונה גורם לכל האתר להמתין עד שיאושר אם המשתמש הוא אדמין או לא, לפני הצגת הדף
    <AuthContext.Provider value={value}>
      {isLoading ? (
        <div className="flex items-center justify-center h-screen bg-slate-950">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-purple-500"></div>
        </div>
      ) : children}
    </AuthContext.Provider>
    */
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
























//השיטה הישנה עם useReducer useEffect
/*
import { authService } from '../../services/authService';
import { createContext, useContext, useEffect, useMemo, useReducer, useCallback } from 'react';
const AuthContext = createContext();// יצירת ה-Context עבור האותנטיקציה


// 1. הגדרת המצב הראשוני
const initialState = {
  user: null,
  loading: true,
};

// 2.Reducer:  מרכז את כל שינויי -State
const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_SUCCESS':
      return { ...state, user: action.payload, loading: false };
    case 'AUTH_ERROR':
    case 'LOGOUT':
      return { ...state, user: null, loading: false };
    case 'FINISH_LOADING':
      return { ...state, loading: false };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // בדיקת המשתמש בטעינה ראשונית
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await authService.getProfile();
        if (res && res.user) {
          dispatch({ type: 'AUTH_SUCCESS', payload: res.user });
        } else {
          dispatch({ type: 'AUTH_ERROR' });
        }
      } catch (err) {
        dispatch({ type: 'AUTH_ERROR' });
      }
    };
    checkUser();
  }, []);

  // 3. שימוש ב-useCallback כדי שהפונקציות לא ייווצרו מחדש בכל רינדור
  const login = useCallback((userData) => {
    dispatch({ type: 'AUTH_SUCCESS', payload: userData });
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.Logout();
    } finally {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);


  // 4. אופטימיזציה של ה-Value שנשלח לכל האפליקציה
  //useCallback ו-useMemo יחד כדי למנוע יצירת פונקציות וערכים חדשים בכל רינדור
  const value = useMemo(() => ({
    user: state.user,
    loading: state.loading,
    login,
    logout,
    isAdmin: state.user?.role === 'ADMIN'
  }), [state.user, state.loading, login, logout]);

  //המתן בהצגת הדף עד שיאושר אם המשתמש הוא אדמין
  return (
    <AuthContext.Provider value={value}>
      {!state.loading && children} 
    </AuthContext.Provider>
  );
};

// Hook שימוש קל יותר ב-Context
//במקום לעשות בכל עמוד שנשתמש בזה את  useContext(AuthContext);  וגם לייבא את ה-Context, פשוט נקרא ל-useAuth ונקבל את כל מה שצריך   
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};


*/





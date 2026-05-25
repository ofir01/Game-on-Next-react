"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'sonner'

import { useAuth } from '../../Context/AuthContext';
import { authService } from '../../../services/client/authService'
export default function ProfileSettingsPage() {
  const { user, login } = useAuth();
  // 1. שליפת הנתונים הנוכחיים (כאן זה מוק, בפועל יבוא מה-Context או מה-API)
  const initialUserData = {
    name: user?.name,
    email: user?.email,
  };

  // 2. ניהול הסטייט של הטופס
  const [formData, setFormData] = useState({
    name: initialUserData.name,
    email: initialUserData.email,
    currentPassword: '',
    newPassword: '',
  });

  // 3. ניהול מצבי חיווי למשתמש (UI States)
  const [isLoading, setIsLoading] = useState(false);

  // פונקציה לעדכון השדות בזמן הקלדה
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // פונקציה לטיפול בשמירת הנתונים
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 1. הגדרת מצבי שינוי
    const isEmailChanged = formData.email !== initialUserData.email;
    const isNameChanged = formData.name !== initialUserData.name;
    const isPasswordChanging = formData.newPassword.trim() !== '';

    // 2. בדיקות תקינות (Early Return) - חוסך קריאות לשרת
    if (!isEmailChanged && !isNameChanged && !isPasswordChanging) {
      return toast.error('לא בוצעו שינויים לשמירה.');
    }

    if ((isEmailChanged || isPasswordChanging) && !formData.currentPassword) {
      return toast.error('יש להזין סיסמה נוכחית כדי לשנות אימייל או סיסמה.');
    }

    // 3. תחילת תהליך השליחה
    setIsLoading(true);
    const toastId = toast.loading('מעדכן פרטים...');

    try {
      const res = await authService.updateUser(formData);
      // עדכון הסטייט המקומי עם הנתונים החדשים
      login(res.user);
      toast.info(res.message, { id: toastId });
      // איפוס שדות רגישים בלבד
      setFormData(prev => ({ ...prev, currentPassword: '', newPassword: '' }));
    } catch (error) {
      toast.error(error.message || 'אירעה שגיאה בעת שמירת הנתונים.', { id: toastId });
    } finally { // יתבצע תמיד - גם בהצלחה וגם בשגיאה
      setIsLoading(false);
    }
  };



  return (
    <div className="max-w-2xl mx-auto p-6 min-h-screen mt-10 text-white">
      <div className="bg-gray-800 rounded-2xl shadow-xl border border-gray-700 overflow-hidden">

        {/* כותרת הדף */}
        <div className="bg-gray-900 px-8 py-6 border-b border-gray-700">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
            הגדרות חשבון
          </h1>
          <p className="text-gray-400 text-sm mt-1">עדכן את הפרטים האישיים ואת הגדרות האבטחה שלך</p>
        </div>

        {/* טופס העדכון */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6">




          {/* פרטים אישיים */}
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">פרטים אישיים</h2>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">שם תצוגה</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">כתובת אימייל</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              />
            </div>
          </div>

          {/* אבטחה וסיסמה */}
          <div className="space-y-4 pt-4">
            <h2 className="text-lg font-semibold text-gray-200 border-b border-gray-700 pb-2">החלפת סיסמה</h2>
            <p className="text-xs text-gray-500">השאר ריק אם אינך מעוניין לשנות סיסמה</p>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">סיסמה נוכחית</label>
              <input
                type="password"
                name="currentPassword"
                value={formData.currentPassword}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">סיסמה חדשה</label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
              />
            </div>
          </div>

          {/* כפתור שמירה */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition-all duration-300 ${isLoading
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-lg hover:shadow-purple-500/25'
                }`}
            >
              {isLoading ? 'שומר שינויים...' : 'שמור שינויים'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
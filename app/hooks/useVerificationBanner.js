import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../Context/AuthContext'; // ודא שהנתיב נכון

export const useVerificationBanner = () => {
    const { user, resendVerification } = useAuth();
    
    const [cooldown, setCooldown] = useState(0);
    const [isSending, setIsSending] = useState(false);

    // לוגיקה נוקשה וברורה: מציגים רק אם יש משתמש והוא בוודאות לא מאומת!
    // שים לב: תוודא שהשרת שלך באמת מחזיר את השדה isVerified כ-false
    const dontShowBanner = Boolean(user && user?.isVerified === true) || !user; // true אם לא צריך להראות, false אם צריך להראות
    

    // שחזור הטיימר מ-Local Storage
    useEffect(() => {
        const savedTime = localStorage.getItem('verify_cooldown_end');
        if (savedTime) {
            const remaining = Math.ceil((parseInt(savedTime) - Date.now()) / 1000);
            if (remaining > 0) {
                setCooldown(remaining);
            } else {
                localStorage.removeItem('verify_cooldown_end');
            }
        }
    }, []);

    // ניהול הספירה לאחור
    useEffect(() => {
        if (cooldown <= 0) return;
        
        const timer = setInterval(() => {
            setCooldown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [cooldown]);

    // פונקציית השליחה מחדש
    const handleResend = useCallback(async () => {
        if (cooldown > 0 || isSending) return;
        
        setIsSending(true);
        try {
            await resendVerification();
            
            const cooldownSeconds = 30;
            setCooldown(cooldownSeconds);
            localStorage.setItem('verify_cooldown_end', (Date.now() + cooldownSeconds * 1000).toString());
        } catch (error) {
            console.error("Failed to resend", error);
        } finally {
            setIsSending(false);
        }
    }, [cooldown, isSending, resendVerification]);

    return {
        dontShowBanner,
        cooldown,
        isSending,
        handleResend
    };
};
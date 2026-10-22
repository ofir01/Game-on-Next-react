'use client';
import { useState, useRef } from 'react';
import { Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUserLibrary } from '../../hooks/user/useLibrary';

// פונקציית עזר ליצירת חלקיקים רנדומליים לפיצוץ
// אנחנו מייצרים אותם מראש כדי שלא יהיו קפיצות ברנדור
const generateParticles = (count) => {
    return Array.from({ length: count }).map((_, i) => {
        const angle = (i * 360) / count;
        // המרה לרדיאנים כדי לחשב כיוון x, y
        const rad = (angle * Math.PI) / 180;
        // מרחק רנדומלי שהחלקיק יעוף
        const distance = Math.random() * 30 + 20;
        return {
            id: i,
            x: Math.cos(rad) * distance,
            y: Math.sin(rad) * distance,
            scale: Math.random() * 0.6 + 0.4,
            rotation: Math.random() * 360,
        };
    });
};

export default function Favorite({ id }) {
    const { isFavorite, updateGame } = useUserLibrary();
    const favorite = isFavorite(id);

    // סטייט שמנהל את הפיצוץ עצמו (קורה רק לשבריר שנייה בעת הלחיצה)
    const [isExploding, setIsExploding] = useState(false);
    // שומרים את נתוני החלקיקים ברפרנס כדי שלא ייווצרו מחדש בכל רינדור (מונע ריצודים)
    const particles = useRef(generateParticles(12)).current;

    const handleClick = (e) => {
        e.preventDefault();
        e.stopPropagation(); // מונע מעבר לעמוד המשחק אם הכפתור יושב על כרטיסייה לחיצה

        const willBeFavorite = !favorite;

        // מפעילים את אנימציית הפיצוץ רק אם המשתמש מוסיף למועדפים
        if (willBeFavorite) {
            setIsExploding(true);
            // מנקים את סטייט הפיצוץ אחרי שהאנימציה מסתיימת
            setTimeout(() => setIsExploding(false), 800);
        }

        // קריאה לפונקציית העדכון של ה-Hook שלך
        updateGame({ gameId: id, isFavorite: willBeFavorite });
    };

    return (
        <motion.button
            onClick={handleClick}
            className="absolute top-3 right-3 flex items-center justify-center w-10 h-10 rounded-full group/heart z-30 outline-none"
            // אנימציית הופעה ראשונית של הכפתור
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            // אפקט ריחוף (Hover)
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
        >
            {/* רקע הכפתור (Glassmorphism) שמשתנה לפי המצב */}
            <motion.div
                className="absolute inset-0 rounded-full backdrop-blur-md border"
                animate={{
                    backgroundColor: favorite ? 'rgba(239, 68, 68, 0.15)' : 'rgba(15, 23, 42, 0.6)',
                    borderColor: favorite ? 'rgba(239, 68, 68, 0.5)' : 'rgba(255, 255, 255, 0.1)',
                    boxShadow: favorite
                        ? '0 0 20px rgba(239, 68, 68, 0.4), inset 0 0 10px rgba(239, 68, 68, 0.2)'
                        : '0 0 0px rgba(0,0,0,0)',
                }}
                transition={{ duration: 0.3 }}
            />

            {/* --- אפקט פיצוץ חלקיקים (Particles) --- */}
            <AnimatePresence>
                {isExploding && particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-red-500 rounded-full pointer-events-none"
                        style={{
                            x: '-50%', y: '-50%',
                            boxShadow: '0 0 8px #ef4444' // Neon glow לחלקיקים
                        }}
                        initial={{ x: '-50%', y: '-50%', opacity: 1, scale: 0 }}
                        animate={{
                            x: `calc(-50% + ${particle.x}px)`,
                            y: `calc(-50% + ${particle.y}px)`,
                            opacity: 0,
                            scale: particle.scale,
                            rotate: particle.rotation,
                        }}
                        transition={{
                            duration: 0.6,
                            ease: "easeOut",
                            // נותן קצת אקראיות לזמן המעוף של כל חלקיק
                            delay: Math.random() * 0.1
                        }}
                    />
                ))}
            </AnimatePresence>

            {/* --- גל הדף (Ripple) --- */}
            <AnimatePresence>
                {isExploding && (
                    <motion.div
                        className="absolute inset-0 rounded-full border-2 border-red-500 pointer-events-none"
                        initial={{ opacity: 0.8, scale: 1 }}
                        animate={{ opacity: 0, scale: 2.5 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                    />
                )}
            </AnimatePresence>

            {/* --- אייקון הלב עצמו --- */}
            <motion.div
                className="relative z-10 flex items-center justify-center"
                animate={{
                    // קפיצה קטנה פנימה כשהוא מסומן
                    scale: favorite ? [1, 1.3, 1] : 1,
                    rotate: favorite ? [0, -15, 15, 0] : 0,
                }}
                transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                    times: [0, 0.5, 1], // מגדיר בדיוק מתי כל שלב במערך קורה
                    stiffness: 400,
                    damping: 10
                }}
            >
                <Heart
                    size={18}
                    className="transition-colors duration-300"
                    strokeWidth={favorite ? 2.5 : 2}
                    color={favorite ? '#ef4444' : 'rgba(255, 255, 255, 0.7)'}
                    fill={favorite ? '#ef4444' : 'transparent'}
                />
            </motion.div>
        </motion.button>
    );
}
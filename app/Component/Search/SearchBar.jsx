'use client';

import  { useState, useEffect, useRef } from 'react';
import { useGameSearch } from '../../hooks/games/useGame';
import SearchDropdown from './SearchDropdown';
import { Search, X } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function SearchBar() {
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedTerm, setDebouncedTerm] = useState('');
    const [isDropdownVisible, setIsDropdownVisible] = useState(false);
    const searchRef = useRef(null);
    const router = useRouter();

    // --- מנגנון DEBOUNCE ---
    // מונע שליחת בקשה לשרת על כל לחיצת מקש. מחכה שהמשתמש יסיים להקליד.
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedTerm(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm]);

    const { data, isLoading } = useGameSearch(debouncedTerm);

    // --- לוגיקת סגירה בלחיצה בחוץ ---
    useEffect(() => {
        const handleClickOutside = (event) => {
            // אם הלחיצה הייתה מחוץ לאלמנט שעליו יושב ה-Ref
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setIsDropdownVisible(false); // סוגר את התפריט
            }
        };

        // מאזין לאירוע לחיצה בכל הדף
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // פונקציה לניקוי החיפוש וסגירה
    const handleCloseSearch = () => {
        setSearchTerm("");
        setDebouncedTerm("");
        setIsDropdownVisible(false);
    };

    // פונקציה לטיפול בלחיצה על Enter בשדה החיפוש
    const handleKeyDown = (e) => {
        // בודק אם המשתמש לחץ על Enter ואם יש טקסט בתיבת החיפוש
        if (e.key === "Enter" && searchTerm.trim()) {
            // סוגר את הדרופדאון (אופציונלי)
            setIsDropdownVisible(false);

            // מעביר לעמוד החיפוש עם הפרמטר q
            //  encodeURIComponent כדי לטפל ברווחים ותווים מיוחדים
            router.push(`/Search?q=${encodeURIComponent(searchTerm.trim())}`);
        }
    };


    return (
        <div
            className="relative w-full max-w-xl mx-auto z-[100]"
            ref={searchRef}
        >
            {/* מעטפת ה-Input עם אפקטים עיצוביים */}
            <div className={`relative group transition-all duration-500 ${isDropdownVisible ? 'scale-[1.02]' : 'scale-100'}`}>

                {/* אפקט תאורת ניאון אחורית (Glow) שמופיע בזמן פוקוס */}
                <div className={`absolute -inset-1 bg-gradient-to-r from-cyan-500 to-purple-600 rounded-xl blur opacity-20 group-focus-within:opacity-40 transition duration-1000 group-focus-within:duration-200 ${isDropdownVisible ? 'opacity-40' : 'opacity-0'}`}></div>

                {/* שדה הקלט המרכזי */}
                <div className="relative flex items-center">
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setIsDropdownVisible(true);
                        }}
                        onFocus={() => setIsDropdownVisible(true)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search for games, genres or creators..."
                        className="w-full bg-[#0b0e14]/80 backdrop-blur-md border border-white/10 text-white placeholder-slate-500 py-4 px-12 rounded-xl transition-all duration-300 outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/10 text-sm font-medium shadow-2xl"
                    />

                    {/* אייקון חיפוש שזז ומשנה צבע בפוקוס */}
                    <div className={`absolute left-4 transition-all duration-300 ${searchTerm ? 'text-cyan-400' : 'text-slate-500'} group-focus-within:scale-110`}>
                        <Search className={isLoading ? "animate-pulse" : ""} />
                    </div>

                    {/* כפתור ניקוי (X) עם אנימציית הופעה */}
                    {searchTerm && (
                        <button
                            onClick={handleCloseSearch}
                            className="absolute right-4 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all animate-in fade-in zoom-in duration-200"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* --- חלונית התוצאות (SearchDropdown) --- */}
            {/*  תנאי שמוודא שהיא מוצגת רק כשהיא אמורה להיות גלויה */}
            <div className={`transition-all duration-300 origin-top ${isDropdownVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                }`}>
                <SearchDropdown
                    data={data}
                    isLoading={isLoading}
                    isVisible={isDropdownVisible}
                    onItemClick={handleCloseSearch}
                    searchTerm={searchTerm}
                />
            </div>
        </div>
    );
}
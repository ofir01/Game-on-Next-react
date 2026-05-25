"use client";
import { Calendar } from 'lucide-react';

export default function FormatDate({ releaseDate }) {
    const formatDate = (dateString) => {
        if (!dateString) return 'Coming Soon';
        return new Date(dateString).toLocaleDateString('he-IL', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    return (
        <div className="flex items-center gap-2 text-cyan-400">
            <Calendar className="w-5 h-5" />
            <span className="font-bold">{formatDate(releaseDate)}</span>
        </div>
    )
}







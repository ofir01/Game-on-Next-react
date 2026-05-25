import React from 'react'
import { Star } from 'lucide-react';

export default function RatingStars({ rating }) {
    if (rating === undefined || rating === null) return <span className="text-xs text-gray-500 italic">No rating</span>;

    return (
        <div className="flex gap-0.5" title={`Rated ${rating} out of 5`}>
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${star <= rating
                            ? 'fill-yellow-400 text-yellow-400 drop-shadow-sm'
                            : 'text-gray-700'
                        }`}
                />
            ))}
        </div>
    );
}






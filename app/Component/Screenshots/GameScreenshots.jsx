"use client";
import SmartImage from '../SmartImage/SmartImage'; // קומפוננטה חכמה לטיפול בתמונות (טעינה, גיבוי, וכו') 

export default function GameScreenshots({ screenshots }) {
  if (!screenshots || screenshots.length === 0) return null;

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 p-6 bg-gray-900 rounded-2xl border border-gray-800 shadow-xl">
      <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-cyan-400">
        Gallery & Screenshots
      </h3>

      <div className="flex flex-col gap-8">
        {screenshots.map((url, index) => (
          <div key={index} className="group relative">
            <SmartImage
              url={url}
              alt={`Game screenshot ${index + 1}`}
              // כאן הזנתי את ה-CSS המדויק של ה-IndividualScreenshot שלך
              containerClassName="aspect-video rounded-xl border border-gray-700 bg-gray-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:border-cyan-500/50"
              imageClassName="w-full h-full object-cover"
            />
            {/* הגרדיאנט של ה-Hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}







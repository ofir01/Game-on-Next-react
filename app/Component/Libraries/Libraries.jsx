import { useMemo } from "react";


//הסיפריות שהפרוייקט משתמש בהם
const PROJECT_LIBRARIES = [
    {
        name: "Next.js",
        packageName: "next",
        image: "/imges/lib/Next.svg",
        detail: "App Router",
    },
    {
        name: "React",
        packageName: "react",
        image: "/imges/lib/React.svg",
        detail: "UI runtime",
    },
    {
        name: "Tailwind CSS",
        packageName: "tailwindcss",
        image: "/imges/lib/TailwindCSS.svg",
        detail: "Styling",
    },
    {
        name: "MySQL",
        packageName: "mysql2",
        image: "/imges/lib/mysql.svg",
        detail: "Database driver",
    },
    {
        name: "Sequelize",
        packageName: "sequelize",
        image: "/imges/lib/sequelize.svg",
        detail: "ORM",
    },
    {
        name: "JavaScript",
        packageName: "language",
        image: "/imges/lib/JavaScript.svg",
        detail: "Client logic",
    },
];

// רכיב שמציג את הספריות והטכנולוגיות שבהן הפרוייקט משתמש, עם אנימציית מרקיזה חלקה שמכפילה את הרשימה כדי ליצור לולאה אינסופית, ומוודאים שהרשימה המקורית לא משתנה כדי לאפס את האנימציה. כל פריט מציג לוגו, שם, פרטים וקישור לחבילה.
export default function Libraries({ libraries = PROJECT_LIBRARIES }) {
    // מכפילים את הרשימה כדי ליצור לולאה אינסופית חלקה, ומוודאים שהרשימה המקורית לא משתנה כדי לאפס את האנימציה.
    const items = useMemo(() => [...libraries, ...libraries], [libraries]);//A → B → C → A → B → C → (loop)

    return (
        <div className="relative overflow-hidden border-y border-cyan-200/20 bg-[linear-gradient(90deg,rgba(15,23,42,0.75),rgba(20,83,45,0.42),rgba(88,28,135,0.45))] py-4">
            <div className="gameon-marquee flex w-max gap-4">
                {items.map((library, index) => (
                    <div
                        key={`${library.name}-${index}`}
                        className="flex h-16 min-w-72 items-center gap-3 rounded-lg border border-white/15 bg-black/45 px-3 shadow-[0_12px_40px_rgba(0,0,0,0.22)] backdrop-blur"
                    >
                        <img
                            src={library.image}
                            alt={`${library.name} logo`}
                            loading="lazy"
                            decoding="async"
                            className="h-10 w-10 rounded-md object-contain"
                        />
                        <span>
                            <span className="block font-bold text-white">{library.name}</span>
                            <span className="block text-xs text-cyan-100/80">
                                {library.detail}
                            </span>
                        </span>
                        <span className="ml-auto rounded-md border border-white/10 px-2 py-1 text-xs text-zinc-200">
                            {library.packageName}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

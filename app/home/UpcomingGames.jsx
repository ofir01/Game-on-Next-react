import { SectionHeader, EmptySection, Reveal } from "./page.jsx";
import { Sparkles } from "lucide-react";
import Link from "next/link";

export default function UpcomingGames({ upcomingGames = [] }) {
    // רשימת משחקים שמופיעה במדור של המשחקים הקרובים, עם מידע שמגיע מהשרת ועם אפשרות להפחית תנועה למשתמשים שזקוקים לכך.
    function UpcomingReleaseList({ games }) {
        return (
            <Reveal>
                <div className="overflow-hidden rounded-lg border border-white/10 bg-zinc-950">
                    {games.map((game) => (
                        <Link
                            key={game?.title}
                            href={`/games/${game?.title}`}
                            className="grid gap-4 border-t border-white/10 p-5 first:border-t-0 md:grid-cols-[120px_1fr_auto]"
                        >
                            <div className="font-mono text-sm font-black uppercase tracking-[0.18em] text-lime-300">
                                {formatReleaseDate(game?.releaseDate)}
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white">{game?.title}</h3>
                                <p className="mt-1 text-sm text-zinc-400">
                                    {(game?.categories || []).slice(0, 2).join(" / ") || game?.status}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 text-sm font-bold text-cyan-100">
                                <Sparkles className="h-4 w-4" />
                                {game?.price}
                            </div>
                        </Link>
                    ))}
                </div>
            </Reveal>
        );
    }

    // מתרגם את תאריך היציאה מהשרת לטקסט שמופיע בכרטיס המשחק, עם טיפול מיוחד במקרה של תאריך לא ידוע.
    function formatReleaseDate(date) {
        if (!date) {
            return "Date TBA";
        }

        return new Intl.DateTimeFormat("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        }).format(new Date(date));
    }

    return (
        <section id="arena" className="border-y border-white/10 bg-[linear-gradient(135deg,#10151f,#082f49_48%,#16121f)] py-20 md:py-28">
            <div className="mx-auto grid max-w-[1600px] gap-12 px-5 md:px-8 lg:grid-cols-[1.08fr_0.92fr] lg:px-12">
                <div>
                    <SectionHeader
                        eyebrow="Coming next"
                        title="Come back for the games that are almost ready."
                        text="See what is on the way, check the release window, and jump into each game page when you want the details."
                    />
                    <div className="mt-10">
                        {upcomingGames.length ? (
                            <UpcomingReleaseList games={upcomingGames} />
                        ) : (
                            <EmptySection
                                title="No upcoming games yet"
                                text="Games marked as coming soon in the database will show up here."
                            />
                        )}
                    </div>
                </div>

                <Reveal delay={0.12}>
                    <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-[#070909]">
                        <img
                            src="/Games/WordHunter/background3.png"
                            alt="Word Hunter arena background"
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover opacity-55"
                        />
                        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,9,9,0.15),rgba(7,9,9,0.98))]" />
                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                            <div className="inline-flex h-14 w-14 items-center justify-center rounded-lg bg-lime-300 text-black">
                                <Sparkles className="h-7 w-7" />
                            </div>
                            <h3 className="mt-6 text-4xl font-black text-white">
                                Release radar
                            </h3>
                            <p className="mt-4 text-base leading-7 text-zinc-300">
                                This panel highlights games that are marked as coming soon or
                                have a future release date in the database.
                            </p>
                        </div>
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

import { SectionHeader, EmptySection, Reveal } from "./page.jsx";
import { ArrowRight, BadgePercent, Play, Trophy } from "lucide-react";
import Link from "next/link";

export default function TopRatedGames({ topRatedGames }) {

    // כרטיסיה שלמשחקים מובילים
    function TopRatedGameCard({ game, index }) {
        return (
            <Reveal delay={index * 0.06}>
                <article className="min-h-64 rounded-lg border border-white/10 bg-[#12110f] p-6 transition hover:-translate-y-1 hover:border-amber-200/50">
                    <div className="flex items-start justify-between gap-4">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-lg bg-amber-200 text-black">
                            <Trophy className="h-6 w-6" />
                        </div>
                        <span className="rounded-md border border-amber-200/30 px-3 py-1 text-xs font-bold text-amber-100">
                            {game?.rating} rating
                        </span>
                    </div>
                    <h3 className="mt-6 text-2xl font-black text-white">{game?.title}</h3>
                    <p className="mt-3 min-h-14 text-sm leading-6 text-zinc-400">
                        {game?.description}
                    </p>
                    <div className="mt-8 flex items-center justify-between">
                        <p className="text-3xl font-black text-amber-100">{game?.price}</p>
                        <Link
                            href={`/games/${game?.title}`}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-black transition hover:bg-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-200/30 active:scale-[0.98]"
                        >
                            <Play className="h-4 w-4 fill-black" />
                            Open
                        </Link>
                    </div>
                </article>
            </Reveal>
        );
    }

    return (
        <section id="top-rated-games" className="bg-[#0a0d12] py-20 md:py-28">
            <div className="mx-auto grid max-w-[1600px] gap-12 px-5 md:px-8 lg:grid-cols-[0.78fr_1.22fr] lg:px-12">
                <div>
                    <SectionHeader
                        eyebrow="Top rated"
                        title="Games players are rating highest right now."
                        text="This replaces the old Premium drops area with live database data, sorted by player rating from the home API."
                    />
                    <Reveal delay={0.1}>
                        <Link
                            href="#arena"
                            className="mt-8 inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-white/15 bg-white px-5 py-3 font-black text-black transition hover:bg-amber-200 focus:outline-none focus:ring-4 focus:ring-amber-200/30 active:scale-[0.98]"
                        >
                            <BadgePercent className="h-5 w-5" />
                            View schedule
                            <ArrowRight className="h-5 w-5" />
                        </Link>
                    </Reveal>
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                    {topRatedGames?.length ? (
                        topRatedGames.map((game, index) => (
                            <TopRatedGameCard key={game.title} game={game} index={index} />
                        ))
                    ) : (
                        <div className="md:col-span-3">
                            <EmptySection
                                title="No rated games yet"
                                text="After players rate games, the highest rated ones will appear in this live section."
                            />
                        </div>
                    )}
                </div>
            </div>
        </section>
    )
}

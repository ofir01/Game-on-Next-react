import { SectionHeader, EmptySection, Reveal } from "./page.jsx";
import { Star, Users, Gamepad2, Play, ShoppingBag } from "lucide-react";
import Link from "next/link";

export default function FeaturedGames({ featuredGames, isLoading }) {
    // כרטיס משחק מוביל שמופיע  בראש העמוד, עם מידע עשיר שמגיע מהשרת ועם אפשרות להפחית תנועה למשתמשים שזקוקים לכך.
    function FeaturedGameCard({ game, index }) {
        return (
            <Reveal delay={index * 0.05}>
                <article
                    className="group relative min-h-[520px] overflow-hidden rounded-lg border border-white/10 bg-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.35)]"
                    >
                    <Link href={game?.title} className="absolute inset-0 z-10">
                        <span className="sr-only">View details for {game?.title}</span>
                    </Link>
                    <img
                        src={game?.imageUrl}
                        alt={`${game?.title} gameplay art`}
                        loading={index < 2 ? "eager" : "lazy"}
                        decoding="async"
                        className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(5,5,5,0.05)_0%,rgba(8,8,8,0.52)_42%,rgba(8,8,8,0.96)_100%)]" />
                    <div
                        className="absolute left-0 top-0 h-1 w-full"
                    />

                    <div className="absolute inset-x-0 bottom-0 z-20 p-5 md:p-6">
                        <div className="mb-4 flex flex-wrap gap-2">
                            <span className="rounded-md border border-white/15 bg-black/50 px-3 py-1 text-xs font-bold text-white">
                                {game?.status}
                            </span>
                            <span className="rounded-md border border-white/15 bg-black/50 px-3 py-1 text-xs font-bold text-white">
                                {game?.price}
                            </span>
                        </div>
                        <h3 className="text-2xl font-black leading-tight text-white">
                            {game?.title}
                        </h3>
                        <p className="mt-3 min-h-16 text-sm leading-6 text-zinc-300">
                            {game?.description}
                        </p>

                        <div className="mt-5 grid grid-cols-3 gap-2 text-sm">
                            <div className="rounded-md bg-white/10 p-3">
                                <Star className="mb-2 h-4 w-4 text-amber-300" />
                                <p className="font-black text-white">{game?.avgRating}</p>
                                <p className="text-xs text-zinc-400">Rating</p>
                            </div>
                            <div className="rounded-md bg-white/10 p-3">
                                <Users className="mb-2 h-4 w-4 text-cyan-200" />
                                <p className="font-black text-white">{game?.playCount}</p>
                                <p className="text-xs text-zinc-400">Players</p>
                            </div>
                            <div className="rounded-md bg-white/10 p-3">
                                <Gamepad2 className="mb-2 h-4 w-4 text-lime-300" />
                                <p className="font-black text-white">{game?.status || "Catalog"}</p>
                                <p className="text-xs text-zinc-400">{game?.categories?.[0] || "Game"}</p>
                            </div>
                        </div>

                        <div className="mt-5 flex gap-3">
                            <Link
                                href={game?.title}
                                className="relative z-30 inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-black transition hover:bg-lime-300 focus:outline-none focus:ring-4 focus:ring-white/30 active:scale-[0.98]"
                            >
                                <Play className="h-4 w-4 fill-black" />
                                Play
                            </Link>
                            <Link
                                href="#top-rated-games"
                                className="relative z-30 inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg border border-white/15 bg-black/45 px-4 text-sm font-black text-white transition hover:border-cyan-300 hover:text-cyan-100 focus:outline-none focus:ring-4 focus:ring-cyan-300/30 active:scale-[0.98]"
                            >
                                <ShoppingBag className="h-4 w-4" />
                                Store
                            </Link>
                        </div>
                    </div>
                </article>
            </Reveal>
        );
    }


    
    return (
        <section id="free-games" className="bg-[linear-gradient(180deg,#0a0d12,#0f172a_45%,#0a0d12)] py-20 md:py-28">
            <div className="mx-auto max-w-[1600px] px-5 md:px-8 lg:px-12">
                <SectionHeader
                    eyebrow="Play your way"
                    title="Pick a game, launch it online, then rate the experience."
                    text="Find free browser games, see what other players are choosing, open the game page, and leave your rating or comment after the round."
                />

                {featuredGames?.length ? (
                    <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                        {featuredGames.map((game, index) => (
                            <FeaturedGameCard
                                key={game.title}
                                game={game}
                                index={index}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="mt-12">
                        <EmptySection
                            title={isLoading ? "Loading games..." : "No games to show yet"}
                            text="When games are available in the database, they will appear here automatically."
                        />
                    </div>
                )}
            </div>
        </section>
    )
}

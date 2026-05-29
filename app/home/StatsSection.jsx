import { Reveal } from "./page.jsx";

export default function Stats({ stats }) {
    // בונה את פס המספרים מהספירות שהשרת מחזיר לעמוד הבית.
    const buildLiveStats = [
        {
            label: "Play in browser",
            value: stats?.gamesCount || 0,
            detail: "games ready online",
        },
        {
            label: "Players joined",
            value: stats?.usersCount || 0,
            detail: "accounts in the arena",
        },
        {
            label: "Ways to play",
            value: stats?.categoriesCount || 0,
            detail: "genres to explore",
        },
        {
            label: "Next releases",
            value: stats?.upcomingCount || 0,
            detail: "games worth following",
        },
    ];

    return (
        <section className="bg-[#0a0d12]">
            <div className="mx-auto max-w-[1600px] px-5 md:px-8 lg:px-12">
                <Reveal>
                    <div className="grid grid-cols-2 border-y border-white/10 bg-black/20 md:grid-cols-4">
                        {buildLiveStats?.map((stat) => (
                            <div
                                key={stat.label}
                                className="min-h-32 border-white/10 px-5 py-6 first:border-l-0 md:border-l"
                            >
                                <p className="text-4xl font-black text-white">{stat.value}</p>
                                <p className="mt-2 text-sm font-semibold text-zinc-200">
                                    {stat.label}
                                </p>
                                <p className="mt-1 text-sm text-zinc-500">{stat.detail}</p>
                            </div>
                        ))}
                    </div>
                </Reveal>
            </div>
        </section>
    )
}

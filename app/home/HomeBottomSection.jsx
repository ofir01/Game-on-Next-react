import Link from "next/link";
import { Play } from "lucide-react";
export default function HomeBottomSection() {
    return (
        <section className="bg-[#d7ff3f] px-5 py-14 text-black md:px-8 lg:px-12">
            <div className="mx-auto flex max-w-[1600px] flex-col gap-8 md:flex-row md:items-center md:justify-between">
                <div>
                    <p className="font-bold">Ready for your next game?</p>
                    <h2 className="mt-2 text-4xl font-black md:text-6xl">
                        Play online, then tell everyone what you think.
                    </h2>
                </div>
                <Link
                    href="#free-games"
                    className="inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-black px-6 py-3 font-black text-white transition hover:bg-zinc-800 focus:outline-none focus:ring-4 focus:ring-black/30 active:scale-[0.98]"
                >
                    <Play className="h-5 w-5 fill-white" />
                    Browse games
                </Link>
            </div>
        </section>
    )
}

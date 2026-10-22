

import { Play, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";
import GameModel3D from "../Component/game/GameModel3D/GameModel3D.jsx";

import { Reveal } from "./page.jsx";


export default function GamePortalScene({ featuredGames }) {
    return (
        <section
            className="relative isolate min-h-[760px] overflow-hidden border-b border-white/10 bg-[radial-gradient(circle_at_18%_20%,rgba(34,197,94,0.24),transparent_34%),radial-gradient(circle_at_78%_10%,rgba(14,165,233,0.24),transparent_30%),radial-gradient(circle_at_72%_78%,rgba(168,85,247,0.20),transparent_32%),#0a0d12] md:min-h-[820px] lg:min-h-[860px]"
            style={{ width: "100dvw", maxWidth: "100dvw" }}
        >
            <div className="gameon-grid absolute inset-0 opacity-80" />
            <div className="gameon-scanlines pointer-events-none absolute inset-0 opacity-35" />
            <div className="absolute inset-x-0 bottom-0 h-44 bg-[linear-gradient(180deg,rgba(10,13,18,0),#0a0d12)]" />

            <motion.div
                style={{
                    width: "min(1600px, 100dvw)",
                    maxWidth: "100dvw"
                }}
                className="relative z-10 mx-auto grid min-h-[700px] items-start gap-12 overflow-hidden bg-[linear-gradient(135deg,rgba(34,197,94,0.08),rgba(14,165,233,0.06)_42%,rgba(168,85,247,0.05)_78%,transparent)] px-5 pb-12 pt-12 md:min-h-[760px] md:px-8 md:pt-16 lg:min-h-[800px] lg:grid-cols-[0.92fr_1.08fr] lg:px-12 lg:pt-20"
            >
                <div className="min-w-0 max-w-3xl">
                    <Reveal instant delay={0.06}>
                        <h1
                            className="text-5xl font-black leading-[0.96] text-white md:text-7xl lg:text-8xl"
                            style={{ maxWidth: "min(42rem, calc(100dvw - 40px))" }}
                        >
                            Game-On Arcade
                        </h1>
                    </Reveal>
                    <Reveal instant delay={0.12}>
                        <p
                            className="mt-6 break-words text-lg leading-8 text-zinc-300 md:text-xl"
                            style={{ maxWidth: "min(42rem, calc(100dvw - 40px))" }}
                        >
                            Browser Gaming, Evolved. Curated catalogs, upcoming drops, and the stack that powers it all. Play instantly.
                        </p>
                    </Reveal>
                    <Reveal instant delay={0.18}>
                        <div className="mt-8">
                            <div
                                className="flex flex-col gap-3 sm:flex-row"
                                style={{
                                    width: "min(36rem, calc(100dvw - 40px))",
                                    maxWidth: "100%"
                                }}
                            >
                                <Link
                                    href="#free-games"
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg bg-lime-300 px-6 py-3 font-black text-black transition hover:bg-white focus:outline-none focus:ring-4 focus:ring-lime-300/40 active:scale-[0.98] sm:w-auto"
                                >
                                    <Play className="h-5 w-5 fill-black" />
                                    Play Free
                                </Link>
                                <Link
                                    href="#top-rated-games"
                                    className="inline-flex min-h-12 w-full items-center justify-center gap-3 rounded-lg border border-white/15 bg-white/8 px-6 py-3 font-black text-white transition hover:border-cyan-300 hover:bg-cyan-300/10 focus:outline-none focus:ring-4 focus:ring-cyan-300/30 active:scale-[0.98] sm:w-auto"
                                >
                                    <ShoppingBag className="h-5 w-5" />
                                    Top Rated
                                </Link>
                            </div>
                        </div>
                    </Reveal>
                </div>

                {/* Game Portal Scene */}
                <Reveal instant delay={0.18} className="min-w-0">
                    <GameModel3D games={featuredGames} />
                </Reveal>
            </motion.div>
        </section>
    )
}



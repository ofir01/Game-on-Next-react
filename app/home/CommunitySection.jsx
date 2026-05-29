

import {  SectionHeader, Reveal } from "./page.jsx";
import {  CircleDollarSign, Headphones, MousePointerClick,  ShieldCheck } from "lucide-react";

// טקסטים קבועים בלבד; כל רשימות המשחקים והמספרים מגיעים מה-DB.
export const perks = [
    {
        title: "Play online now",
        text: "Open a game in the browser, start a quick round, and continue without installing anything.",
        icon: MousePointerClick,
    },
    {
        title: "Rate what you played",
        text: "Leave a score after a session so other players know which games are actually worth their time.",
        icon: CircleDollarSign,
    },
    {
        title: "React and comment",
        text: "Share feedback, ask for updates, and help shape what gets improved next.",
        icon: ShieldCheck,
    },
    {
        title: "Follow what is coming",
        text: "Check upcoming games, save your favorites, and come back when a new title goes live.",
        icon: Headphones,
    },
];

export default function CommunitySection() {
    // בסוף העמוד מידע
    function PerkGrid({ perks }) {
        return (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {perks.map((perk, index) => {
                    const Icon = perk.icon;

                    return (
                        <Reveal key={perk.title} delay={index * 0.05}>
                            <article className="min-h-60 rounded-lg border border-white/10 bg-black/30 p-6">
                                <Icon className="h-8 w-8 text-cyan-200" />
                                <h3 className="mt-5 text-xl font-black text-white">
                                    {perk.title}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-zinc-400">
                                    {perk.text}
                                </p>
                            </article>
                        </Reveal>
                    );
                })}
            </div>
        );
    }

    return (
        <section className="bg-[#0a0d12] py-20 md:py-28">
            <div className="mx-auto max-w-[1600px] px-5 md:px-8 lg:px-12">
                <SectionHeader
                    eyebrow="Your voice matters"
                    title="Play, rate, react, and help the best games rise."
                    text="Every visit should feel useful: jump into a browser game, check ratings, leave feedback, and come back for new releases chosen by the community."
                    align="center"
                />
                <div className="mt-12">
                    <PerkGrid perks={perks} />
                </div>
            </div>
        </section>
    )
}

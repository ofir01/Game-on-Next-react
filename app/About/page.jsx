'use client';

import { motion } from 'framer-motion';
import { Gamepad2, Users, Globe, ShieldCheck, Zap } from 'lucide-react';

export default function About() {
    return (
        <div className="min-h-screen bg-[#0b1220] text-slate-200 px-6 md:px-16 py-16 relative overflow-hidden">

            {/* BACKGROUND */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-[-200px] left-[-200px] w-[500px] h-[500px] bg-purple-500/20 rounded-full blur-[140px]" />
                <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[140px]" />
            </div>

            {/* HERO */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-center max-w-3xl mx-auto"
            >
                <div className="flex justify-center mb-6">
                    <div className="p-4 rounded-2xl bg-purple-600/20 border border-purple-500/20">
                        <Gamepad2 size={40} className="text-purple-300" />
                    </div>
                </div>

                <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">
                    Welcome to GameOn
                </h1>

                <p className="text-slate-400 mt-4 text-lg leading-relaxed">
                    A next-generation browser gaming platform where you can discover, play, and purchase premium indie games instantly — no downloads required.
                </p>
            </motion.div>

            {/* STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-5xl mx-auto">

                <Stat icon={<Users />} label="Active Players" value="120K+" />
                <Stat icon={<Globe />} label="Countries" value="42+" />
                <Stat icon={<Gamepad2 />} label="Games Hosted" value="850+" />
                <Stat icon={<ShieldCheck />} label="Secure Payments" value="100%" />
            </div>

            {/* FEATURES */}
            <div className="mt-20 max-w-5xl mx-auto grid md:grid-cols-3 gap-6">

                <Feature
                    icon={<Zap />}
                    title="Instant Play"
                    desc="Launch any game directly in your browser with zero installation time."
                />

                <Feature
                    icon={<ShieldCheck />}
                    title="Secure Platform"
                    desc="All purchases and user data are encrypted and fully protected."
                />

                <Feature
                    icon={<Gamepad2 />}
                    title="Curated Games"
                    desc="Only high-quality indie and browser-native games make it to our platform."
                />
            </div>

            {/* FOOTER TEXT */}
            <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                className="text-center mt-20 text-slate-500 text-sm max-w-2xl mx-auto"
            >
                GameForge is built for gamers and developers who believe in instant access, creativity, and freedom in gaming.
            </motion.div>

        </div>
    );
}

/* ---------- STAT CARD ---------- */

function Stat({ icon, label, value }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 text-center hover:scale-[1.03] transition-all duration-300">
            <div className="flex justify-center text-purple-300 mb-2">
                {icon}
            </div>
            <div className="text-xl font-bold">{value}</div>
            <div className="text-xs text-slate-400">{label}</div>
        </div>
    );
}

/* ---------- FEATURE CARD ---------- */

function Feature({ icon, title, desc }) {
    return (
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1">
            <div className="text-purple-300 mb-3">{icon}</div>
            <h3 className="font-bold text-lg mb-2">{title}</h3>
            <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
        </div>
    );
}
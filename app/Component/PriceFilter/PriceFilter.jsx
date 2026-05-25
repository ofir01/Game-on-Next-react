"use client";

import React, { useState, useEffect } from "react";
import { DollarSign, ChevronUp, ChevronDown } from "lucide-react";

export default function PriceFilter({ currentMin, currentMax, onApply }) {
    const [min, setMin] = useState(currentMin || "");
    const [max, setMax] = useState(currentMax || "");

    // סנכרון הסטייט המקומי במידה והמשתמש מנקה את הפילטרים דרך כפתור "Clear All"
    useEffect(() => {
        setMin(currentMin || "");
        setMax(currentMax || "");
    }, [currentMin, currentMax]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onApply(min, max);
    };

    // העלאה/הורדה מותאמת אישית
    const changeValue = (type, amount) => {
        if (type === "min") {
            const current = Number(min) || 0;
            setMin(String(Math.max(0, current + amount)));
        } else {
            const current = Number(max) || 0;
            setMax(String(Math.max(0, current + amount)));
        }
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="relative overflow-hidden rounded-lg border border-white/10 bg-gradient-to-br from-[#1b1d31] via-[#1f2038] to-[#171827] p-1 shadow-[0_0_6px_rgba(0,0,0,0.15)] backdrop-blur-md"
        >
            <div className="relative flex items-center gap-1">
                
                {/* שדה מינימום */}
                <div className="flex-1">
                    <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/25 transition-all duration-300 focus-within:border-cyan-400/40">

                        <DollarSign
                            size={12}
                            className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-cyan-300"
                        />

                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Min"
                            value={min}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, "");
                                setMin(value);
                            }}
                            className="w-full bg-transparent py-1.5 pl-5 pr-6 text-[11px] text-white placeholder:text-slate-500 focus:outline-none"
                        />

                        {/* חצים מותאמים */}
                        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col gap-[2px]">
                            <button
                                type="button"
                                onClick={() => changeValue("min", 1)}
                                className="flex h-3 w-3 items-center justify-center rounded bg-white/5 text-slate-400 transition-all duration-200 hover:bg-cyan-400/20 hover:text-cyan-300"
                            >
                                <ChevronUp size={8} />
                            </button>

                            <button
                                type="button"
                                onClick={() => changeValue("min", -1)}
                                className="flex h-3 w-3 items-center justify-center rounded bg-white/5 text-slate-400 transition-all duration-200 hover:bg-cyan-400/20 hover:text-cyan-300"
                            >
                                <ChevronDown size={8} />
                            </button>
                        </div>
                    </div>
                </div>

                <span className="text-slate-600 text-xs font-bold">—</span>

                {/* שדה מקסימום */}
                <div className="flex-1">
                    <div className="group relative overflow-hidden rounded-lg border border-white/10 bg-black/25 transition-all duration-300 focus-within:border-green-400/40">

                        <DollarSign
                            size={12}
                            className="absolute left-1.5 top-1/2 z-10 -translate-y-1/2 text-slate-500 transition-colors duration-300 group-focus-within:text-green-300"
                        />

                        <input
                            type="text"
                            inputMode="numeric"
                            placeholder="Max"
                            value={max}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, "");
                                setMax(value);
                            }}
                            className="w-full bg-transparent py-1.5 pl-5 pr-6 text-[11px] text-white placeholder:text-slate-500 focus:outline-none"
                        />

                        {/* חצים מותאמים */}
                        <div className="absolute right-1 top-1/2 flex -translate-y-1/2 flex-col gap-[2px]">
                            <button
                                type="button"
                                onClick={() => changeValue("max", 1)}
                                className="flex h-3 w-3 items-center justify-center rounded bg-white/5 text-slate-400 transition-all duration-200 hover:bg-green-400/20 hover:text-green-300"
                            >
                                <ChevronUp size={8} />
                            </button>

                            <button
                                type="button"
                                onClick={() => changeValue("max", -1)}
                                className="flex h-3 w-3 items-center justify-center rounded bg-white/5 text-slate-400 transition-all duration-200 hover:bg-green-400/20 hover:text-green-300"
                            >
                                <ChevronDown size={8} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* כפתור */}
            <button
                type="submit"
                className="group relative mt-1.5 w-full overflow-hidden rounded-lg border border-green-400/20 bg-gradient-to-r from-cyan-500/15 via-emerald-500/15 to-green-500/15 py-1.5 text-[11px] font-bold text-white transition-all duration-300 hover:border-green-400/40"
            >
                <span className="relative z-10 tracking-wide">
                    Apply Price
                </span>
            </button>
        </form>
    );
}
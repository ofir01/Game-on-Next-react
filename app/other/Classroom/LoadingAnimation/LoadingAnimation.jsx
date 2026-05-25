"use client";

import "./LoadingAnimation.css";

export default function LoadingAnimation() {
    return (
        <div className="loadingContiner" >
            <div className="p-12 document-card rounded-3xl text-center border-t-8 border-cyan-400 max-w-sm w-full relative overflow-hidden text-white">
                {/* מסמך הציון */}
                <div className="relative mx-auto mb-10" style={{ width: "120px", height: "140px" }}>
                    <svg
                        className="absolute inset-0 rounded-xl"
                        viewBox="0 0 120 140"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        {/* גוף המסמך */}
                        <rect
                            x="20"
                            y="5"
                            width="80"
                            height="120"
                            rx="10"
                            fill="#0f172a"
                            stroke="#3b82f6"
                            strokeWidth="2.5"
                        />

                        {/* קווים פנימיים */}
                        <path d="M35 30 H85" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                        <path d="M35 45 H70" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
                        <path d="M35 60 H85" stroke="#10b981" strokeWidth="3" strokeLinecap="round" />
                        <path d="M35 75 H65" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />

                        {/* סימן V */}
                        <circle cx="85" cy="20" r="10" fill="#10b981" />
                        <path
                            d="M80 20 L84 24 L92 16"
                            stroke="white"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />

                        {/* קו סריקה */}
                        <rect
                            x="25"
                            y="10"
                            width="70"
                            height="4"
                            fill="#67e8f9"
                            className="scan-line"
                            style={{ transformOrigin: "top" }}
                        />
                    </svg>
                </div>

                {/* ציון 1 */}
                <div className="absolute inset-0 pointer-events-none">
                    <span
                        className="absolute top-3/4 left-1/4 text-5xl font-black text-blue-400 opacity-0 grade-item-1"
                        style={{
                            top: "42%",
                            left: "18%",
                            color: "#3b82f6",
                            transformOrigin: "bottom",
                            textShadow: "0 0 12px rgba(59,130,246,0.7)"
                        }}
                    >
                        A+
                    </span>

                    {/* ציון 2 */}
                    <span
                        className="absolute top-4/5 right-1/4 text-4xl font-extrabold text-cyan-400 opacity-0 grade-item-2"
                        style={{
                            top: "48%",
                            right: "20%",
                            color: "#10b981",
                            transformOrigin: "bottom",
                            textShadow: "0 0 12px rgba(16,185,129,0.7)"
                        }}
                    >
                        95
                    </span>

                    {/* ציון 3 */}
                    <span
                        className="absolute top-2/3 right-1/2 text-3xl font-bold text-indigo-400 opacity-0 grade-item-3"
                        style={{
                            top: "40%",
                            right: "50%",
                            color: "#818cf8",
                            transformOrigin: "bottom",
                            textShadow: "0 0 12px rgba(129,140,248,0.7)"
                        }}
                    >
                        100
                    </span>
                    {/* ציון 4 */}
                    <span
                        className="absolute top-2/3 right-1/2 text-3xl font-bold text-indigo-400 opacity-0 grade-item-3"
                        style={{
                            top: "18%",
                            right: "30%",
                            color: "#ec4899",
                            transformOrigin: "bottom",
                            textShadow: "0 0 12px rgba(236,72,153,0.7)"
                        }}
                    >
                        +B
                    </span>
                </div>

                {/* טקסט סטטוס */}
                <p className="text-2xl font-bold text-white mt-4">...Loading</p>
            </div>
        </div >
    );
}

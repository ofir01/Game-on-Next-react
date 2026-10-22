"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Crown, Medal, Trophy } from "lucide-react";

// מיפוי עיצוב לכל מקום בטבלה לפי הדירוג
const rankStyles = [
    {
        label: "1",
        Icon: Crown,
        tone: "border-amber-300/45 bg-amber-300/15 text-amber-200",
        row: "from-amber-300/12",
    },
    {
        label: "2",
        Icon: Trophy,
        tone: "border-slate-200/35 bg-slate-200/12 text-slate-100",
        row: "from-slate-200/10",
    },
    {
        label: "3",
        Icon: Medal,
        tone: "border-orange-300/40 bg-orange-300/12 text-orange-200",
        row: "from-orange-300/10",
    },
];

// פונקציה לחילוץ עמודות בלבד שמכילות ערכים תקינים (לא אובייקטים מורכבים ולא id)
const getColumns = (rows = []) => {
    if (!Array.isArray(rows) || rows.length === 0) return [];
    
    const keys = new Set();
    rows.forEach((row) => {
        if (row && typeof row === "object") {
            Object.keys(row).forEach((key) => {
                // מונע הצגת שדות מזהה פנימיים או שדות לא רלוונטיים
                if (key !== "id" && key !== "updatedAt" && key !== "createdAt") {
                    keys.add(key);
                }
            });
        }
    });

    return Array.from(keys);
};

// פונקציית עזר להצגה בטוחה של תא בטבלה (מונעת קריסה מול אובייקטים)
const formatCellValue = (value) => {
    if (value === null || value === undefined) return "-";
    
    // אם הערך הוא אובייקט (למשל אובייקט user)
    if (typeof value === "object") {
        if (value.name) return value.name; // אם יש שדה name
        if (value.title) return value.title; // אם יש שדה title
        return JSON.stringify(value); // ברירת מחדל בטוחה
    }

    if (typeof value === "boolean") return value ? "Yes" : "No";

    return String(value);
};

export default function FuturisticGameResultsTable({ data = [], title, subtitle, isLoading, isError }) {
    const safeData = Array.isArray(data) ? data : [];
    const columns = useMemo(() => getColumns(safeData), [safeData]);
    const isEmpty = !isLoading && safeData.length === 0;

    return (
        <aside
            className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#101722]/90 text-white shadow-2xl shadow-black/35"
            aria-label="Top Winners Table"
        >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-4">
                <div>
                    <div className="flex items-center gap-2">
                        <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/25 bg-cyan-300/10">
                            <Trophy className="h-4.5 w-4.5 text-cyan-200" />
                        </span>
                        <h2 className="text-base font-bold leading-tight">{title}</h2>
                    </div>
                    <p className="mt-1 text-xs text-white/55">{subtitle}</p>
                </div>

                <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs font-semibold text-white/65">
                    Top {safeData.length || 3}
                </span>
            </div>

            <div className="p-3">
                {isLoading ? (
                    <div className="space-y-2">
                        {[0, 1, 2].map((item) => (
                            <div key={item} className="h-14 animate-pulse rounded-xl bg-white/7" />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="rounded-xl border border-red-300/20 bg-red-400/10 p-4 text-sm text-red-100">
                        Could not load winners.
                    </div>
                ) : isEmpty ? (
                    <div className="rounded-xl border border-dashed border-white/15 bg-white/5 p-4 text-center text-sm text-white/55">
                        No winning sessions yet.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[360px] border-collapse text-left">
                            <thead>
                                <tr className="text-[11px] uppercase text-white/45">
                                    <th className="w-12 px-2 pb-2 font-semibold">#</th>
                                    {columns.map((column) => (
                                        <th key={column} className="px-2 pb-2 font-semibold">
                                            {column}
                                        </th>
                                    ))}
                                </tr>
                            </thead>

                            <tbody className="text-sm">
                                {safeData.map((row, index) => {
                                    const rank = rankStyles[index] || rankStyles[2];
                                    const Icon = rank.Icon;

                                    return (
                                        <motion.tr
                                            key={row.id || `${index}`}
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: index * 0.06, duration: 0.25 }}
                                            className={`group border-t border-white/7 bg-gradient-to-r ${rank.row} to-transparent transition-colors duration-200 hover:bg-white/5`}
                                        >
                                            <td className="px-2 py-3 align-middle">
                                                <span className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border ${rank.tone}`}>
                                                    <Icon className="h-4 w-4" />
                                                </span>
                                            </td>

                                            {columns.map((column, columnIndex) => (
                                                <td key={column} className="max-w-[140px] px-2 py-3 align-middle">
                                                    <span className={columnIndex === 0 ? "block truncate font-semibold text-white" : "block truncate font-mono text-white/75"}>
                                                        {/* שימוש בכימוס בטוח לביצוע רינדור למחרוזת/מספר */}
                                                        {formatCellValue(row[column])}
                                                    </span>
                                                </td>
                                            ))}
                                        </motion.tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </aside>
    );
}
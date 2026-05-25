import { Check } from "lucide-react";

export default function CategoryFilter({
    categories = [],// מערך הקטגוריות להצגה
    selectedCategories,// מערך הקטגוריות שנבחרו
    onToggle,// פונקציה קריאה בעת לחיצה על קטגוריה
    isLoading,
    isError,
    error,
    keys = 'id',
    containerClassName,
    activeClassName,
    inactiveClassName,
    buttonClassName,
    Icon = Check // מאפשר להחליף את האייקון מבחוץ
}) {

    if (isLoading) {
        return (
            <div className="space-y-2 animate-pulse">
                {[...Array(6)].map((_, i) => (
                    <div
                        key={i}
                        className="h-10 rounded-2xl bg-white/[0.04] border border-white/5"
                    />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-red-400">
                Error loading genres: {error?.message}
            </div>
        );
    }

    return (
        <div className={`flex flex-wrap gap-2 ${containerClassName || ''}`}>
            {categories?.map((cat, index) => {
                const isSelected = selectedCategories.includes(cat[keys]);

                return (
                    <button
                        key={cat[keys]}
                        type="button"
                        onClick={() => onToggle(cat[keys])}
                        className={`
                            group
                            relative
                            overflow-hidden
                            ${buttonClassName}
                            ${isSelected ? activeClassName : inactiveClassName}
                            
                            backdrop-blur-xl
                            transition-all
                            duration-300
                            ease-out
                            hover:scale-[1.02]
                            active:scale-[0.98]
                            hover:-translate-y-[1px]
                        `}
                        style={{
                            animationDelay: `${index * 40}ms`
                        }}
                    >
                        {/* Glow Background */}
                        <div
                            className={`
                                absolute inset-0 opacity-0 transition-all duration-500
                                group-hover:opacity-100
                                ${isSelected
                                    ? 'bg-gradient-to-r from-purple-500/10 via-fuchsia-500/10 to-cyan-500/10'
                                    : 'bg-gradient-to-r from-white/[0.03] to-white/[0.01]'
                                }
                            `}
                        />

                        {/* Animated Border Glow */}
                        <div
                            className={`
                                absolute inset-0 rounded-[inherit] opacity-0 blur-xl transition-all duration-500
                                group-hover:opacity-100
                                ${isSelected
                                    ? 'bg-purple-500/10'
                                    : 'bg-cyan-500/5'
                                }
                            `}
                        />

                        {/* Shine Animation */}
                        <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/10 to-transparent" />

                        {/* Content */}
                        <div className="relative z-10 flex items-center justify-between w-full">

                            {/* Category Name */}
                            <span
                                className={`
                                    transition-all duration-300
                                    ${isSelected
                                        ? 'text-white font-semibold tracking-wide'
                                        : 'group-hover:text-white'
                                    }
                                `}
                            >
                                {cat.name}
                            </span>

                            {/* Icon */}
                            <div
                                className={`
                                    transition-all duration-300
                                    ${isSelected
                                        ? 'scale-100 opacity-100 rotate-0'
                                        : 'scale-50 opacity-0 rotate-[-90deg] group-hover:scale-90 group-hover:opacity-50 group-hover:rotate-0'
                                    }
                                `}
                            >
                                <div
                                    className={`
                                        flex items-center justify-center
                                        rounded-full
                                        p-1
                                        ${isSelected
                                            ? 'bg-purple-500/20 text-purple-200 shadow-[0_0_15px_rgba(168,85,247,0.25)]'
                                            : 'bg-white/5 text-slate-400'
                                        }
                                    `}
                                >
                                    <Icon size={13} />
                                </div>
                            </div>
                        </div>

                        {/* Selected Pulse */}
                        {isSelected && (
                            <div className="absolute inset-0 rounded-[inherit] border border-purple-400/20 animate-pulse pointer-events-none" />
                        )}
                    </button>
                );
            })}
        </div>
    );
}
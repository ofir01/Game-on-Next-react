import { useState } from 'react';
import { X,Home,Gamepad2,Trophy,Settings } from 'lucide-react';

export default function Sidebar() {
    const [collapsed, setCollapsed] = useState(false);

    return (
        <aside
            className={`
                fixed left-0 top-0 z-50
                h-screen
                bg-[#070b17]/95
                backdrop-blur-xl
                border-r border-cyan-500/20
                transition-all duration-300
                ${collapsed ? 'w-20' : 'w-72'}
            `}
        >
            <div className="flex items-center justify-between p-5 border-b border-white/10">
                {!collapsed && (
                    <h1 className="text-2xl font-bold text-cyan-400 tracking-widest">
                        GAMAX
                    </h1>
                )}

                <button
                    onClick={() => setCollapsed(!collapsed)}
                    className="text-cyan-300 hover:text-white transition"
                >
                    {collapsed ? <Menu /> : <X />}
                </button>
            </div>

            <nav className="p-4 space-y-2">
                {[
                    { icon: Home, label: 'Home' },
                    { icon: Gamepad2, label: 'Games' },
                    { icon: Trophy, label: 'Top Rated' },
                    { icon: Settings, label: 'Settings' },
                ].map((item) => (
                    <button
                        key={item.label}
                        className="
                            flex items-center gap-4
                            w-full
                            rounded-2xl
                            px-4 py-4
                            text-gray-300
                            hover:bg-cyan-500/10
                            hover:text-cyan-300
                            transition-all
                        "
                    >
                        <item.icon size={22} />

                        {!collapsed && (
                            <span className="font-medium">
                                {item.label}
                            </span>
                        )}
                    </button>
                ))}
            </nav>
        </aside>
    );
}
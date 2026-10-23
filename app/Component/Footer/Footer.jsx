"use client";

import Link from 'next/link';

const footerCategories = [
  {
    title: 'AI Apps',
    items: [
      { name: 'CookJoy (AI)', href: '/other/CookJoy', external: false },
      { name: 'MovieNest (AI)', href: '/other/MovieNest', external: false },
    ],
  },
  {
    title: 'Project Extensions',
    items: [
      { name: 'Classroom', href: '/other/Classroom', external: false },
      { name: 'WeatherApp', href: '/other/WeatherApp', external: false },
    ],
  },
  {
    title: 'GitHub & Live Projects',
    items: [
      { name: 'GitHub Profile', href: 'https://github.com/ofir01', external: true },
      { name: 'CookJoy Live', href: 'https://ofir01.github.io/CookJoy/', external: true },
      { name: 'MovieNest Live', href: 'https://ofir01.github.io/MovieNest/', external: true },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden border-t border-cyan-400/15 bg-[#07111f] text-white">
      {/* Top Gradient Line */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

      <div className="mx-auto max-w-7xl px-6 py-12">
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-4 lg:gap-8">

          {/* Brand Info */}
          <div className="text-center lg:text-left lg:col-span-1">
            <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200/70">GAME-ON LABS</p>
            <h2 className="mt-2 text-2xl font-black tracking-wide text-white">Other Projects</h2>
            <p className="mt-2 text-sm leading-6 text-slate-400">
              Small apps, AI features, and live portfolio works collected in one clean place.
            </p>
          </div>

          {/* Navigation Columns */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-3">
            {footerCategories.map((category) => (
              <div key={category.title} className="flex flex-col items-center sm:items-start">
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-cyan-300 mb-3">
                  {category.title}
                </h3>
                <nav className="flex flex-col items-center sm:items-start gap-0.1">
                  {category.items.map((item) => {
                    const content = (
                      <span className="footer-wave-word" aria-label={item.name}>
                        {item.name.split('').map((letter, index) => (
                          <span key={`${item.name}-${index}`} style={{ '--i': index }}>
                            {letter === ' ' ? '\u00A0' : letter}
                          </span>
                        ))}
                      </span>
                    );

                    // Using ! to force override any background/border/padding defined in global CSS for footer-wave-link
                    const linkClasses = "footer-wave-link group text-sm text-slate-400 hover:text-cyan-300 transition-colors duration-200 inline-block !bg-transparent !border-0 !p-0 !shadow-none !rounded-none";

                    return item.external ? (
                      <a
                        key={item.name}
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={linkClasses}
                      >
                        {content}
                      </a>
                    ) : (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={linkClasses}
                      >
                        {content}
                      </Link>
                    );
                  })}
                </nav>
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* Bottom Copyright */}
      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} GAME-ON. All rights reserved.
      </div>
    </footer>
  );
}
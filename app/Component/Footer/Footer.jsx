"use client";

import React from 'react';
import Link from 'next/link';

const navItems = [
  { name: 'Classroom', href: '/other/Classroom' },
  { name: 'WeatherApp', href: '/other/WeatherApp' },
  { name: 'CookJoy', href: '/other/CookJoy' },
  { name: 'MovieNest', href: '/other/MovieNest' },
];

const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-cyan-400/15 bg-[#07111f] text-white">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:items-center md:justify-between">
        <div className="text-center md:text-left">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200/70">GAME-ON LABS</p>
          <h2 className="mt-2 text-2xl font-black tracking-wide text-white">Other Projects</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
            Small apps collected in one clean place, without letting their styles leak into the main site.
          </p>
        </div>

        <nav className="flex flex-wrap items-center justify-center gap-3">
          {navItems.map((item) => (
            <Link key={item.name} href={item.href} className="footer-wave-link group">
              <span className="footer-wave-word" aria-label={item.name}>
                {item.name.split('').map((letter, index) => (
                  <span key={`${item.name}-${index}`} style={{ '--i': index }}>
                    {letter}
                  </span>
                ))}
              </span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-white/10 px-6 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} GAME-ON. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;

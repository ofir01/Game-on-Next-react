"use client";

import { AlertTriangle } from 'lucide-react';

export default function Error({ error, reset }) {
  return (
    <section className="grid min-h-screen place-items-center bg-[#05070d] px-4 text-white">
      <div className="max-w-lg rounded-[28px] border border-red-400/30 bg-red-500/10 p-8 text-center shadow-2xl backdrop-blur-xl">
        <AlertTriangle className="mx-auto text-red-400" size={48} />
        <h1 className="mt-4 text-3xl font-black">MovieNest error</h1>
        <p className="mt-3 text-white/70">{error?.message || 'Something went wrong.'}</p>
        <button onClick={reset} className="mt-5 rounded-2xl bg-red-600 px-5 py-3 font-black text-white">Try again</button>
      </div>
    </section>
  );
}
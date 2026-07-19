import { Clapperboard, LoaderCircle } from 'lucide-react';

export default function Loading() {
  return (
    <section className="grid min-h-screen place-items-center bg-[#05070d] px-4 text-white">
      <div className="rounded-[28px] border border-white/10 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-xl">
        <Clapperboard className="mx-auto text-red-500" size={48} />
        <LoaderCircle className="mx-auto mt-5 animate-spin text-red-400" size={36} />
        <p className="mt-4 font-black">MovieNest loading...</p>
      </div>
    </section>
  );
}
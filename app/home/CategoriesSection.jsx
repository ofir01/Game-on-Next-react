import { SectionHeader, EmptySection, Reveal, } from "./page.jsx";
import { Crown, Gamepad2, Sparkles, Swords, Zap, } from "lucide-react";
import Link from "next/link";

const ICONS = {
  Crown,
  Gamepad2,
  Sparkles,
  Swords,
  Zap,
};

const iconCycle = ["Zap", "Sparkles", "Swords", "Gamepad2", "Crown"];

const colorCycle = [
  "text-lime-300",
  "text-cyan-200",
  "text-orange-300",
  "text-pink-300",
  "text-amber-200",
];

export default function Categories({ categories = [] }) {

  const normalizedCategories = categories.map((category, index) => ({
    name: category?.name,
    count: category?.gamesCount || 0,
    icon: iconCycle[index % iconCycle.length],
    color: colorCycle[index % colorCycle.length],
  }));

  function CategoryStrip({ categories }) {
    return (
      <Reveal>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {categories.map((category) => {
            const Icon = ICONS[category.icon] || Gamepad2;

            return (
              <Link
                key={category.name}
                href={`/Search?categories=${category.name}`}
                className="group flex min-h-24 items-center justify-between rounded-lg border border-white/10 bg-zinc-950 px-5 transition hover:-translate-y-1 hover:border-lime-300/60"
              >
                <span>
                  <span className="block font-black text-white">
                    {category.name}
                  </span>

                  <span className="mt-1 block text-sm text-zinc-500">
                    {category.count} games
                  </span>
                </span>

                <Icon className={`h-7 w-7 ${category.color}`} />
              </Link>
            );
          })}
        </div>
      </Reveal>
    );
  }

  return (
    <section className="py-16">
      <div className="mx-auto max-w-[1600px] px-5">
        <SectionHeader
          eyebrow="Find your next run"
          title="Pick the kind of game you feel like playing."
          align="center"
        />

        <div className="mt-10">
          {normalizedCategories.length ? (
            <CategoryStrip categories={normalizedCategories} />
          ) : (
            <EmptySection
              title="No categories yet"
              text="Categories will appear here."
            />
          )}
        </div>
      </div>
    </section>
  );
}
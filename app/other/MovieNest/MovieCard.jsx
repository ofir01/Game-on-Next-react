export default function MovieCard({ movie }) {
    return (
        <div
            className="
                group
                overflow-hidden
                rounded-[28px]
                border border-white/10
                bg-[#0b1120]
                hover:border-cyan-400/40
                hover:-translate-y-2
                transition-all duration-300
            "
        >
            <div className="relative h-[420px] overflow-hidden">
                <img
                    src={movie.image}
                    alt={movie.title}
                    className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />

                <div className="absolute bottom-0 p-6">
                    <div className="mb-3 inline-flex rounded-full bg-cyan-400/20 px-3 py-1 text-xs text-cyan-300">
                        {movie.genre}
                    </div>

                    <h3 className="text-2xl font-bold">
                        {movie.title}
                    </h3>

                    <p className="mt-2 text-gray-300 line-clamp-2">
                        {movie.description}
                    </p>
                </div>
            </div>
        </div>
    );
}
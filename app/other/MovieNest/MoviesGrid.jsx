import MovieCard from './MovieCard';

const movies = [
    {
        id: 1,
        title: 'Cyber Runner',
        genre: 'Sci-Fi',
        image: 'https://picsum.photos/500/700?1',
        description: 'Fast paced futuristic racing battles.'
    },
    {
        id: 2,
        title: 'Neon City',
        genre: 'Action',
        image: 'https://picsum.photos/500/700?2',
        description: 'Open world cyberpunk adventure.'
    },
    {
        id: 3,
        title: 'Galaxy Raiders',
        genre: 'Space',
        image: 'https://picsum.photos/500/700?3',
        description: 'Fight for survival across galaxies.'
    },
    {
        id: 4,
        title: 'AI Protocol',
        genre: 'Thriller',
        image: 'https://picsum.photos/500/700?4',
        description: 'A rogue AI controls the entire city.'
    },
];

export default function MoviesGrid() {
    return (
        <section>
            <div className="mb-8 flex items-center justify-between">
                <div>
                    <h2 className="text-4xl font-black">
                        Trending Games
                    </h2>

                    <p className="mt-2 text-gray-400">
                        Most played games this week.
                    </p>
                </div>
            </div>

            <div
                className="
                    grid
                    grid-cols-[repeat(auto-fill,minmax(320px,1fr))]
                    gap-6
                    w-full
                "
            >
                {movies.map((movie) => (
                    <MovieCard
                        key={movie.id}
                        movie={movie}
                    />
                ))}
            </div>
        </section>
    );
}

export default function Description({ description }) {
    return (
        <section className="bg-slate-900/50 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
            <h3 className="text-2xl font-bold mb-4 border-b border-white/10 pb-4">Details</h3>
            <p className="text-gray-300 leading-relaxed text-lg">
                {description}
            </p>
        </section>
    )
}

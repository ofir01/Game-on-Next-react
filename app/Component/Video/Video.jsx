import { useRouter } from 'next/navigation';

export default function Video({srcVideo}) {
    const router = useRouter();

    return (
        <video
            className="card-image"
            autoPlay
            muted
            playsInline
            style={{
                objectFit: 'cover',
                width: '100%',
                height: '100%',
                transition: 'all 1s ease-in-out'
            }}
            onEnded={() => {
                // הפעולות שיקרו בסיום הסרטון:
                router.push('/');
                router.refresh();
            }}
        >
            <source src={srcVideo} type="video/mp4" />
            Your browser does not support the video tag.
        </video>
    )
}

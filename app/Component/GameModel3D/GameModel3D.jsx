
import { useReducedMotion } from "framer-motion";
import { Gamepad2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import "./styleGameModel3D.css";



//סצנת הפורטל התלת-ממדית עם כרטיסי משחקים צפים, שמגיבים לתנועת העכבר, עם אפשרות להפחית תנועה למשתמשים שזקוקים לכך.
export default function GameModel3D({ games }) {
    const reducedMotion = useReducedMotion();
    const [tilt, setTilt] = useState({ x: 0, y: 0 });

    function handlePointerMove(event) {
        if (reducedMotion) {
            return;
        }

        const bounds = event.currentTarget.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;

        setTilt({ x: Number((y * -10).toFixed(2)), y: Number((x * 12).toFixed(2)) });
    }

    function handlePointerLeave() {
        setTilt({ x: 0, y: 0 });
    }

    return (
        <div
            className="relative min-h-[560px] w-full overflow-hidden"
            onPointerMove={handlePointerMove}
            onPointerLeave={handlePointerLeave}
        >
            <motion.div
                className="gameon-perspective absolute inset-0"
                animate={{ rotateX: tilt.x, rotateY: tilt.y }}
                transition={{ type: "spring", stiffness: 120, damping: 22 }}
            >
                <div className="gameon-floor" />
                <div className="gameon-portal-ring gameon-ring-one" />
                <div className="gameon-portal-ring gameon-ring-two" />
                <div className="gameon-portal-ring gameon-ring-three" />

                <div className="gameon-arcade-core">
                    <div className="gameon-core-screen">
                        <div className="gameon-screen-scan" />
                        <Gamepad2 className="h-16 w-16 text-black" strokeWidth={1.8} />
                        <span className="text-lg font-black text-black">GAME-ON</span>
                    </div>
                    <div className="gameon-core-deck">
                        <span />
                        <span />
                        <span />
                        <span />
                    </div>
                </div>

                {games?.slice(0, 5).map((game, index) => (
                    <Link
                        key={game?.title}
                        href={`/games/${game?.title}`}
                        className={`gameon-card-3d gameon-card-3d-${index}`}
                        style={{
                            "--accent": game?.accent,
                            "--float-delay": `${index * -0.65}s`,
                        }}
                        aria-label={`View details for ${game?.title}`}
                    >
                        <img
                            src={game?.imageUrl}
                            alt={`${game?.title} cover art`}
                            loading={index === 0 ? "eager" : "lazy"}
                            decoding="async"
                            className="h-full w-full object-cover"
                        />
                        <span>{game?.title}</span>
                    </Link>
                ))}
            </motion.div>
        </div>
    );
}



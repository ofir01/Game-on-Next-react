import { Bookmark } from 'lucide-react';
import { useWishlist } from '../../hooks/user/useWishlist'; 
import { motion } from 'framer-motion';

export default function WishlistCard({ gameId }) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const active = isInWishlist(gameId);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggleWishlist(gameId);
      }}
      className="relative group/wishlist"
    >
      {/* עיצוב של סימניה (Bookmark Tag) */}
      <motion.div
        animate={{ height: active ? 40 : 32 }}
        className={`
          w-8 flex items-center justify-center rounded-b-md transition-colors duration-300
          ${active ? 'bg-cyan-500 shadow-[0_0_15px_rgba(34,211,238,0.4)]' : 'bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60'}
        `}
      >
        <Bookmark 
          size={16} 
          className={`${active ? 'fill-black text-black' : 'text-white/70 group-hover/wishlist:text-white'}`} 
        />
      </motion.div>
    </button>
  );
}
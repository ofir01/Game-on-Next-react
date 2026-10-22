import { useState } from 'react';
import { ShoppingCart, X, Play } from 'lucide-react'; // הוספתי אייקון Play
import SecurePayment from './SecurePayment.jsx';
import { useGetPaymentStatus } from '../../hooks/games/usePurchaseGame.js'; 


export default function PurchaseButton({ gamesData, user }) {
    const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

    // מאזינים לסטטוס הרכישה בזמן אמת!
    const { data: paymentStatus } = useGetPaymentStatus(
        gamesData?.id, 
        true, // isPaid
        true, // isReleased
        true, // isAvailable
        user
    );

    const isPurchased = paymentStatus?.isPurchased || paymentStatus?.alreadyOwned;

    // אם המשחק נרכש, יוצג כפתור שחק עכשיו במקום כפתור רכישה
    if (isPurchased) {
        return (
            <button
                type="button"
                className="relative px-10 py-4 bg-fuchsia-500 hover:bg-fuchsia-400 text-white font-black text-lg uppercase tracking-wider rounded-xl transition-all hover:scale-105 flex items-center gap-3 shadow-lg shadow-fuchsia-500/20 cursor-pointer"
            >
                <Play className="w-6 h-6 fill-current" />
                <span>שחק עכשיו</span>
            </button>
        );
    }

    return (
        <>
            <button
                type="button"
                onClick={() => setIsCheckoutOpen(true)}
                className="relative px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-black font-black text-lg uppercase tracking-wider rounded-xl transition-all hover:scale-105 flex items-center gap-3 shadow-lg shadow-emerald-500/20 cursor-pointer"
            >
                <ShoppingCart className="w-6 h-6" />
                <span>רכוש עכשיו</span>
            </button>

            {/* ----------------- MODAL CHECKOUT ----------------- */}
            {isCheckoutOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="relative w-full max-w-md">
                        <button
                            onClick={() => setIsCheckoutOpen(false)}
                            className="absolute top-4 left-4 z-20 text-slate-400 hover:text-white bg-slate-800/80 p-1.5 rounded-full transition-colors"
                            title="סגור"
                        >
                            <X className="w-5 h-5" />
                        </button>

                        <SecurePayment 
                            gameId={gamesData?.id} 
                            gameTitle={gamesData?.title} 
                            price={gamesData?.finalPrice} 
                            onClose={() => setIsCheckoutOpen(false)} /* <--- התיקון החשוב כאן! */
                        />
                    </div>
                </div>
            )}
        </>
    );
}
import React, { useState, useEffect } from 'react';
import { Gamepad2, ShieldCheck, CheckCircle2, AlertTriangle, Loader2, Wifi } from 'lucide-react';
import { usePurchaseGame } from '../../hooks/games/usePurchaseGame';

export default function SecurePayment({ gameId, gameTitle, price, onClose }) {
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardHolder: '',
    expiry: '',
    cvv: ''
  });

  const [validationError, setValidationError] = useState('');
  const [showSuccessView, setShowSuccessView] = useState(false);
  
  // סטייט מקומי שנדלק מיד בלחיצה כדי למנוע תחושת "קיפאון"
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { purchaseGame, isLoading, isSuccess, isError, error } = usePurchaseGame();

  // סינכרון הסטייט המקומי עם סיום הטעינה מהשרת
  useEffect(() => {
    if (!isLoading) {
      setIsSubmitting(false);
    }
  }, [isLoading]);

  const isProcessing = isSubmitting || isLoading;

  const handleCardNumberChange = (e) => {
    if (isProcessing) return;
    setValidationError('');
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const formatted = value.match(/.{1,4}/g)?.join(' ') || value;
    setFormData({ ...formData, cardNumber: formatted });
  };

  const handleExpiryChange = (e) => {
    if (isProcessing) return;
    setValidationError('');
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length >= 3) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setFormData({ ...formData, expiry: value });
  };

  const handleCvvChange = (e) => {
    if (isProcessing) return;
    setValidationError('');
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 4) {
      setFormData({ ...formData, cvv: value });
    }
  };

  const handlePayment = (e) => {
    e.preventDefault();
    if (isProcessing) return;
    setValidationError('');

    const rawCardNumber = formData.cardNumber.replace(/\s/g, '');

    if (!rawCardNumber || rawCardNumber.length < 15) {
      setValidationError('PLEASE ENTER A VALID CARD NUMBER');
      return;
    }
    
    if (!formData.cardHolder.trim() || formData.cardHolder.trim().length < 2) {
      setValidationError('PLEASE ENTER A VALID CARD HOLDER NAME');
      return;
    }

    if (!formData.expiry || formData.expiry.length < 5) {
      setValidationError('PLEASE ENTER EXPIRY DATE (MM/YY)');
      return;
    }

    const [month, year] = formData.expiry.split('/');
    if (Number(month) < 1 || Number(month) > 12) {
      setValidationError('INVALID MONTH (MUST BE 01-12)');
      return;
    }

    if (!formData.cvv || formData.cvv.length < 3) {
      setValidationError('PLEASE ENTER A VALID CVV CODE');
      return;
    }

    // הפעלה מיידית של הסטייט המקומי לפני קריאת השרת
    setIsSubmitting(true);

    const generatedPaymentToken = `tok_mock_${Math.random().toString(36).substring(2, 15)}`;

    purchaseGame(
      { gameId, price, generatedPaymentToken, paymentData: formData },
      {
        onSuccess: (data) => {
          setTimeout(() => {
            setShowSuccessView(true);
            setIsSubmitting(false);
          }, 1500);
        },
        onError: () => {
          setIsSubmitting(false);
        }
      }
    );
  };

  if (showSuccessView) {
    return (
      <div className="w-full max-w-lg mx-auto p-8 bg-[#0f111a] rounded-3xl border border-fuchsia-500/30 shadow-[0_0_40px_rgba(217,70,239,0.15)] text-center animate-in zoom-in duration-500">
        <div className="w-24 h-24 bg-gradient-to-tr from-green-500 to-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(16,185,129,0.4)]">
          <CheckCircle2 className="w-12 h-12 text-white" />
        </div>
        <h2 className="text-3xl font-black text-white mb-2 tracking-wide uppercase">Payment Successful!</h2>
        <p className="text-gray-400 mb-6 font-medium">
          <span className="text-green-400 font-bold">{gameTitle}</span> HAS BEEN ADDED TO YOUR LIBRARY.
        </p>
        <button
          onClick={onClose}
          className="w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-3 rounded-xl font-bold uppercase tracking-widest transition-colors cursor-pointer"
        >
          CONTINUE TO GAME
        </button>
      </div>
    );
  }

  const activeErrorMessage = validationError || (isError && (error?.message || 'TRANSACTION FAILED. PLEASE TRY AGAIN.'));

  const getButtonStyles = () => {
    if (isSuccess) return "bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-[0_0_30px_rgba(16,185,129,0.4)] cursor-default scale-95";
    if (isProcessing) return "bg-gradient-to-r from-fuchsia-600/70 to-orange-500/70 text-white/90 animate-pulse cursor-wait";
    return "bg-gradient-to-r from-fuchsia-600 to-orange-500 hover:from-fuchsia-500 hover:to-orange-400 text-white shadow-[0_0_20px_rgba(217,70,239,0.3)] hover:shadow-[0_0_30px_rgba(249,115,22,0.5)] hover:-translate-y-1 cursor-pointer";
  };

  return (
    <div className="w-full max-w-lg mx-auto font-sans" dir="ltr">
      <div className="bg-[#151822] rounded-3xl shadow-2xl p-6 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-fuchsia-600/20 blur-[60px] pointer-events-none"></div>

        <div className="flex items-center justify-between mb-8 relative z-10">
          <div>
            <h2 className="text-2xl font-black text-white uppercase tracking-wider flex items-center gap-2">
              <Gamepad2 className="w-6 h-6 text-fuchsia-500" />
              CHECKOUT
            </h2>
            <p className="text-gray-400 text-sm mt-1 uppercase font-semibold">
              PURCHASING: <span className="text-white">{gameTitle}</span>
            </p>
          </div>
          <div className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-fuchsia-500">
            ${Number(price).toFixed(2)}
          </div>
        </div>

        <form onSubmit={handlePayment} className="relative z-10 flex flex-col items-center">
          {/* הוספת אנימציית פולס עדינה לכרטיס בזמן עיבוד תשלום */}
          <div className={`w-full aspect-[1.586/1] bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500 rounded-2xl shadow-2xl p-8 flex flex-col justify-between relative overflow-hidden group transition-all duration-300 ${isProcessing ? 'animate-pulse ring-4 ring-fuchsia-400/50' : ''}`}>
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwYzUuNSAwIDEwLTQuNSAxMC0xMFMxNS41IDAgMTAgMCAwIDQuNSAwIDEwczQuNSAxMCAxMCAxMHptMCAyMGM1LjUgMCAxMC00LjUgMTAtMTBTMjUuNSAyMCAyMCAyMHMtMTAgNC41LTEwIDEwIDQuNSAxMCAxMCAxMHoiIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSIvPjwvc3ZnPg==')] mix-blend-overlay"></div>

            <div className="flex justify-between items-start relative z-10">
              <div className="w-12 h-9 bg-white/20 backdrop-blur-sm rounded-md border border-white/30 flex items-center justify-center relative overflow-hidden">
                <div className="absolute w-full h-[1px] bg-white/30 top-1/2 -translate-y-1/2"></div>
                <div className="absolute h-full w-[1px] bg-white/30 left-1/2 -translate-x-1/2"></div>
              </div>
              <Wifi className="w-8 h-8 text-white/70 rotate-90" />
            </div>

            <div className="relative z-10 flex-1 flex items-center mt-4">
              <input
                type="text"
                name="cardnumber"
                id="cc-number"
                autoComplete="cc-number"
                inputMode="numeric"
                disabled={isProcessing}
                value={formData.cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4580 0000 0000 0000"
                className="w-full bg-transparent border-none outline-none focus:ring-0 text-2xl font-mono text-white placeholder:text-white/50 tracking-widest p-0 shadow-none transition-all disabled:opacity-70"
              />
            </div>

            <div className="relative z-10 flex gap-4 mt-auto">
              <div className="flex-1">
                <input
                  type="text"
                  name="ccname"
                  id="cc-name"
                  autoComplete="cc-name"
                  disabled={isProcessing}
                  value={formData.cardHolder}
                  onChange={(e) => {
                    if (isProcessing) return;
                    setValidationError('');
                    setFormData({ ...formData, cardHolder: e.target.value.toUpperCase() });
                  }}
                  placeholder="ISRAEL ISRAELI"
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-bold text-white placeholder:text-white/50 uppercase tracking-widest p-0 disabled:opacity-70"
                  spellCheck="false"
                />
              </div>

              <div className="w-16 shrink-0">
                <input
                  type="text"
                  name="cc-exp"
                  id="cc-exp"
                  autoComplete="cc-exp"
                  inputMode="numeric"
                  disabled={isProcessing}
                  value={formData.expiry}
                  onChange={handleExpiryChange}
                  placeholder="MM/YY"
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-mono text-white placeholder:text-white/50 tracking-wider p-0 text-center disabled:opacity-70"
                />
              </div>

              <div className="w-12 shrink-0">
                <input
                  type="text"
                  name="cvc"
                  id="cc-csc"
                  autoComplete="cc-csc"
                  inputMode="numeric"
                  maxLength="4"
                  disabled={isProcessing}
                  value={formData.cvv}
                  onChange={handleCvvChange}
                  placeholder="CVV"
                  className="w-full bg-transparent border-none outline-none focus:ring-0 text-sm font-mono text-white placeholder:text-white/50 tracking-wider p-0 text-center disabled:opacity-70"
                />
              </div>
            </div>
          </div>

          {activeErrorMessage && !isSuccess && (
            <div className="w-full mt-6 bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-wide animate-in fade-in duration-200">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{activeErrorMessage}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isProcessing || isSuccess}
            className={`w-full mt-8 py-4 rounded-xl font-black text-lg tracking-widest uppercase transition-all duration-300 flex justify-center items-center gap-3 ${getButtonStyles()}`}
          >
            {isSuccess ? (
              <>
                <CheckCircle2 className="w-6 h-6 animate-in zoom-in" />
                <span>SUCCESS!</span>
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="w-6 h-6 animate-spin" />
                <span>PROCESSING...</span>
              </>
            ) : (
              <>
                <ShieldCheck className="w-6 h-6" />
                <span>CONFIRM PAYMENT</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
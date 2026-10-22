
// פונקציית סימולציית סליקה המקבלת את הנתונים מה-UI ואת הטוקן שייצרנו
export const checkMockPayment = async ({ amount, paymentData, token }) => {
    // סימולציית השהיית רשת (1.2 שניות)
    await new Promise((resolve) => setTimeout(resolve, 1200));

    const cleanCard = paymentData?.cardNumber?.replace(/\s/g, '');

    // תרחישי שגיאה מבוססי כרטיסי דמה לבדיקות UI
    if (cleanCard?.endsWith('0000')) {
        throw new Error('CARD DECLINED: INSUFFICIENT FUNDS');
    }
    if (cleanCard?.endsWith('9999')) {
        throw new Error('CARD DECLINED: EXPIRED CARD');
    }

    if (!amount || amount <= 0) {
        throw new Error('INVALID_AMOUNT');
    }

    return {
        success: true,
        transactionId: `TXN_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
        amountCharged: Number(amount).toFixed(2),
        currency: 'USD',
        usedToken: token, // סתם כדי להראות שהשתמשנו בו
        timestamp: new Date().toISOString(),
    };
}
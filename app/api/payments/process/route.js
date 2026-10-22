import { NextResponse } from 'next/server';
import { GameService } from '../../../../services/server/GameService';
import { UserService } from '../../../../services/server/UserService';
import { PurchaseService } from '../../../../services/server/PurchaseService';
import { checkMockPayment } from '../../../../utils/checkPayment';
import { getUserId } from '../../../../utils/verification.js';
import { sendMessage } from '../../../../utils/messages';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);


// פונקציה זו תטפל בבקשות POST כדי לבצע את תהליך התשלום
export async function POST(req) {
    try {
        // קבלת הנתונים בדיוק כפי שהם נשלחים מה-UI
        const { gameId, price, generatedPaymentToken, paymentData } = await req.json();
        //console.log("Received payment request:", { gameId, price, paymentData });

        // 1. אימות משתמש
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }

        const user = await UserService.getUserById(userId);
        if (!user) {
            return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
        }

        // 2. שליפת המשחק מה-DB (כדי לוודא מחיר אמיתי ולא להסתמך על ה-price מה-UI)
        const game = await GameService.getGameById(gameId);
        // בדיקה אם המשחק קיים, ואם המחיר תואם למחיר במסד הנתונים, ואם המשחק זמין לרכישה
        if (!game) {
            return NextResponse.json({ error: 'GAME_NOT_FOUND' }, { status: 404 });
        }
        //בדיקה אם המשחק זמין לרכישה (לא OUT OF STOCK או Coming Soon)
        if (game.status === 'OUT OF STOCK' || game.status === 'Coming Soon') {
            return NextResponse.json({ error: 'GAME_NOT_AVAILABLE' }, { status: 400 });
        }
        // בדיקה אם המחיר מה-UI תואם למחיר האמיתי במסד הנתונים
        if (Number(game.finalPrice) !== Number(price)) {
            return NextResponse.json({ error: 'PRICE_MISMATCH' }, { status: 400 });
        }

        // 3. בדיקה אם המשחק כבר נקנה (מניעת תשלום כפול במקרה של לחיצה כפולה או רענון)
        const existingPurchase = await PurchaseService.get(user.id, game.id);

        // אם כבר קיימת רכישה, מחזירים תשובה שמראה שהמשתמש כבר רכש את המשחק
        if (existingPurchase) {
            return NextResponse.json({
                success: true,
                alreadyOwned: true,
                message: 'the game has already been purchased in a previous transaction',
                transactionId: existingPurchase.transaction_id
            }, { status: 200 }); // מחזירים 200 ולא שגיאה, כדי שה-UI יציג הצלחה
        }


        //console.log("Generated Mock Token:", generatedPaymentToken);

        // 5. ביצוע חיוב מול פונקציית הדמה
        const paymentResult = await checkMockPayment({
            amount: game.price, // משתמשים במחיר מה-DB בלבד!
            paymentData,        // מעבירים את פרטי האשראי מה-UI כדי לדמות שגיאות
            token: generatedPaymentToken
        });

        if (!paymentResult.success) {
            return NextResponse.json({ error: 'PAYMENT_FAILED' }, { status: 402 });
        }

        // 6. שמירת הרכישה במסד הנתונים
        const newPurchase = await PurchaseService.create({
            userId: user.id,
            gameId: game.id,
            pricePaid: game.price,
            transactionId: paymentResult.transactionId
        });

        //שמירה דמה שבוצע התשלום
        await PurchaseService.updateCompleted({ id: newPurchase.id, status: 'completed' });

        //שליחת הודעה למשתמש
        const receiptMessage = `
            איזה כיף! רכשת בהצלחה את המשחק <strong>${game.title}</strong>.<br><br>
            <strong>פרטי הקבלה:</strong><br>
            מספר עסקה (טרנזקציה): ${paymentResult.transactionId}<br>
            סכום ששולם: $${game.price}<br><br>
            המשחק כבר מחכה לך באזור האישי ותוכל להתחיל לשחק מיד.
        `;
        const emailData = await sendMessage("Purchase_Receipt", {
            user: user,
            message: receiptMessage,
        });
        await resend.emails.send(emailData);

        //console.log("New purchase recorded:", newPurchase);

        return NextResponse.json({
            success: true,
            alreadyOwned: false,
            message: 'the payment was processed successfully and the game has been added to your library',
            transactionId: paymentResult.transactionId
        }, { status: 201 });

    } catch (error) {
        // טיפול במקרה נדיר של מפתח ייחודי (Unique Constraint) שנכשל ברמת ה-DB באותה שניה
        if (error.name === 'SequelizeUniqueConstraintError') {
            return NextResponse.json({
                success: true,
                alreadyOwned: true,
                message: 'the game has already been purchased in a previous transaction',
            }, { status: 200 });
        }

        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}











// פונקציה זו תטפל בבקשות GET כדי לבדוק אם המשתמש כבר רכש את המשחק
export async function GET(req) {
    try {
        // 1. שליפת ה-gameId משורת הכתובת (Query Parameters)
        // לדוגמה: /api/payments/process?gameId=5
        const gameId = req.nextUrl.searchParams.get('gameId');
        if (!gameId) {
            return NextResponse.json({ error: 'GAME_ID_REQUIRED' }, { status: 400 });
        }

        // 2. אימות משתמש מתוך ההדרים (Headers)
        const userId = await getUserId(req);
        if (!userId) {
            return NextResponse.json({ error: 'UNAUTHORIZED' }, { status: 401 });
        }

        const user = await UserService.getUserById(userId);
        if (!user) {
            return NextResponse.json({ error: 'USER_NOT_FOUND' }, { status: 404 });
        }

        // 3. שליפת נתוני המשחק מה-DB
        const game = await GameService.getGameById(gameId);
        if (!game) {
            return NextResponse.json({ error: 'GAME_NOT_FOUND' }, { status: 404 });
        }

        // 4. בדיקה האם המשתמש כבר רכש את המשחק בעבר
        const existingPurchase = await PurchaseService.get(user.id, game.id);

        // 5. החזרת התשובה ללקוח עם פרטי המשחק וסטטוס הרכישה
        return NextResponse.json({
            success: true,
            game: {
                id: game.id,
                title: game.title,
                price: game.price,
                // אפשר להוסיף כאן עוד שדות מהמסד שרלוונטיים לתצוגה אם צריך (כמו תמונה, תיאור וכו')
            },
            isPurchased: !!existingPurchase, // מחזיר true אם הרכישה קיימת, false אם לא
            purchaseDetails: existingPurchase ? {
                transactionId: existingPurchase.transaction_id,
                purchasedAt: existingPurchase.createdAt
            } : null
        }, { status: 200 });

    } catch (error) {
        console.error("Error fetching game payment details:", error);

        return NextResponse.json(
            { message: error.message || 'Internal server error' },
            { status: 500 }
        );
    }
}
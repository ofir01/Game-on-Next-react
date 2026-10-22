import { NextResponse } from 'next/server';
import { PurchaseService } from '../../../../services/server/PurchaseService';


// שליפת נתוני המכירות
export async function GET(req) {
    try {
        // בבקשת GET שולפים את הנתונים מה-URL ולא מה-Body
        const { searchParams } = new URL(req.url);

        //receiptId=TXN_4KRNLXZPY&userName=20&gameName=20&fromDate=2026-07-31&toDate=2026-08-29&page=1
        // משיכת הפרמטרים מה-URL
        const page = parseInt(searchParams.get('page')) || 1;
        const transactionId = searchParams.get('receiptId') || null;
        const username = searchParams.get('userName') || null;
        const gameName = searchParams.get('gameName') || null;
        const startDate = searchParams.get('fromDate') || null;
        const endDate = searchParams.get('toDate') || null;

        const limit = 10;
        const offset = (page - 1) * limit;

        const result = await PurchaseService.searchAndGetStats({
            page,
            transactionId,
            username,
            gameName,
            startDate,
            endDate,
            limit,
            offset
        });

        return NextResponse.json(result, { status: 200 });

    } catch (error) {
        // מומלץ תמיד להדפיס את השגיאה לקונסול כדי שתוכל לדבג בקלות
        console.error('Error in searchAndGetStats API:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}



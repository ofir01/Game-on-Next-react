import { NextResponse } from 'next/server';
import { PurchaseService } from '../../../../../services/server/PurchaseService';
import { logActivity } from '../../../../../utils/logActivity';

// יצירת זיכוי
export async function DELETE(req, { params }) {
    try {
        const { purchaseId } = await params;

        const result = await PurchaseService.refundPurchase(purchaseId);

        if (!result) {
            return NextResponse.json({ message: "Purchase not found" }, { status: 404 });
        }

        const log_Activity = await logActivity({ req, action: 'DELETE', targetType: 'refund Purchase', targetId: purchaseId });
        if (log_Activity) {
            return NextResponse.json({ message: log_Activity }, { status: 400 });
        }

        return NextResponse.json({ message: "Purchase refunded successfully" }, { status: 200 });

    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
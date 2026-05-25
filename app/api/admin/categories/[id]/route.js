import { NextResponse } from 'next/server';
import { CategoryService } from '../../../../../services/server/CategoryService';
import { logActivity } from '../../../../../utils/logActivity';




// PUT - עדכון
export async function PUT(req, { params }) {
    try {
        const body = await req.json();
        const { id } = await params;

        const category = await CategoryService.update(id, body.name);
        if (!category) {
            return NextResponse.json({ message: "The category does not exists" }, { status: 404 });
        }

        const log_Activity = await logActivity({ req, action: 'UPDATE', targetType: 'category', targetId: id });
        if (log_Activity) {
            return NextResponse.json({ message: log_Activity }, { status: 400 });
        }

        return NextResponse.json({ message: "Updated successfully" }, { status: 200 });
    } catch (error) {
        console.error('Failed to update Category:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - מחיקה
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;

        const result = await CategoryService.delete(id);

        if (!result) {
            return NextResponse.json({ message: "Category not found" }, { status: 404 });
        }

        const log_Activity = await logActivity({ req, action: 'DELETE', targetType: 'category', targetId: id });
        if (log_Activity) {
            return NextResponse.json({ message: log_Activity }, { status: 400 });
        }

        return NextResponse.json({ message: "Category and its relations deleted successfully" }, { status: 200 });

    } catch (error) {
        console.error('Failed to delete Category:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
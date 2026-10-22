import { NextResponse } from 'next/server';
import { CommentService } from '../../../../../services/server/commentService';
import { GameService } from '../../../../../services/server/GameService';
import { UserService } from '../../../../../services/server/UserService';
import {getUserId} from '../../../../../utils/verification.js';




// GET - שליפת תגובות עם פגינציה, סטטיסטיקות ופילטרים
export async function GET(req, { params }) {
    try {
        const { Slug } = await params;
        const { searchParams } = new URL(req.url);
        const gameId = await GameService.getGameSlug(Slug);

        if (!gameId) return NextResponse.json({ error: "Game not found" }, { status: 404 });

        const page = parseInt(searchParams.get('page')) || 1;
        const ratingFilter = searchParams.get('rating');
        const limit = 5;

        const { rows, count, stats } = await CommentService.getCommentsByGame(gameId, { page, limit, ratingFilter });

        return NextResponse.json({
            comments: rows,
            stats,
            pagination: { total: count, totalPages: Math.ceil(count / limit), currentPage: page }
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST - יצירת תגובה חדשה עם בדיקות מניעת כפילות/תגובה עצמית
export async function POST(req, { params }) {
    try {
        const { Slug } = await params;
        const body = await req.json();
        const userId = await getUserId(req);
        const gameId = await GameService.getGameSlug(Slug);

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        if (!gameId) return NextResponse.json({ error: "Game not found" }, { status: 404 });

        const result = await CommentService.create({
            userId,
            gameId,
            content: body.content || body,
            parentId: body.parentId
        });

        if (result.error) return NextResponse.json({ error: result.error }, { status: 400 });

        return NextResponse.json(result.comment, { status: 201 });
    } catch (error) {
        //console.error("Validation details:", error.errors ? error.errors.map(e => e.message) : error.message);
        return NextResponse.json({ error: error.errors ? error.errors[0].message : error.message }, { status: 500 });
    }
}

// PUT - עדכון תגובה קיימת עם בדיקות הרשאות
export async function PUT(req, { params }) {
    try {
        const { Slug } = await params;
        const body = await req.json();
        const userId = await getUserId(req);

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const result = await CommentService.update(body.commentId, userId, body.content);

        if (result.error) return NextResponse.json({ error: result.error }, { status: 404 });

        return NextResponse.json(result.comment);
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// DELETE - מחיקת תגובה עם בדיקות הרשאות ושליחת אזהרות במייל
export async function DELETE(req, { params }) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const rawReason = searchParams.get('warningReason');
        const warningReason = (rawReason && rawReason.trim() !== "") ? rawReason : "No reason provided";
        const sendWarning = searchParams.get('sendWarning');
        const userId = await getUserId(req);

        if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const result = await CommentService.delete(id, userId, warningReason, sendWarning);
        //console.log("Warning reason sent to service:", warningReason); // Debugging line
        if (result.error) return NextResponse.json({ error: result.error }, { status: 404 });
        console.log("Delete result:", result); // Debugging line

        // לוגיקת שליחת מיילים - מבוססת על כמות האזהרות (warningCount)
        if (result.warningCount > 0 && result.authorEmail && sendWarning === 'true') {
            let emailType = 'Content_Removal'; // ברירת מחדל לאזהרה ראשונה

            if (result.userBanned) {
                emailType = 'banned';
            } else if (result.warningCount === 2) {
                emailType = 'FINAL_WARNING';
            } else if (result.warningCount === 1) {
                emailType = 'Warning';
            }

            // שילוב הסיבה שהאדמין כתב בתוך הודעת המייל
            const finalMessage = `התגובה שלך נמחקה מהסיבה הבאה: ${warningReason}`;

            console.log(`Sending email to ${result.authorEmail} with type ${emailType} and message: ${finalMessage}`); // Debugging line
            // שליחת המייל 
            await UserService.sendMessages({
                email: result.authorEmail,
                customMessage: finalMessage,
                type: emailType,
                sendToAll: false
            });
        }

        return NextResponse.json({ message: "Comment deleted successfully" }, { status: 200 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}



import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { validateParams } from "@/utils/validateParams";
import { IDParam } from "@/utils/types";

// As a user, I want to receive an minimal, PDF invoice for my trip booking,
// so that I have a record of the booking and transaction.
export async function GET(request: Request, { params }: IDParam) {
    const token = verifyToken(request);
    if (token instanceof NextResponse) {
        return token;
    }

    const { id: id_raw } = await params;
    const bookingId = parseInt(id_raw);
    
    if (isNaN(bookingId)) {
        return NextResponse.json(
            { error: "Invalid booking ID." },
            { status: 400 }
        );
    }

    try {
        const bookings = await prisma.booking.findUnique({
            where: { id: bookingId! },
            include: { bookingItems: true },
        });

        if (bookings == null) {
            return NextResponse.json(
                { error: "Booking does not exist." },
                { status: 400 }
            );
        }
        const display = bookings.bookingItems.map(item => [item.type, item.id, item.price])

        const doc = new jsPDF()
        const pageWidth = doc.internal.pageSize.getWidth();
        doc.setFontSize(24);
        const xCoordinate = pageWidth / 2;
        const yCoordinate = 10; 

        doc.text("IBS Invoice", xCoordinate, yCoordinate, { align: 'center' });
        doc.setFontSize(12);

        const header = ["Type", "Id", "Price"]
        
        autoTable(doc, {
            head: [header],
            body: display,
            startY: 20, 
            theme: "grid", 
            headStyles: { fillColor: [22, 160, 133] },
        });

        doc.text("Total: $" + display.reduce((a, c) => a + Number(c[2] ?? 0), 0), xCoordinate*1.29, 20 + 10 * (display.length + 2))

        const pdfArrayBuffer = doc.output("arraybuffer");

        // Return the PDF with proper headers.
        return new NextResponse(Buffer.from(pdfArrayBuffer), {
                status: 200,
                headers: {
                    "Content-Type": "application/pdf",
                    "Content-Disposition": 'attachment; filename="document.pdf"',
                },
        });
        
    } catch (error) {
        console.error("Error retrieving booking:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}

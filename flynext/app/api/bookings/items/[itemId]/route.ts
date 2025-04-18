import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { Params } from "@/utils/types";

// As a user, I want to cancel all or specific parts of 
// a booking, giving me flexibility in managing my trips.
export async function DELETE(request: Request, { params }: Params<{itemId: string}>) {
    const token = verifyToken(request);
    if (token instanceof NextResponse) {
        return token;
    }

    const { itemId: id_raw } = await params;
    const itemId = parseInt(id_raw);
    
    if (isNaN(itemId)) {
        return NextResponse.json(
            { error: "Invalid booking item ID." },
            { status: 400 }
        );
    }
    
    try {
        await prisma.bookingItem.delete({
            where: { id: itemId! },
        });
        return NextResponse.json({}, { status: 200 });

    } catch (error) {
        console.error('Error deleting booking:', error);
        return NextResponse.json({error: "booking item does not exist"}, { status: 400 });
    } 
}

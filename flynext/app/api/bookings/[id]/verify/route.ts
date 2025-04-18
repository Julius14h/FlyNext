import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";
import { send_request, build_query } from "@/utils/AFS";
import { verifyToken } from "@/utils/auth";
import { validateParams } from "@/utils/validateParams";
import { IDParam } from "@/utils/types";

// As a user, I want to verify my flight booking to 
// ensure the flight schedule remains as planned.
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

    try{
        const bookings = await prisma.booking.findUnique({
            where: { id: bookingId! },
            include: { bookingItems: true,}
        });
        
        if (!bookings){
            return NextResponse.json({ error: 'Booking does not exist' }, { status: 400 });
        }
        
        const userInfo = await prisma.user.findUnique({where: { id: token.user },});
        
        if (!userInfo){
            return NextResponse.json({ error: 'User does not exist?' }, { status: 400 });
        }
        
        
        const flights = bookings.bookingItems.filter(item => item.type == "FLIGHT").map(item => item.referenceId);
    
        
        let booking_info = []
        for (const flight_id of flights) {
            const info = await send_request(
                "/bookings/retrieve" + build_query({lastName: userInfo.lastName, bookingReference: flight_id}), 
                {method: "GET",}
            )
            booking_info.push(info)
        }
        
        // Update the booking status to CONFIRMED in the database
        await prisma.booking.update({
            where: { id: bookingId },
            data: { status: "CONFIRMED" }
        });
        
        // Also update the status of all booking items
        await prisma.bookingItem.updateMany({
            where: { bookingId: bookingId },
            data: { status: "CONFIRMED" }
        });
        
        return NextResponse.json({booking_info}, { status: 200 });
    } catch (error){
        console.log(error)
        return NextResponse.json({error: "error verifying booking"}, { status: 500 });
    }
}



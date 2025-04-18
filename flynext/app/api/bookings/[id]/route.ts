import prisma from "@/utils/prisma";
import { NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { validateParams } from "@/utils/validateParams";
import { build_query, send_request } from "@/utils/AFS";
import { IDParam } from "@/utils/types";
import { createNotification } from "@/utils/notification";


// As a user, I want to view my bookings, so that I can 
// easily access my itinerary and booking information.
export async function GET(request: Request, { params }: IDParam ) {
    const token = verifyToken(request);
    if (token instanceof NextResponse) {
        return token;
    }

    const { id: id_raw } = await params;
    const [bookingId, err] = validateParams(id_raw);
    if (err) return err

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId! },
            include: {
                bookingItems: true,
                user: true,
            },
        });

        if (!booking){
            return NextResponse.json({}, { status: 200 });
        }
        const flight_ids = booking.bookingItems.filter(x => x.referenceId).map(x=>x.referenceId!)
        const flights = []
        for (const flight_id of flight_ids) {
            const flight = await send_request(
                "/api/bookings/retrieve" + build_query({lastName: booking.user.lastName, bookingReference: flight_id}),
                {
                    method: "GET",
                }
            )
            flights.push(flight)
        }

        const {user, ...rest} = booking 
        const ret = {
            ...booking,
            flights: flights
        }

        return NextResponse.json(ret, { status: 200 });
    } catch (error) {
        console.error("Error retrieving bookings:", error);
        return NextResponse.json(
            { error: "Internal server error." },
            { status: 500 }
        );
    }
}

// As a user, I want to cancel all or specific parts of 
// a booking, giving me flexibility in managing my trips.
export async function DELETE(request: Request, { params }: { params: Promise<{id: string}>}) {
    const token = verifyToken(request);
    if (token instanceof NextResponse) {
        return token;
    }

    const { id: id_raw } = await params;
    
    const [id, err] = validateParams(id_raw);
    if (err) return err

    try {
        // delete all flights from AFS
        const booking = await prisma.booking.findUnique({
            where: { id: id! },
            include: {
                bookingItems: true,
                user: true
            },
        });
        if (!booking){
            throw Error("booking does not exist")
        }

        const flightIds = booking.bookingItems.filter(x => x.referenceId).map(x => x.referenceId!)
        for (const flight of flightIds) {
            const flight_response = await send_request(
                "/bookings/cancel", 
                {
                    method: "POST",
                    body: JSON.stringify({
                        bookingReference: flight,
                        lastName: booking.user.lastName
                    })
                }
            )
        }

        // delete all items from database
        await prisma.bookingItem.deleteMany({
            where: { bookingId: id! },
        });

        // Create notification before deleting the booking
        await createNotification(
            booking.userId,
            'Your booking has been cancelled.',
            booking.id
        );

        await prisma.booking.delete({
            where: { id: id! },
        });
        return NextResponse.json({}, { status: 200 });

    } catch (error) {
        console.error('Error deleting booking:', error);
        return NextResponse.json({error: "booking does not exist"}, { status: 400 });
    } 
}


import prisma from "@/utils/prisma";
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/utils/auth";
import { build_query, send_request } from "@/utils/AFS";
import { Prisma } from "@prisma/client";

type RequestBody = {
    passportNumber: number, 
    bookingItems: Prisma.BookingItemGetPayload<{}>[], 
    totalPrice: number, 
    paymentDetails: string 
};
// As a user, I want to book an itinerary that includes a 
// flight (one-way or round-trip) and/or a hotel reservation.
export async function POST(request: Request) {
    const token = verifyToken(request);
    if (token instanceof NextResponse) {
        return token;
    }

    const { passportNumber, bookingItems, totalPrice, paymentDetails }: RequestBody = await request.json();

    const flightIds = bookingItems.filter(item => item.type == "FLIGHT").map(item => item.referenceId!)
    const roomIds = bookingItems.filter(item => item.roomTypeId).map(item => item.roomTypeId!)

    for (const id of roomIds) {
        const availabilities = await prisma.roomAvailability.findMany({
            where: {id: id}, 
        })
        console.log({availabilities})
        if (!availabilities.every(x => x.availableRooms > 0)){
            return NextResponse.json({error: "no room available"}, { status: 400 });
        }
    }
    
    // book flight
    const user = await prisma.user.findUnique({where: {id: token.user}}) as Prisma.UserGetPayload<{}>;
    const flight_response = await send_request(
        "/bookings", 
        {
            method: "POST",
            body: JSON.stringify({
                "email": user.email,
                "firstName": user.firstName,
                "flightIds": flightIds,
                "lastName": user.lastName,
                "passportNumber": passportNumber.toString(),
            })
        }
    )

    if (flight_response.error){
        return NextResponse.json(flight_response.error, { status: 400 });
    }

    const {bookingReference} = flight_response

    try {
        const booking = await prisma.booking.create({
            data: {
                userId: token.user,
                status: "PENDING",
                totalPrice: totalPrice || undefined,
                paymentDetails: paymentDetails || undefined,
                // createdAt,
                // updatedAt,
                bookingItems: {
                    create: bookingItems.map((item) => ({
                        type: item.type,
                        hotelId: item.hotelId || undefined,
                        roomTypeId: item.roomTypeId || undefined,
                        referenceId: item.type == "FLIGHT" ? bookingReference : undefined,
                        startDate: item.startDate
                            ? new Date(item.startDate)
                            : undefined,
                        endDate: item.endDate
                            ? new Date(item.endDate)
                            : undefined,
                        price: item.price || undefined,
                        status: item.status || "CONFIRMED",
                    }))
                },
                // notifications: [],
            },
            include: {
                bookingItems: true,
            },
        });

        // add Notification
        const Notification = await prisma.notification.create({
            data: { 
                userId: token.user,
                bookingId: booking.id, 
                message: 'Booking confirmed!', 
                isRead: false 
            },
        });
        return NextResponse.json({booking, flight_info: flight_response, afs_booking_reference: bookingReference}, { status: 201 });
    } catch (error) {
        console.error(error)
        return NextResponse.json({error: "booking failed"}, { status: 500 });
    }
}

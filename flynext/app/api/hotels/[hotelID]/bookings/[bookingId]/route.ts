import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { authenticate } from "@/utils/auth"; // Use the existing authenticate function
import { Params } from '@/utils/types';


// Cancel a specific booking
export async function PUT(request: Request, { params }: Params<{hotelID: string, bookingId: string}>) {
    try {
        const { hotelID, bookingId } = await params;
        if (!hotelID || !bookingId) {
            return NextResponse.json({ error: 'Hotel ID and Booking ID are required' }, { status: 400 });
        }

        // Authenticate the user and check if they are the hotel owner
        const token = await authenticate(request);
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Validate hotel exists and user is the owner
        const hotel = await prisma.hotel.findUnique({ 
            where: { id: Number(hotelID), ownerId: token.user }
        });
        if (!hotel) {
            return NextResponse.json({ error: 'Hotel not found or unauthorized' }, { status: 404 });
        }

        // Cancel the booking
        const updatedBooking = await prisma.booking.update({
            where: { id: Number(bookingId) },
            data: { status: 'CANCELLED' },
        });

        return NextResponse.json({ booking: updatedBooking }, { status: 200 });
    } catch (error) {
        console.error('Error cancelling booking:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

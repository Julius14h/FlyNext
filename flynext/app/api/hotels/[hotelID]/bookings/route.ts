import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { authenticate } from "@/utils/auth"; // Use the existing authenticate function
import { HotelIDParam } from '@/utils/types';

// Fetch bookings for a specific hotel (with optional filters)
export async function GET(request: Request, { params }: HotelIDParam) {
    try {
        const { hotelID } = await params;
        if (!hotelID) {
            return NextResponse.json({ error: 'Hotel ID is required' }, { status: 400 });
        }

        const { searchParams } = new URL(request.url);
        const date = searchParams.get('date');
        const roomTypeId = searchParams.get('roomTypeId');
        const fetchAll = searchParams.get('all') === 'true';

        // Authenticate the user and check if they are the hotel owner
        console.log(request);
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

        // Prepare where clause based on whether we want all bookings or filtered ones
        const whereClause = {
            hotelId: Number(hotelID),
            ...(fetchAll ? {} : {
                ...(roomTypeId ? { roomTypeId: Number(roomTypeId) } : {}),
                ...(date ? { startDate: new Date(date) } : {})
            })
        };

        // Fetch bookings for this hotel
        const bookings = await prisma.bookingItem.findMany({
            where: whereClause,
            include: { booking: true, roomType: true }
        });

        return NextResponse.json({ bookings }, { status: 200 });
    } catch (error) {
        console.error('Error fetching bookings:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
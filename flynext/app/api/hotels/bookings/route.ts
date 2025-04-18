import { NextResponse } from 'next/server';
import { verifyToken } from '@/utils/auth';
import prisma from '@/utils/prisma';
import { Prisma } from '@prisma/client';

interface RequestBody {
  hotelId: number;
  roomTypeId: number;
  startDate: string;
  endDate: string;
  price: number;
  passportNumber: string;
  paymentDetails: string;
}

export async function POST(request: Request) {
  try {
    const token = verifyToken(request);
    if (token instanceof NextResponse) {
      return token;
    }

    const { hotelId, roomTypeId, startDate, endDate, price, passportNumber, paymentDetails }: RequestBody = await request.json();

    // Check if the room is available for the selected dates
    const startDateObj = new Date(startDate);
    const endDateObj = new Date(endDate);
    
    // Get all dates between check-in and check-out
    const dates = [];
    let currentDate = new Date(startDateObj);
    while (currentDate < endDateObj) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Check availability for each date
    for (const date of dates) {
      const availability = await prisma.roomAvailability.findFirst({
        where: {
          roomTypeId: roomTypeId,
          date: date,
          availableRooms: {
            gt: 0
          }
        }
      });
      
      if (!availability) {
        return NextResponse.json({ error: "Room not available for the selected dates" }, { status: 400 });
      }
    }

    // Create the booking
    const booking = await prisma.booking.create({
      data: {
        userId: token.user,
        status: "CONFIRMED",
        totalPrice: price,
        paymentDetails: paymentDetails,
        bookingItems: {
          create: [{
            type: "HOTEL",
            hotelId: hotelId,
            roomTypeId: roomTypeId,
            startDate: startDateObj,
            endDate: endDateObj,
            price: price,
            status: "CONFIRMED"
          }]
        }
      },
      include: {
        bookingItems: true
      }
    });

    // Update room availability
    for (const date of dates) {
      await prisma.roomAvailability.updateMany({
        where: {
          roomTypeId: roomTypeId,
          date: date
        },
        data: {
          availableRooms: {
            decrement: 1
          }
        }
      });
    }

    // Create notification
    await prisma.notification.create({
      data: {
        userId: token.user,
        bookingId: booking.id,
        message: 'Hotel booking confirmed!',
        isRead: false
      }
    });

    return NextResponse.json({ 
      booking,
      bookingReference: `HOTEL-${booking.id}`,
      message: "Hotel booking confirmed successfully"
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating hotel booking:', error);
    return NextResponse.json({ error: "Failed to create hotel booking" }, { status: 500 });
  }
} 
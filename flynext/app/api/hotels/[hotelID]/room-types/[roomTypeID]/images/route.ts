import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { authenticate } from "@/utils/auth";
import { Params } from '@/utils/types';

export async function GET(request: NextRequest, { params }: Params<{hotelID: string, roomTypeID: string}>) {
  try {
    const roomTypeId = parseInt((await params).roomTypeID);
    
    if (isNaN(roomTypeId)) {
      return NextResponse.json({ error: 'Invalid room type ID' }, { status: 400 });
    }

    const images = await prisma.roomTypeImage.findMany({
      where: {
        roomTypeId: roomTypeId
      },
      select: {
        id: true,
        imageUrl: true
      }
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching room type images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Upload room type images
export async function POST(request: NextRequest, { params }: Params<{hotelID: string, roomTypeID: string}>) {
  try {
    // Authenticate the user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const roomTypeId = parseInt((await params).roomTypeID);
    
    if (isNaN(roomTypeId)) {
      return NextResponse.json({ error: 'Invalid room type ID' }, { status: 400 });
    }

    // Check if the room type exists and belongs to a hotel owned by the authenticated user
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: { hotel: true }
    });

    if (!roomType) {
      return NextResponse.json({ error: 'Room type not found' }, { status: 404 });
    }

    if (roomType.hotel.ownerId !== user.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Create the room type image
    const roomTypeImage = await prisma.roomTypeImage.create({
      data: {
        imageUrl,
        roomTypeId,
      },
    });

    return NextResponse.json(roomTypeImage, { status: 201 });
  } catch (error) {
    console.error('Error uploading room type image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
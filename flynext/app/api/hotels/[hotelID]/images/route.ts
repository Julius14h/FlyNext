import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { authenticate } from "@/utils/auth";

interface HotelImage {
  id: number;
  imageUrl: string;
}

export async function GET(
  request: NextRequest,
  { params }: any
): Promise<NextResponse> {
  try {
    const hotelId = parseInt(params.hotelID);
    
    if (isNaN(hotelId)) {
      return NextResponse.json({ error: 'Invalid hotel ID' }, { status: 400 });
    }

    const images = await prisma.hotelImage.findMany({
      where: {
        hotelId: hotelId
      },
      select: {
        id: true,
        imageUrl: true
      }
    });

    return NextResponse.json(images);
  } catch (error) {
    console.error('Error fetching hotel images:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 

// Upload hotel images
export async function POST(
  request: NextRequest,
  { params }: any
): Promise<NextResponse> {
  try {
    // Authenticate the user
    const user = await authenticate(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const hotelId = parseInt(params.hotelID);
    
    if (isNaN(hotelId)) {
      return NextResponse.json({ error: 'Invalid hotel ID' }, { status: 400 });
    }

    // Check if the hotel exists and belongs to the authenticated user
    const hotel = await prisma.hotel.findUnique({
      where: { 
        id: hotelId,
        ownerId: user.user
      },
    });

    if (!hotel) {
      return NextResponse.json({ error: 'Hotel not found or unauthorized' }, { status: 404 });
    }

    // Parse the request body
    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image URL is required' }, { status: 400 });
    }

    // Create the hotel image
    const hotelImage = await prisma.hotelImage.create({
      data: {
        imageUrl,
        hotelId,
      },
    });

    return NextResponse.json(hotelImage, { status: 201 });
  } catch (error) {
    console.error('Error uploading hotel image:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 
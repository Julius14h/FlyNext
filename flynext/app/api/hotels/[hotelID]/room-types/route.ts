import { NextResponse } from "next/server";
import prisma from "@/utils/prisma";
import { authenticate } from "@/utils/auth";
import { validateParams } from "@/utils/validateParams";
import { HotelIDParam } from "@/utils/types";

export async function GET(request: Request, { params }: HotelIDParam) {
  try {
    const { hotelID } = await params;
    const hotelIdInt = Number(hotelID);

    if (isNaN(hotelIdInt)) {
      return NextResponse.json({ error: "Invalid hotel ID" }, { status: 400 });
    }

    // Fetch room types for the hotel
    const roomTypes = await prisma.roomType.findMany({
      where: { hotelId: hotelIdInt },
      select: {
        id: true,
        name: true,
        pricePerNight: true,
        amenities: true,
      },
    });

    // Fetch images for each room type
    const roomTypesWithImages = await Promise.all(
      roomTypes.map(async (roomType) => {
        const images = await prisma.roomTypeImage.findMany({
          where: { roomTypeId: roomType.id },
          select: { imageUrl: true },
        });

        return {
          ...roomType,
          images: images.map(img => img.imageUrl),
        };
      })
    );

    return NextResponse.json(roomTypesWithImages, { status: 200 });
  } catch (error) {
    console.error("Error fetching room types:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

type PostBody = { name: string, pricePerNight: number, amenities: string }
export async function POST(request: Request, { params }: HotelIDParam) {
  try {
    // Authenticate the user
    const session = await authenticate(request);
    if (!session) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const [hotelID, err] = validateParams((await params).hotelID);

    if (err) return err 
    const { name, pricePerNight, amenities } = await request.json() as PostBody;

    // Validate request body
    if (!name || !pricePerNight || !amenities) {
      return NextResponse.json(
        { error: "Missing required fields: name, pricePerNight, amenities" },
        { status: 400 }
      );
    }

    // Ensure the hotel exists and belongs to the authenticated user
    const hotel = await prisma.hotel.findUnique({
      where: { id: hotelID! },
    });

    

    if (!hotel) {
      return NextResponse.json({ error: "Hotel not found" }, { status: 404 });
    }

    // Check if the hotel belongs to the authenticated user
    if (hotel.ownerId !== session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Create the room type
    const roomType = await prisma.roomType.create({
      data: {
        name,
        pricePerNight,
        amenities,
        hotelId: hotelID!,
      },
    });

    return NextResponse.json(roomType, { status: 201 });
  } catch (error) {
    console.error("Error creating room type:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}  
import { NextResponse } from 'next/server';
import prisma from '@/utils/prisma';
import { Prisma } from '@prisma/client';

// generated from grok
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const city = searchParams.get('city');
    const name = searchParams.get('name');
    const minRating = searchParams.get('minRating') ? Number(searchParams.get('minRating')) : null;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : null;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : null;

    console.log('Search params:', { checkIn, checkOut, city, name, minRating, minPrice, maxPrice });

    // Validate dates if provided
    let checkInDate, checkOutDate;
    if (checkIn && checkOut) {
      checkInDate = new Date(checkIn);
      checkOutDate = new Date(checkOut);
      if  (isNaN(checkInDate.getTime()) || isNaN(checkOutDate.getTime()) || checkInDate >= checkOutDate) {
        return NextResponse.json({ error: 'Invalid date range' }, { status: 400 });
      }
    }

    // Build the where clause
    const where: Prisma.HotelWhereInput = {};
    
    // City search - use contains without mode parameter
    if (city) {
      where.city = {
        name: {
          contains: city
        }
      };
    }
    
    // Name search
    if (name) {
      where.name = {
        contains: name
      };
    }
    
    // Star rating filter
    if (minRating) {
      where.starRating = {
        gte: minRating
      };
    }
    
    // Price and availability filters
    if (checkInDate && checkOutDate) {
      where.roomTypes = {
        some: {
          bookingItems: {
            none: {
              type: 'HOTEL',
              status: 'CONFIRMED',
              startDate: { lte: checkOutDate },
              endDate: { gte: checkInDate },
            },
          },
          ...(minPrice && { pricePerNight: { gte: minPrice } }),
          ...(maxPrice && { pricePerNight: { lte: maxPrice } }),
        },
      };
    } else if (minPrice || maxPrice) {
      where.roomTypes = {
        some: {
          ...(minPrice && { pricePerNight: { gte: minPrice } }),
          ...(maxPrice && { pricePerNight: { lte: maxPrice } }),
        },
      };
    }

    console.log('Where clause:', JSON.stringify(where, null, 2));

    const hotels = await prisma.hotel.findMany({
      where,
      include: {
        city: { select: { name: true, country: true } },
        roomTypes: {
          where: checkInDate && checkOutDate ? {
            bookingItems: {
              none: {
                type: 'HOTEL',
                status: 'CONFIRMED',
                startDate: { lte: checkOutDate },
                endDate: { gte: checkInDate },
              },
            },
          } : undefined,
          select: { pricePerNight: true },
        },
        images: {
          orderBy: { id: 'asc' },
          take: 1,
          select: { imageUrl: true },
        },
      },
    });

    console.log(`Found ${hotels.length} hotels`);

    const results = hotels.map(hotel => ({
      id: hotel.id,
      name: hotel.name,
      city: hotel.city,
      starRating: hotel.starRating,
      startingPrice: hotel.roomTypes.length 
        ? Math.min(...hotel.roomTypes.map(room => room.pricePerNight)) 
        : null,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      images: hotel.images.map(img => img.imageUrl),
      amenities: hotel.amenities,
      address: hotel.address,
    }));

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('Error searching hotels:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
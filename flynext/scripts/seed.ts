import prisma from '../utils/prisma.js'; 

// generated from grok
async function seed() {
  try {
    // Clear existing data in correct order to avoid foreign key issues
    console.log('Clearing existing data...');
    await prisma.bookingItem.deleteMany();
    await prisma.roomAvailability.deleteMany();
    await prisma.roomType.deleteMany();
    await prisma.hotelImage.deleteMany();
    await prisma.hotel.deleteMany();
    await prisma.airport.deleteMany();
    await prisma.city.deleteMany();
    await prisma.user.deleteMany();

    // Seed Cities
    console.log('Seeding cities...');
    await prisma.city.createMany({
      data: [
        { name: 'Toronto', country: 'Canada' },
        { name: 'Vancouver', country: 'Canada' },
        { name: 'New York', country: 'USA' },
      ],
    });

    // Seed Users (Owners)
    console.log('Seeding users...');
    await prisma.user.createMany({
      data: [
        { 
          firstName: 'John', 
          lastName: 'Doe', 
          userName: 'johndoe', 
          email: 'john@example.com', 
          password: 'pass', 
          role: 'OWNER' 
        },
        { 
          firstName: 'Jane', 
          lastName: 'Smith', 
          userName: 'janesmith', 
          email: 'jane@example.com', 
          password: 'pass', 
          role: 'OWNER' 
        },
      ],
    });

    // Fetch created IDs
    const cityRecords = await prisma.city.findMany();
    const ownerRecords = await prisma.user.findMany({ where: { role: 'OWNER' } });

    // Seed Hotels
    console.log('Seeding hotels...');
    await prisma.hotel.createMany({
      data: [
        {
          cityId: cityRecords.find(c => c.name === 'Toronto')!.id,
          ownerId: ownerRecords[0].id,
          name: 'Grand Toronto Hotel',
          address: '123 Maple St, Toronto',
          starRating: 4,
          latitude: 43.6532,
          longitude: -79.3832,
          amenities: 'wifi, pool, gym',
        },
        {
          cityId: cityRecords.find(c => c.name === 'Vancouver')!.id,
          ownerId: ownerRecords[1].id,
          name: 'Pacific Vancouver Inn',
          address: '456 Ocean Dr, Vancouver',
          starRating: 3,
          latitude: 49.2827,
          longitude: -123.1207,
          amenities: 'wifi, breakfast',
        },
        {
          cityId: cityRecords.find(c => c.name === 'New York')!.id,
          ownerId: ownerRecords[0].id,
          name: 'Empire State Suites',
          address: '789 Broadway, NYC',
          starRating: 5,
          latitude: 40.7128,
          longitude: -74.0060,
          amenities: 'wifi, spa, bar',
        },
      ],
    });

    // Fetch hotel IDs
    const hotelRecords = await prisma.hotel.findMany();

    // Seed RoomTypes
    console.log('Seeding room types...');
    await prisma.roomType.createMany({
      data: [
        {
          hotelId: hotelRecords.find(h => h.name === 'Grand Toronto Hotel')!.id,
          name: 'Single',
          pricePerNight: 100,
          amenities: 'wifi',
        },
        {
          hotelId: hotelRecords.find(h => h.name === 'Grand Toronto Hotel')!.id,
          name: 'Double',
          pricePerNight: 150,
          amenities: 'wifi, tv',
        },
        {
          hotelId: hotelRecords.find(h => h.name === 'Pacific Vancouver Inn')!.id,
          name: 'Standard',
          pricePerNight: 80,
          amenities: 'wifi',
        },
        {
          hotelId: hotelRecords.find(h => h.name === 'Pacific Vancouver Inn')!.id,
          name: 'Deluxe',
          pricePerNight: 120,
          amenities: 'wifi, breakfast',
        },
        {
          hotelId: hotelRecords.find(h => h.name === 'Empire State Suites')!.id,
          name: 'Suite',
          pricePerNight: 250,
          amenities: 'wifi, spa',
        },
        {
          hotelId: hotelRecords.find(h => h.name === 'Empire State Suites')!.id,
          name: 'Penthouse',
          pricePerNight: 400,
          amenities: 'wifi, spa, bar',
        },
      ],
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();

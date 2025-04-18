// generated from grok
import prisma from '../utils/prisma.ts';
import fetch from 'node-fetch';
import * as bcrypt from "bcrypt";
import { BookingStatus, ItemStatus, UserRole } from '@prisma/client';

function hashPassword(password: string) {
    return bcrypt.hashSync(password, parseInt(process.env.BCRYPT_ROUNDS!));
}

const API_KEY = process.env.AFS_API_KEY;

if (!API_KEY) {
    console.error('Error: AFS_API_KEY not set in .env');
    process.exit(1);
}

async function seedCities() {
    const response = await fetch('https://advanced-flights-system.replit.app/api/cities', {
        headers: { 'x-api-key': API_KEY! },
    });

    console.log('pain seedCities')
    const cities = await response.json();
    for (const { city, country } of cities) {
        await prisma.city.upsert({
            where: { name_country: { name: city, country: country } },
            update: {},
            create: { name: city, country },
        });
    }
    console.log('Cities seeded successfully');
}

async function seedAirports() {
    const response = await fetch('https://advanced-flights-system.replit.app/api/airports', {
        headers: { 'x-api-key': API_KEY! },
    });

    console.log("seedAirports")
    const airports = await response.json();
    for (const { id, code, name, city, country } of airports) {
        const cityRecord = await prisma.city.findFirst({ where: { name: city } });
        if (!cityRecord) throw new Error(`City ${city} not found for airport ${code}`);
        await prisma.airport.upsert({
            where: { id },
            update: { code, name, country, cityId: cityRecord.id },
            create: { id, code, name, country, cityId: cityRecord.id },
        });
    }
    console.log('Airports seeded successfully');
}

async function seedUsers() {
    const users = [
        { firstName: 'John', lastName: 'Doe', userName: 'johndoe', email: 'john@example.com', role: UserRole.USER, password: hashPassword('password') },
        { firstName: 'Jane', lastName: 'Smith', userName: 'janesmith', email: 'jane@example.com', role: UserRole.OWNER, password: hashPassword('password2') },
        { firstName: 'Alice', lastName: 'Owner', userName: 'alice_owner', email: 'alice.owner@example.com', role: UserRole.OWNER, password: hashPassword('password123') },
        { firstName: 'Bob', lastName: 'Proprietor', userName: 'bob_proprietor', email: 'bob.proprietor@example.com', role: UserRole.OWNER, password: hashPassword('password123') },
        { firstName: 'Charlie', lastName: 'Manager', userName: 'charlie_mgr', email: 'charlie.manager@example.com', role: UserRole.OWNER, password: hashPassword('password123') },
        { firstName: 'Diana', lastName: 'Host', userName: 'diana_host', email: 'diana.host@example.com', role: UserRole.OWNER, password: hashPassword('password123') },
    ];

    console.log("seedUsers")
    for (const user of users) {
        await prisma.user.upsert({
            where: { email: user.email },
            update: {},
            create: user,
        });
    }
    console.log('Users seeded successfully');
}
// Helper function to generate deterministic placeholder image URLs
function getPlaceholderImageUrl(
    seed: string,
    width: number,
    height: number,
    category: string
): string {
    // Using picsum.photos with a seed for determinism. Replace with actual URLs if needed.
    // Note: picsum seed functionality might change or be inconsistent.
    // For truly stable hardcoded images, use specific image IDs or upload actual images
    // and store their real URLs.
    const cacheBust = seed.length % 5; // Simple way to vary image slightly based on seed
    return `https://picsum.photos/seed/${encodeURIComponent(
        seed
    )}/${width}/${height}?${category}&cb=${cacheBust}`;
}
async function seedHotels() {
    const cities = await prisma.city.findMany();
    const owners = await prisma.user.findMany({ where: { role: UserRole.OWNER } });
    // --- 3. Hardcoded Hotel Core Data (50 unique entries) ---
    console.log(`Defining 50 unique hardcoded hotels...`);
    const hotelsData = [
        // Group 1: New York
        { name: 'The Grand Plaza', address: '123 Fifth Avenue', starRating: 5, amenities: 'Pool, Spa, Gym, Restaurant', logo: getPlaceholderImageUrl('grand_plaza_logo', 200, 100, 'logo'), latitude: 40.7128, longitude: -74.0060 },
        { name: 'Metropolis Inn', address: '456 Times Square', starRating: 4, amenities: 'Gym, Bar, Free WiFi', logo: getPlaceholderImageUrl('metropolis_inn_logo', 200, 100, 'logo'), latitude: 40.7580, longitude: -73.9855 },
        { name: 'Central Park View Hotel', address: '789 Central Park West', starRating: 4, amenities: 'Park Views, Restaurant, Lounge', logo: getPlaceholderImageUrl('cpv_hotel_logo', 200, 100, 'logo'), latitude: 40.7829, longitude: -73.9654 },
        { name: 'Brooklyn Bridge B&B', address: '101 Brooklyn Heights', starRating: 3, amenities: 'Breakfast Included, Free WiFi', logo: getPlaceholderImageUrl('bbb_bnb_logo', 200, 100, 'logo'), latitude: 40.7027, longitude: -73.9871 },
        { name: 'SoHo Chic Suites', address: '222 Prince Street', starRating: 5, amenities: 'Designer Rooms, Rooftop Bar', logo: getPlaceholderImageUrl('soho_chic_logo', 200, 100, 'logo'), latitude: 40.7238, longitude: -74.0027 },
        // Group 2: London
        { name: 'Royal Westminster Hotel', address: '1 Parliament Square', starRating: 5, amenities: 'Fine Dining, Concierge, Spa', logo: getPlaceholderImageUrl('royal_west_logo', 200, 100, 'logo'), latitude: 51.5007, longitude: -0.1246 },
        { name: 'Kensington Gardens Inn', address: '2 Hyde Park Gate', starRating: 4, amenities: 'Garden Access, Afternoon Tea', logo: getPlaceholderImageUrl('kensington_inn_logo', 200, 100, 'logo'), latitude: 51.5073, longitude: -0.1657 },
        { name: 'The Shard\'s Rest', address: '32 London Bridge St', starRating: 5, amenities: 'Sky Bar, Panoramic Views, Pool', logo: getPlaceholderImageUrl('shard_rest_logo', 200, 100, 'logo'), latitude: 51.5045, longitude: -0.0865 },
        { name: 'Covent Garden Lodge', address: '15 Neal\'s Yard', starRating: 3, amenities: 'Central Location, Cafe', logo: getPlaceholderImageUrl('covent_lodge_logo', 200, 100, 'logo'), latitude: 51.5155, longitude: -0.1222 },
        { name: 'Notting Hill House', address: '55 Portobello Road', starRating: 4, amenities: 'Boutique Hotel, Market Access', logo: getPlaceholderImageUrl('notting_house_logo', 200, 100, 'logo'), latitude: 51.5092, longitude: -0.2019 },
        // Group 3: Paris
        { name: 'Eiffel Tower Palace', address: '1 Champ de Mars', starRating: 5, amenities: 'Tower Views, Michelin Star Restaurant', logo: getPlaceholderImageUrl('eiffel_palace_logo', 200, 100, 'logo'), latitude: 48.8584, longitude: 2.2945 },
        { name: 'Louvre Art Hotel', address: '10 Rue de Rivoli', starRating: 4, amenities: 'Art Gallery, Library, Bar', logo: getPlaceholderImageUrl('louvre_art_logo', 200, 100, 'logo'), latitude: 48.8606, longitude: 2.3376 },
        { name: 'Montmartre Charm', address: '25 Rue des Abbesses', starRating: 3, amenities: 'Bohemian Decor, Terrace', logo: getPlaceholderImageUrl('montmartre_charm_logo', 200, 100, 'logo'), latitude: 48.8867, longitude: 2.3431 },
        { name: 'Le Marais Boutique', address: '50 Rue des Francs Bourgeois', starRating: 4, amenities: 'Historic Building, Courtyard', logo: getPlaceholderImageUrl('marais_boutique_logo', 200, 100, 'logo'), latitude: 48.8599, longitude: 2.3622 },
        { name: 'Saint-Germain Stay', address: '100 Boulevard Saint-Germain', starRating: 5, amenities: 'Luxury Suites, Butler Service', logo: getPlaceholderImageUrl('stgermain_stay_logo', 200, 100, 'logo'), latitude: 48.8530, longitude: 2.3499 },
        // Group 4: Tokyo
        { name: 'Shinjuku Skyscraper Hotel', address: '1 Nishi-Shinjuku', starRating: 5, amenities: 'Observation Deck, Pool, Multiple Restaurants', logo: getPlaceholderImageUrl('shinjuku_sky_logo', 200, 100, 'logo'), latitude: 35.6895, longitude: 139.7007 },
        { name: 'Ginza Imperial Suites', address: '4 Chome Ginza', starRating: 5, amenities: 'Shopping Access, Spa, Fine Dining', logo: getPlaceholderImageUrl('ginza_imperial_logo', 200, 100, 'logo'), latitude: 35.6712, longitude: 139.7659 },
        { name: 'Asakusa Traditional Ryokan', address: '2 Senso-ji Temple', starRating: 3, amenities: 'Tatami Rooms, Onsen (Hot Spring)', logo: getPlaceholderImageUrl('asakusa_ryokan_logo', 200, 100, 'logo'), latitude: 35.7147, longitude: 139.7966 },
        { name: 'Shibuya Crossing View Hotel', address: '1 Dogenzaka', starRating: 4, amenities: 'Direct Crossing View, Modern Rooms', logo: getPlaceholderImageUrl('shibuya_view_logo', 200, 100, 'logo'), latitude: 35.6595, longitude: 139.7003 },
        { name: 'Ueno Park Hotel', address: '3 Ueno Park', starRating: 3, amenities: 'Museum Access, Cafe', logo: getPlaceholderImageUrl('ueno_park_logo', 200, 100, 'logo'), latitude: 35.7156, longitude: 139.7759 },
        // Group 5: Sydney
        { name: 'Opera House Harbour Hotel', address: '1 Circular Quay', starRating: 5, amenities: 'Harbour Views, Rooftop Pool, Bar', logo: getPlaceholderImageUrl('opera_harbour_logo', 200, 100, 'logo'), latitude: -33.8568, longitude: 151.2153 },
        { name: 'Bondi Beachfront Inn', address: '10 Campbell Parade', starRating: 4, amenities: 'Beach Access, Surf Lessons', logo: getPlaceholderImageUrl('bondi_inn_logo', 200, 100, 'logo'), latitude: -33.8915, longitude: 151.2767 },
        { name: 'The Rocks Heritage Hotel', address: '50 George Street', starRating: 4, amenities: 'Historic Charm, Pub, Restaurant', logo: getPlaceholderImageUrl('rocks_heritage_logo', 200, 100, 'logo'), latitude: -33.8598, longitude: 151.2090 },
        { name: 'Darling Harbour Suites', address: '20 Pier Street', starRating: 5, amenities: 'Water Views, Aquarium Access, Gym', logo: getPlaceholderImageUrl('darling_suites_logo', 200, 100, 'logo'), latitude: -33.8714, longitude: 151.2006 },
        { name: 'Surry Hills Creative Hub', address: '30 Crown Street', starRating: 3, amenities: 'Artistic Decor, Cafe, Co-working Space', logo: getPlaceholderImageUrl('surry_hub_logo', 200, 100, 'logo'), latitude: -33.8830, longitude: 151.2137 },
        // Group 6: Rome
        { name: 'Colosseum Grand Hotel', address: 'Via dei Fori Imperiali 1', starRating: 5, amenities: 'Ancient Views, Rooftop Terrace', logo: getPlaceholderImageUrl('colosseum_grand_logo', 200, 100, 'logo'), latitude: 41.8902, longitude: 12.4922 },
        { name: 'Trastevere Terrace Inn', address: 'Piazza di Santa Maria 5', starRating: 3, amenities: 'Charming Neighborhood, Balconies', logo: getPlaceholderImageUrl('trastevere_inn_logo', 200, 100, 'logo'), latitude: 41.8897, longitude: 12.4667 },
        { name: 'Vatican View Suites', address: 'Borgo Pio 10', starRating: 4, amenities: 'Close to St. Peter\'s, Guided Tours', logo: getPlaceholderImageUrl('vatican_suites_logo', 200, 100, 'logo'), latitude: 41.9029, longitude: 12.4534 },
        { name: 'Pantheon Palace', address: 'Piazza della Rotonda 20', starRating: 4, amenities: 'Historic Building, Central Location', logo: getPlaceholderImageUrl('pantheon_palace_logo', 200, 100, 'logo'), latitude: 41.8986, longitude: 12.4768 },
        { name: 'Spanish Steps Residenza', address: 'Via Condotti 5', starRating: 5, amenities: 'Luxury Shopping Access, Personal Shopper', logo: getPlaceholderImageUrl('spanish_residenza_logo', 200, 100, 'logo'), latitude: 41.9058, longitude: 12.4822 },
        // Group 7: Berlin
        { name: 'Brandenburg Gate Hotel', address: 'Pariser Platz 1', starRating: 5, amenities: 'Historic Views, Fine Dining, Spa', logo: getPlaceholderImageUrl('brandenburg_hotel_logo', 200, 100, 'logo'), latitude: 52.5163, longitude: 13.3777 },
        { name: 'East Side Gallery Lofts', address: 'Mühlenstrasse 10', starRating: 4, amenities: 'Wall Views, Modern Art Decor', logo: getPlaceholderImageUrl('eastside_lofts_logo', 200, 100, 'logo'), latitude: 52.5074, longitude: 13.4244 },
        { name: 'Kreuzberg Quarter Hotel', address: 'Oranienstrasse 30', starRating: 3, amenities: 'Nightlife Access, Bar, Cafe', logo: getPlaceholderImageUrl('kreuzberg_hotel_logo', 200, 100, 'logo'), latitude: 52.4997, longitude: 13.4253 },
        { name: 'Potsdamer Platz Tower', address: 'Potsdamer Platz 5', starRating: 4, amenities: 'Modern Architecture, Cinema Access', logo: getPlaceholderImageUrl('potsdamer_tower_logo', 200, 100, 'logo'), latitude: 52.5096, longitude: 13.3736 },
        { name: 'Museum Island Inn', address: 'Bodestrasse 1', starRating: 4, amenities: 'Cultural Access, Library', logo: getPlaceholderImageUrl('museum_inn_logo', 200, 100, 'logo'), latitude: 52.5200, longitude: 13.4050 },
        // Group 8: Dubai
        { name: 'Burj Khalifa Residences', address: '1 Sheikh Mohammed bin Rashid Blvd', starRating: 5, amenities: 'Tallest Building Views, Luxury Pools', logo: getPlaceholderImageUrl('burj_residences_logo', 200, 100, 'logo'), latitude: 25.1972, longitude: 55.2744 },
        { name: 'Palm Jumeirah Resort & Spa', address: 'The Palm Jumeirah East Crescent', starRating: 5, amenities: 'Private Beach, Water Sports, Spa', logo: getPlaceholderImageUrl('palm_resort_logo', 200, 100, 'logo'), latitude: 25.1124, longitude: 55.1390 },
        { name: 'Dubai Marina Yacht Club Hotel', address: 'Dubai Marina', starRating: 4, amenities: 'Marina Views, Yacht Access', logo: getPlaceholderImageUrl('marina_yacht_logo', 200, 100, 'logo'), latitude: 25.0920, longitude: 55.1480 },
        { name: 'Old Dubai Souk Hotel', address: 'Al Fahidi Historical Neighbourhood', starRating: 3, amenities: 'Traditional Decor, Souk Access', logo: getPlaceholderImageUrl('souk_hotel_logo', 200, 100, 'logo'), latitude: 25.2637, longitude: 55.2972 },
        { name: 'Desert Oasis Retreat', address: 'Dubai Desert Conservation Reserve', starRating: 5, amenities: 'Desert Safaris, Stargazing, Pool', logo: getPlaceholderImageUrl('desert_retreat_logo', 200, 100, 'logo'), latitude: 24.9844, longitude: 55.4075 },
        // Group 9: Singapore
        { name: 'Marina Bay Sands View Hotel', address: '10 Bayfront Avenue', starRating: 5, amenities: 'Infinity Pool, Casino, Observation Deck', logo: getPlaceholderImageUrl('mbs_view_logo', 200, 100, 'logo'), latitude: 1.2838, longitude: 103.8591 },
        { name: 'Gardens by the Bay Eco Lodge', address: '18 Marina Gardens Drive', starRating: 4, amenities: 'Garden Views, Sustainable Design', logo: getPlaceholderImageUrl('gardens_lodge_logo', 200, 100, 'logo'), latitude: 1.2816, longitude: 103.8636 },
        { name: 'Orchard Road Luxury Suites', address: '290 Orchard Road', starRating: 5, amenities: 'Shopping Paradise, Personal Butler', logo: getPlaceholderImageUrl('orchard_suites_logo', 200, 100, 'logo'), latitude: 1.3019, longitude: 103.8372 },
        { name: 'Sentosa Island Beach Resort', address: '1 Siloso Beach Walk', starRating: 4, amenities: 'Beachfront, Water Park Access', logo: getPlaceholderImageUrl('sentosa_resort_logo', 200, 100, 'logo'), latitude: 1.2494, longitude: 103.8303 },
        { name: 'Chinatown Heritage Inn', address: '5 Pagoda Street', starRating: 3, amenities: 'Cultural Experience, Tea House', logo: getPlaceholderImageUrl('chinatown_inn_logo', 200, 100, 'logo'), latitude: 1.2838, longitude: 103.8439 },
        // Group 10: Toronto
        { name: 'CN Tower Vista Hotel', address: '301 Front St W', starRating: 5, amenities: 'Tower Views, Revolving Restaurant Access', logo: getPlaceholderImageUrl('cntower_vista_logo', 200, 100, 'logo'), latitude: 43.6426, longitude: -79.3871 },
        { name: 'Distillery District Boutique', address: '55 Mill Street', starRating: 4, amenities: 'Historic Area, Art Galleries, Theatre', logo: getPlaceholderImageUrl('distillery_boutique_logo', 200, 100, 'logo'), latitude: 43.6529, longitude: -79.3607 },
        { name: 'Kensington Market Place', address: '10 Baldwin Street', starRating: 3, amenities: 'Vibrant Market, Eclectic Rooms', logo: getPlaceholderImageUrl('kensington_place_logo', 200, 100, 'logo'), latitude: 43.6547, longitude: -79.4007 },
        { name: 'Harbourfront Lakeview Inn', address: '235 Queens Quay W', starRating: 4, amenities: 'Lake Ontario Views, Ferry Access', logo: getPlaceholderImageUrl('harbourfront_inn_logo', 200, 100, 'logo'), latitude: 43.6408, longitude: -79.3816 },
        { name: 'Yorkville Luxury Stay', address: '100 Bloor Street W', starRating: 5, amenities: 'High-End Shopping, Spa, Valet', logo: getPlaceholderImageUrl('yorkville_stay_logo', 200, 100, 'logo'), latitude: 43.6702, longitude: -79.3867 },
    ];


    // --- 4. Create Hotels with Deterministic Nested Data ---
    console.log(`Creating ${hotelsData.length} hotels in the database...`);
    const today = new Date();
    const currentYear = today.getUTCFullYear();
    const currentMonth = today.getUTCMonth() + 1; // getUTCMonth is 0-indexed

    for (let i = 0; i < hotelsData.length; i++) {
        const hotelData = hotelsData[i];

        // Assign City and Owner deterministically using modulo
        const cityIndex = i % cities.length;
        const ownerIndex = i % owners.length;
        const assignedCity = cities[cityIndex];
        const assignedOwner = owners[ownerIndex];

        // Define deterministic room types
        const roomTypesToCreate = [
            { name: 'Standard Queen', basePriceMultiplier: 1.0, amenities: 'Queen Bed, TV, WiFi, Bathroom' },
            { name: 'Deluxe King', basePriceMultiplier: 1.5, amenities: 'King Bed, TV, WiFi, Bathroom, Desk, Mini-fridge' },
            { name: 'Junior Suite', basePriceMultiplier: 2.0, amenities: 'King Bed, Separate Sitting Area, TV, WiFi, Large Bathroom, Mini-fridge, Coffee Maker' },
        ];
        // Add a family room for higher-rated hotels
        if (hotelData.starRating >= 4) {
            roomTypesToCreate.push({ name: 'Family Room', basePriceMultiplier: 1.8, amenities: 'Two Queen Beds, TV, WiFi, Bathroom, Sofa Bed Option' });
        }

        try {
            const hotel = await prisma.hotel.create({
                data: {
                    ...hotelData, // Spread the hardcoded core data
                    cityId: assignedCity.id,
                    ownerId: assignedOwner.id,
                    // Use nullish coalescing for optional lat/lon if not provided in hardcoded data
                    // latitude: hotelData.latitude ?? null,
                    // longitude: hotelData.longitude ?? null,

                    // --- Deterministic Nested Create: Hotel Images ---
                    images: {
                        create: [
                            { imageUrl: getPlaceholderImageUrl(`${hotelData.name}_exterior1`, 1280, 720, 'architecture') },
                            { imageUrl: getPlaceholderImageUrl(`${hotelData.name}_lobby`, 1024, 768, 'interiors') },
                            { imageUrl: getPlaceholderImageUrl(`${hotelData.name}_amenity_pool`, 800, 600, 'pool') },
                        ],
                    },

                    // --- Deterministic Nested Create: Room Types ---
                    roomTypes: {
                        create: roomTypesToCreate.map((rt, rtIndex) => {
                            const pricePerNight = Math.round((50 + hotelData.starRating * 25) * rt.basePriceMultiplier);

                            // --- Deterministic Nested Create: Room Availability (next 30 days) ---
                            const availabilitiesToCreate = [];
                            for (let dayOffset = 0; dayOffset < 30; dayOffset++) {
                                const date = new Date(Date.UTC(currentYear, currentMonth - 1, today.getUTCDate() + dayOffset));
                                date.setUTCHours(0, 0, 0, 0); // Ensure start of day UTC

                                availabilitiesToCreate.push({
                                    date: date,
                                    // Deterministic availability based on room type index and star rating
                                    availableRooms: 5 + (hotelData.starRating - 1) + (rtIndex * 2),
                                });
                            }

                            return {
                                name: rt.name,
                                pricePerNight: pricePerNight,
                                amenities: rt.amenities,

                                // --- Deterministic Nested Create: Room Type Images ---
                                images: {
                                    create: [
                                        { imageUrl: getPlaceholderImageUrl(`${hotelData.name}_${rt.name}_view1`, 640, 480, 'bedroom') },
                                        { imageUrl: getPlaceholderImageUrl(`${hotelData.name}_${rt.name}_view2`, 640, 480, 'room interior') },
                                    ],
                                },

                                // --- Deterministic Nested Create: Room Availability ---
                                availabilities: {
                                    create: availabilitiesToCreate,
                                },
                            };
                        }),
                    },
                },
            });
            if ((i + 1) % 5 === 0 || i === hotelsData.length - 1) {
                console.log(` -> Created hotel ${i + 1}/${hotelsData.length}: ${hotel.name}`);
            }

        } catch (error: any) {
            // Handle potential errors, e.g., unique constraint violations if data is reused/mistyped
            if (error.code === 'P2002') { // Prisma unique constraint violation code
                console.warn(`Skipping potential duplicate hotel entry for: ${hotelData.name}. Check data uniqueness. Error: ${error.message}`);
            } else {
                console.error(`Failed to create hotel "${hotelData.name}":`, error);
            }
        }
    }

    console.log(`Seeding finished.`);
}


async function seedBookings() {
    const users = await prisma.user.findMany({ where: { role: 'USER' } });
    const bookings = [
        { userId: users[0].id, status: BookingStatus.CONFIRMED, totalPrice: 150.0, paymentDetails: 'Credit Card' },
        { userId: users[0].id, status: BookingStatus.PENDING, totalPrice: 300.0, paymentDetails: 'PayPal' },
    ];
    for (const booking of bookings) {
        await prisma.booking.create({
            data: booking,
        });
    }
    console.log('Bookings seeded successfully');
}

async function seedBookingItems() {
    const bookings = await prisma.booking.findMany();
    const roomTypes = await prisma.roomType.findMany();
    const hotels = await prisma.hotel.findMany();
    const bookingItems = [
        {
            bookingId: bookings[0].id,
            type: 'HOTEL',
            hotelId: hotels[0].id,
            roomTypeId: roomTypes[0].id,
            startDate: new Date('2025-04-01'),
            endDate: new Date('2025-04-03'),
            price: 200.0,
            status: ItemStatus.CONFIRMED,
        },
        {
            bookingId: bookings[1 % bookings.length].id,
            type: 'FLIGHT',
            referenceId: 'AFS12345',
            status: ItemStatus.CONFIRMED,
        },
    ];
    for (const item of bookingItems) {
        await prisma.bookingItem.create({
            data: item,
        });
    }
    console.log('BookingItems seeded successfully');
}

async function seedInvoices() {
    const bookings = await prisma.booking.findMany();
    const invoices = [
        { bookingId: bookings[0].id, filePath: '/invoices/invoice1.pdf' },
    ];
    console.log('pain seedInvoices')
    for (const invoice of invoices) {
        await prisma.invoice.upsert({
            where: { bookingId: invoice.bookingId },
            update: {},
            create: invoice,
        });
    }
    console.log('Invoices seeded successfully');
}

async function seedNotifications() {
    const users = await prisma.user.findMany();
    const bookings = await prisma.booking.findMany();
    const notifications = [
        { userId: users[0].id, bookingId: bookings[0].id, message: 'Booking confirmed!', isRead: false },
        { userId: users[1 % users.length].id, message: 'New hotel added.', isRead: true },
    ];
    for (const notification of notifications) {
        await prisma.notification.create({
            data: notification,
        });
    }
    console.log('Notifications seeded successfully');
}

async function seedRoomAvailabilities() {
    const roomTypes = await prisma.roomType.findMany();
    const availabilities = [
        { roomTypeId: roomTypes[0].id, date: new Date('2025-04-01'), availableRooms: 5 },
        { roomTypeId: roomTypes[0].id, date: new Date('2025-04-02'), availableRooms: 4 },
    ];
    for (const availability of availabilities) {
        await prisma.roomAvailability.create({
            data: availability,
        });
    }
    console.log('RoomAvailabilities seeded successfully');
}

async function seedHotelImages() {
    const hotels = await prisma.hotel.findMany();
    const images = [
        { hotelId: hotels[0].id, imageUrl: 'https://example.com/hotel1.jpg' },
    ];
    for (const image of images) {
        await prisma.hotelImage.create({
            data: image,
        });
    }
    console.log('HotelImages seeded successfully');
}

async function seedRoomTypeImages() {
    const roomTypes = await prisma.roomType.findMany();
    const images = [
        { roomTypeId: roomTypes[0].id, imageUrl: 'https://example.com/room1.jpg' },
    ];
    for (const image of images) {
        await prisma.roomTypeImage.create({
            data: image,
        });
    }
    console.log('RoomTypeImages seeded successfully');
}

async function main() {
    try {
        await seedCities();
        await seedAirports();
        await seedUsers();
        await seedHotels();
        await seedBookings();
        await seedBookingItems();
        await seedInvoices();
        await seedNotifications();
        await seedRoomAvailabilities();
        await seedHotelImages();
        await seedRoomTypeImages();
    } catch (error) {
        console.error('Seeding failed:', {error});
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
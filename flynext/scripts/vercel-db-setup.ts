import { execSync } from 'child_process';
import prisma from '../utils/prisma.ts';

async function setupDatabase() {
    try {
        console.log('Starting database setup...');

        // Reset the database
        console.log('Resetting database...');
        await prisma.$transaction([
            prisma.bookingItem.deleteMany(),
            prisma.booking.deleteMany(),
            prisma.invoice.deleteMany(),
            prisma.notification.deleteMany(),
            prisma.roomAvailability.deleteMany(),
            prisma.roomTypeImage.deleteMany(),
            prisma.hotelImage.deleteMany(),
            prisma.roomType.deleteMany(),
            prisma.hotel.deleteMany(),
            prisma.airport.deleteMany(),
            prisma.city.deleteMany(),
            prisma.user.deleteMany(),
        ]);
        console.log('Database reset complete');

        // Run the seeding script
        console.log('Starting database seeding...');
        execSync('tsx scripts/seed-complete.ts', { stdio: 'inherit' });
        console.log('Database seeding complete');

    } catch (error) {
        console.error('Error during database setup:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Only run in Vercel environment
if (process.env.VERCEL) {
    setupDatabase();
} else {
    console.log('Not running in Vercel environment, skipping database setup');
} 
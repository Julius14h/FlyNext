import { execSync } from 'child_process';
import prisma from '../utils/prisma.ts';

async function main() {
  try {
    // Check if we're in a Vercel environment
    if (process.env.VERCEL) {
      console.log('Running in Vercel environment, proceeding with seeding...');
      
      // Run the seeding script
      execSync('tsx scripts/seed-complete.ts', { stdio: 'inherit' });
      
      console.log('Seeding completed successfully');
    } else {
      console.log('Not in Vercel environment, skipping seeding');
    }
  } catch (error) {
    console.error('Error during seeding:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 
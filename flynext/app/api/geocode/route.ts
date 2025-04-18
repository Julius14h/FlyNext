import { NextRequest, NextResponse } from "next/server";
import prisma from '@/utils/prisma';

// Nominatim API endpoint
const NOMINATIM_API_URL = "https://nominatim.openstreetmap.org/search";

// Types for Nominatim API response
interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  country?: string;
  [key: string]: string | undefined;
}

interface NominatimResult {
  display_name: string;
  lat: string;
  lon: string;
  address: NominatimAddress;
}

interface Coordinates {
  lat: number;
  lng: number;
}

interface GeocodeResponse {
  formattedAddress: string;
  city: string;
  country: string;
  cityId: number;
  coordinates: Coordinates;
}

interface CityRecord {
  id: number;
  name: string;
  country: string;
}

// Helper function to parse Canadian address
function parseCanadianAddress(addressParts: string[]): string | null {
  for (let i = 0; i < addressParts.length; i++) {
    const part = addressParts[i].trim();
    
    // Skip if this part is a postal code (e.g., L6X 3A9)
    if (part.match(/^[A-Z]\d[A-Z]\s*\d[A-Z]\d$/)) continue;
    
    // Skip if this part is a province code (e.g., ON)
    if (part.match(/^[A-Z]{2}$/)) continue;
    
    // Skip if this part is "Canada"
    if (part.toLowerCase() === 'canada') continue;
    
    // Skip if this part contains numbers (likely a street address)
    if (part.match(/\d/)) continue;
    
    // This is likely the city name
    return part;
  }
  return null;
}

// Helper function to find or create a city
async function findOrCreateCity(
  cityName: string, 
  countryName: string, 
  latitude: number, 
  longitude: number
): Promise<CityRecord> {
  try {
    console.log('Finding or creating city:', { cityName, countryName, latitude, longitude });
    
    // First try to find the existing city
    const existingCity = await prisma.city.findFirst({
      where: {
        name: cityName,
        country: countryName
      }
    });

    if (existingCity) {
      console.log('Found existing city:', existingCity);
      return existingCity;
    }

    console.log('Creating new city...');
    // If city doesn't exist, create it
    const newCity = await prisma.city.create({
      data: {
        name: cityName,
        country: countryName
      }
    });

    console.log('Created new city:', newCity);
    return newCity;
  } catch (error) {
    console.error('Error finding/creating city:', error);
    throw new Error(`Failed to find/create city: ${error instanceof Error ? error.message : String(error)}`);
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const { address } = await request.json();
    
    if (!address) {
      return NextResponse.json(
        { error: 'Address is required' },
        { status: 400 }
      );
    }
    
    console.log('Processing address:', address);
    
    // Add a delay to respect Nominatim's usage policy (max 1 request per second)
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Geocode the address using Nominatim
    const response = await fetch(
      `${NOMINATIM_API_URL}?format=json&q=${encodeURIComponent(address)}&addressdetails=1&limit=1`,
      {
        headers: {
          'User-Agent': 'FlyNext/1.0' // Required by Nominatim's terms of use
        }
      }
    );
    
    if (!response.ok) {
      throw new Error(`Nominatim API error: ${response.status}`);
    }
    
    const results = await response.json() as NominatimResult[];
    
    if (!results || results.length === 0) {
      return NextResponse.json(
        { error: 'Address not found' },
        { status: 404 }
      );
    }
    
    const result = results[0];
    console.log('Raw Nominatim result:', JSON.stringify(result, null, 2));
    
    // Extract city and country from the result
    const addressParts = result.address || {};
    let city = '';
    let country = addressParts.country || '';
    
    // Try to extract city from address parts
    if (addressParts.city) {
      city = addressParts.city;
    } else if (addressParts.town) {
      city = addressParts.town;
    } else if (addressParts.village) {
      city = addressParts.village;
    } else if (addressParts.municipality) {
      city = addressParts.municipality;
    } else {
      // If we couldn't find the city in the address parts,
      // try to parse it from the display name for Canadian addresses
      const displayParts = result.display_name.split(',');
      const parsedCity = parseCanadianAddress(displayParts);
      if (parsedCity) {
        city = parsedCity;
      }
    }

    console.log('Extracted city and country:', { city, country });

    if (!city || !country) {
      return NextResponse.json(
        { error: 'Could not determine city or country from address' },
        { status: 400 }
      );
    }

    // Find or create the city in our database
    const cityRecord = await findOrCreateCity(
      city,
      country,
      parseFloat(result.lat),
      parseFloat(result.lon)
    );
    
    const response_data: GeocodeResponse = {
      formattedAddress: result.display_name,
      city: cityRecord.name,
      country: cityRecord.country,
      cityId: cityRecord.id,
      coordinates: {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      }
    };
    
    console.log('Sending response:', response_data);
    
    // Return the processed data
    return NextResponse.json(response_data);
  } catch (error) {
    console.error('Geocoding error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to geocode address', 
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
} 
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthContext';
import { useTheme } from '@/components/ThemeContext';
import FlightSearch from '@/components/FlightSearch';
import FlightResults from '@/components/FlightResults';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

// Define interfaces for our data
interface Flight {
  id: string;
  airline: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  origin: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  destination: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  price: number;
  currency: string;
}

interface SearchParams {
  origin: string;
  destination: string;
  departureDate: string;
  returnDate: string;
  passengers: number;
  class: string;
}

export default function FlightsPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const [searchParams, setSearchParams] = useState<SearchParams>({
    origin: '',
    destination: '',
    departureDate: '',
    returnDate: '',
    passengers: 1,
    class: 'ECONOMY'
  });
  const [searchResults, setSearchResults] = useState<Flight[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (params: SearchParams) => {
    setIsSearching(true);
    setError('');
    
    try {
      // Here you would typically make an API call to search for flights
      // For now, we'll just simulate a delay and set some mock results
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock flight results
      const mockResults: Flight[] = [
        {
          id: '1',
          airline: 'FlyNext Airways',
          flightNumber: 'FN101',
          departureTime: '2023-06-15T10:00:00',
          arrivalTime: '2023-06-15T12:30:00',
          origin: {
            code: 'YYZ',
            name: 'Toronto Pearson International Airport',
            city: 'Toronto',
            country: 'Canada'
          },
          destination: {
            code: 'JFK',
            name: 'John F. Kennedy International Airport',
            city: 'New York',
            country: 'United States'
          },
          price: 299.99,
          currency: 'USD'
        },
        {
          id: '2',
          airline: 'SkyWings',
          flightNumber: 'SW205',
          departureTime: '2023-06-15T14:30:00',
          arrivalTime: '2023-06-15T17:00:00',
          origin: {
            code: 'YYZ',
            name: 'Toronto Pearson International Airport',
            city: 'Toronto',
            country: 'Canada'
          },
          destination: {
            code: 'JFK',
            name: 'John F. Kennedy International Airport',
            city: 'New York',
            country: 'United States'
          },
          price: 349.99,
          currency: 'USD'
        }
      ];
      
      setSearchResults(mockResults);
    } catch (err) {
      setError('Failed to search for flights. Please try again.');
      console.error('Flight search error:', err);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-teal-600 dark:bg-teal-700 p-2 rounded-full mr-3 transition-colors duration-300">
              <PaperAirplaneIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">Flight Search</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Find the perfect flight for your journey</p>
        </div>
        
        <FlightSearch />
        
        {error && (
          <div className="mt-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 text-center transition-colors duration-300">
            <p className="text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}
        
        {searchResults.length > 0 && (
          <div className="mt-8">
            <FlightResults results={{}} />
          </div>
        )}
      </div>
    </div>
  );
} 
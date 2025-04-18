"use client";
import { useState, useEffect } from 'react';
import LocationAutocomplete from './LocationAutocomplete';
import FlightResults from './FlightResults';
import { format } from 'date-fns';

interface Location {
  id?: string;
  code?: string;
  name: string;
  city: string;
  country: string;
}

interface Flight {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  price: number;
  currency: string;
  availableSeats: number;
  status: string;
  airline: {
    code: string;
    name: string;
  };
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
}

interface FlightResult {
  legs: number;
  flights: Flight[];
}

export default function FlightSearch() {
  const [tripType, setTripType] = useState<'one-way' | 'round-trip'>('one-way');
  const [source, setSource] = useState('');
  const [destination, setDestination] = useState('');
  const [departureDate, setDepartureDate] = useState('');
  const [returnDate, setReturnDate] = useState('');
  const [selectedSource, setSelectedSource] = useState<Location | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<Location | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Record<string, { results: FlightResult[] }> | null>(null);
  const [minDepartureDate, setMinDepartureDate] = useState('');

  // Set minimum departure date to today
  useEffect(() => {
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setMinDepartureDate(formattedDate);
  }, []);

  const handleSourceSelect = (location: Location) => {
    setSelectedSource(location);
  };

  const handleDestinationSelect = (location: Location) => {
    setSelectedDestination(location);
  };

  const handleSearch = async () => {
    if (!selectedSource || !selectedDestination || !departureDate) {
      setError('Please fill in all required fields');
      return;
    }

    if (tripType === 'round-trip' && !returnDate) {
      setError('Please select a return date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For round trips, we need to include both dates in the dates parameter
      const dates = tripType === 'round-trip' 
        ? `${departureDate},${returnDate}` 
        : departureDate;

      const queryParams = new URLSearchParams({
        source: selectedSource.code || selectedSource.city,
        destination: selectedDestination.code || selectedDestination.city,
        dates: dates
      });

      const response = await fetch(`/api/flights?${queryParams}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch flights');
      }

      const data = await response.json();
      console.log('Flight search results:', data);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Reset return date when switching to one-way
  useEffect(() => {
    if (tripType === 'one-way') {
      setReturnDate('');
    }
  }, [tripType]);

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6 transition-colors duration-300">
        <div className="flex space-x-4 mb-6">
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              checked={tripType === 'one-way'}
              onChange={() => setTripType('one-way')}
              className="form-radio h-4 w-4 text-teal-600 dark:text-teal-500"
            />
            <span className="text-gray-900 dark:text-white">One Way</span>
          </label>
          <label className="flex items-center space-x-2 cursor-pointer">
            <input
              type="radio"
              name="tripType"
              checked={tripType === 'round-trip'}
              onChange={() => setTripType('round-trip')}
              className="form-radio h-4 w-4 text-teal-600 dark:text-teal-500"
            />
            <span className="text-gray-900 dark:text-white">Round Trip</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              From
            </label>
            <LocationAutocomplete
              value={source}
              onChange={setSource}
              onSelect={handleSourceSelect}
              placeholder="City or Airport"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              To
            </label>
            <LocationAutocomplete
              value={destination}
              onChange={setDestination}
              onSelect={handleDestinationSelect}
              placeholder="City or Airport"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Departure Date
            </label>
            <input
              type="date"
              value={departureDate}
              onChange={(e) => setDepartureDate(e.target.value)}
              className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
              min={minDepartureDate}
            />
          </div>
          {tripType === 'round-trip' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Return Date
              </label>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full border border-gray-300 dark:border-gray-600 rounded p-2 focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                min={departureDate || minDepartureDate}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          disabled={loading}
          className="w-full bg-teal-600 dark:bg-teal-700 text-white py-3 px-4 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 disabled:bg-teal-400 dark:disabled:bg-teal-800 transition-colors duration-300 font-medium"
        >
          {loading ? 'Searching...' : 'Search Flights'}
        </button>

        {error && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 rounded-md transition-colors duration-300">
            {error}
          </div>
        )}
      </div>

      {results && Object.keys(results).length > 0 ? (
        <FlightResults results={results} />
      ) : results && (
        <div className="text-center text-gray-600 dark:text-gray-400 mt-4 p-6 bg-white dark:bg-gray-800 rounded-lg shadow transition-colors duration-300">
          No flights found for the selected criteria
        </div>
      )}
    </div>
  );
} 
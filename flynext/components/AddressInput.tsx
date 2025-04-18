"use client";
import { useState } from 'react';
import { MapPinIcon } from '@heroicons/react/24/outline';

interface Coordinates {
  lat: number;
  lng: number;
}

interface LocationData {
  formattedAddress: string;
  city: string;
  country: string;
  cityId: number;
  coordinates: Coordinates;
}

interface AddressInputProps {
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
}

export default function AddressInput({ onLocationSelect, placeholder = "Enter address" }: AddressInputProps) {
  const [address, setAddress] = useState('');
  const [coordinates, setCoordinates] = useState<Coordinates | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [locationData, setLocationData] = useState<LocationData | null>(null);
  
  const verifyAddress = async () => {
    if (!address.trim()) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Send address to our backend API
      const response = await fetch('/api/geocode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to geocode address');
      }
      
      const data = await response.json();
      setCoordinates(data.coordinates);
      setLocationData(data);
      
      // Call the parent component's callback with the location data
      onLocationSelect(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not verify address. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MapPinIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder={placeholder}
            className="pl-10 p-2 border border-gray-300 w-full rounded-l text-gray-900 focus:ring-[rgb(30,200,191)] focus:border-[rgb(30,200,191)]"
          />
        </div>
        <button
          onClick={verifyAddress}
          disabled={loading || !address.trim()}
          className="bg-[rgb(30,200,191)] text-white px-4 py-2 rounded-r hover:bg-[rgb(25,170,162)] disabled:bg-[rgb(30,200,191,0.5)] transition-colors"
        >
          {loading ? 'Verifying...' : 'Verify Address'}
        </button>
      </div>
      
      {error && (
        <div className="text-red-600 text-sm">{error}</div>
      )}
      
      {locationData && (
        <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
          <div className="font-medium text-gray-800">{locationData.formattedAddress}</div>
          <div className="text-sm text-gray-600 mt-1">
            {locationData.city && locationData.country ? (
              <span>{locationData.city}, {locationData.country}</span>
            ) : (
              <span>Location verified</span>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            Coordinates: {coordinates?.lat.toFixed(6)}, {coordinates?.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
} 
"use client";
import { useState, useEffect, useRef } from 'react';

interface Location {
  id?: string;
  code?: string;
  name: string;
  city: string;
  country: string;
}

interface LocationAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect: (location: Location) => void;
  placeholder: string;
}

export default function LocationAutocomplete({ value, onChange, onSelect, placeholder }: LocationAutocompleteProps) {
  const [allSuggestions, setAllSuggestions] = useState<Location[]>([]);
  const [filteredSuggestions, setFilteredSuggestions] = useState<Location[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchAllSuggestions = async () => {
      try {
        // Fetch cities
        const citiesResponse = await fetch('/api/cities');
        if (!citiesResponse.ok) throw new Error('Failed to fetch cities');
        const citiesData = await citiesResponse.json();

        // Fetch airports
        const airportsResponse = await fetch('/api/airports');
        if (!airportsResponse.ok) throw new Error('Failed to fetch airports');
        const airportsData = await airportsResponse.json();

        // Normalize cities data
        const normalizedCities = Array.isArray(citiesData) ? citiesData.map(city => ({
          name: city.city, // Use city name as the display name
          city: city.city,
          country: city.country
        })) : [];

        // Normalize airports data
        const normalizedAirports = Array.isArray(airportsData) ? airportsData.map(airport => ({
          id: airport.id || '',
          code: airport.code || '',
          name: airport.name || '',
          city: airport.city || '',
          country: airport.country || ''
        })) : [];

        const combinedData = [...normalizedCities, ...normalizedAirports];
        console.log('Combined locations:', combinedData);
        setAllSuggestions(combinedData);
      } catch (error) {
        console.error('Error fetching locations:', error);
        setAllSuggestions([]);
      }
    };

    fetchAllSuggestions();
  }, []);

  useEffect(() => {
    if (!value) {
      setFilteredSuggestions([]);
      setIsOpen(false);
      return;
    }

    const searchTerm = value.toLowerCase().trim();
    const filtered = allSuggestions.filter(location => {
      const name = location.name.toLowerCase();
      const city = location.city.toLowerCase();
      const code = location.code?.toLowerCase() || '';

      return name.includes(searchTerm) || 
             city.includes(searchTerm) ||
             code.includes(searchTerm);
    });

    console.log('Filtered locations:', filtered);
    setFilteredSuggestions(filtered);
    setIsOpen(filtered.length > 0);
  }, [value, allSuggestions]);

  const handleSelect = (location: Location) => {
    console.log('Selected location:', location);
    onChange(location.name);
    onSelect(location);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className="relative">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="border border-gray-300 dark:border-gray-600 p-2 w-full bg-white dark:bg-gray-700 rounded text-gray-900 dark:text-white transition-colors duration-300"
        onFocus={() => value && setIsOpen(true)}
      />
      {isOpen && filteredSuggestions.length > 0 && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto transition-colors duration-300">
          {filteredSuggestions.map((location, index) => (
            <div
              key={`${location.city}-${location.country}-${index}`}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer transition-colors duration-300"
              onClick={() => handleSelect(location)}
            >
              <div className="font-medium text-gray-900 dark:text-white">{location.name}</div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                {location.city}, {location.country} {location.code && `(${location.code})`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 
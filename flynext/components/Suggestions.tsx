import React from 'react';
import { BuildingOfficeIcon, PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';

interface SuggestionsProps {
  hotels?: any[];
  flights?: any[];
  onAddHotel: (hotel: any) => void;
  onAddFlight: (flight: any) => void;
  onViewAllHotels: (city: string) => void;
  onViewAllFlights: (destination: string) => void;
}

export default function Suggestions({
  hotels,
  flights,
  onAddHotel,
  onAddFlight,
  onViewAllHotels,
  onViewAllFlights
}: SuggestionsProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <>
      {hotels && hotels.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Hotel Suggestions</h2>
            <p className="text-sm text-gray-600">
              Hotels in {hotels[0].city || 'Unknown'}
            </p>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {hotels.map((hotel) => (
                <div key={hotel.id} className="flex items-start border-b border-gray-100 pb-4 last:border-0">
                  <div className="w-20 h-20 bg-gray-200 rounded-md overflow-hidden mr-4">
                    {hotel.images && hotel.images.length > 0 ? (
                      <img 
                        src={hotel.images[0]} 
                        alt={hotel.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BuildingOfficeIcon className="h-8 w-8 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{hotel.name}</h3>
                    <p className="text-sm text-gray-600">
                      {hotel.city || 'Unknown'}, {hotel.country || 'Unknown'}
                    </p>
                    <div className="flex items-center mt-1">
                      {[...Array(hotel.starRating)].map((_, i) => (
                        <svg key={i} className="h-4 w-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-sm font-medium text-teal-600 mt-1">
                      From CAD {hotel.startingPrice?.toFixed(2)} per night
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => onAddHotel(hotel)}
                      className="px-3 py-1 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => onViewAllHotels(hotels[0].city || '')}
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                View all hotels in {hotels[0].city || 'Unknown'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      {flights && flights.length > 0 && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Flight Suggestions</h2>
            <p className="text-sm text-gray-600">
              Flights to {flights[0].destination?.city || 'Unknown'}
            </p>
          </div>
          <div className="p-4">
            <div className="space-y-4">
              {flights.map((flight) => (
                <div key={flight.id} className="flex items-start border-b border-gray-100 pb-4 last:border-0">
                  <PaperAirplaneIcon className="h-6 w-6 text-teal-600 mr-3 mt-1" />
                  <div className="flex-1">
                    <h3 className="font-medium">
                      {flight.origin?.city || 'Unknown'} → {flight.destination?.city || 'Unknown'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {formatDate(flight.departureTime)} • {flight.airline?.name} {flight.flightNumber}
                    </p>
                    <p className="text-sm text-gray-600">
                      Departure: {format(new Date(flight.departureTime), 'HH:mm')} • 
                      Arrival: {format(new Date(flight.arrivalTime), 'HH:mm')}
                    </p>
                    <p className="text-sm font-medium text-teal-600 mt-1">
                      {flight.currency} {flight.price.toFixed(2)}
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => onAddFlight(flight)}
                      className="px-3 py-1 bg-teal-600 text-white text-sm rounded-md hover:bg-teal-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <button
                onClick={() => onViewAllFlights(flights[0].destination?.city || '')}
                className="text-teal-600 hover:text-teal-800 font-medium"
              >
                View all flights to {flights[0].destination?.city || 'Unknown'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
} 
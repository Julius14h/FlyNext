import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Icon } from 'leaflet';
import { BuildingOfficeIcon, StarIcon } from '@heroicons/react/24/solid';

interface HotelListingProps {
  hotel: Hotel;
  onViewDetails: (hotelId: number) => void;
  isOwner?: boolean;
  onManage?: (hotelId: number) => void;
}

interface Hotel {
  id: number;
  name: string;
  city: string | { name: string; country: string };
  starRating: number;
  amenities: string;
  startingPrice: number | null;
  images: string[];
  latitude: number | null;
  longitude: number | null;
  address: string;
}

interface RoomType {
  id: number;
  name: string;
  pricePerNight: number;
  amenities: string;
  images?: string[];
}

export default function HotelListing({ hotel, onViewDetails, isOwner, onManage }: HotelListingProps) {
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRoomTypes();
  }, [hotel.id]);

  const fetchRoomTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/hotels/${hotel.id}/room-types`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch room types');
      }
      
      const data = await response.json();
      setRoomTypes(data);
    } catch (err) {
      console.error('Error fetching room types:', err);
      setError('Failed to load room types');
    } finally {
      setLoading(false);
    }
  };

  // Custom marker icon
  const customIcon = new Icon({
    iconUrl: '/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden mb-6 transition-colors duration-300">
      <div className="grid grid-cols-1 lg:grid-cols-3">
        {/* Hotel Images and Details */}
        <div className="lg:col-span-2 p-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">{hotel.name}</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {typeof hotel.city === 'object' 
                  ? `${hotel.city.name}, ${hotel.city.country}` 
                  : hotel.city}
              </p>
              <div className="flex items-center mt-1">
                {[...Array(hotel.starRating)].map((_, index) => (
                  <StarIcon key={index} className="h-5 w-5 text-yellow-400" />
                ))}
              </div>
            </div>
            {hotel.startingPrice && (
              <div className="text-right">
                <p className="text-sm text-gray-500 dark:text-gray-400">Starting from</p>
                <p className="text-xl font-bold text-teal-600 dark:text-teal-400">${hotel.startingPrice}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">per night</p>
              </div>
            )}
          </div>

          {/* Hotel Images */}
          <div className="mb-4">
            {hotel.images && hotel.images.length > 0 ? (
              <div className="relative">
                <div className="overflow-x-auto pb-4">
                  <div className="flex space-x-4">
                    {hotel.images.map((image, index) => (
                      <div 
                        key={index} 
                        className="flex-none w-80 aspect-video rounded-lg overflow-hidden"
                      >
                        <img
                          src={image}
                          alt={`${hotel.name} - Image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <BuildingOfficeIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
              </div>
            )}
          </div>

          {/* Amenities */}
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Amenities</h3>
            <div className="flex flex-wrap gap-2">
              {hotel.amenities && hotel.amenities.length > 0 ? (
                hotel.amenities.split(',').map((amenity, index) => (
                  <span 
                    key={index} 
                    className="bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-3 py-1 rounded-full text-sm"
                  >
                    {amenity.trim()}
                  </span>
                ))
              ) : (
                <p className="text-gray-500 dark:text-gray-400">No amenities listed</p>
              )}
            </div>
          </div>

          {/* Room Types */}
          <div>
            <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200 mb-2">Available Room Types</h3>
            {loading ? (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-teal-500"></div>
              </div>
            ) : error ? (
              <p className="text-red-500 dark:text-red-400">{error}</p>
            ) : roomTypes.length > 0 ? (
              <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roomTypes.map((roomType) => (
                    <div 
                      key={roomType.id} 
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow dark:bg-gray-700"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold dark:text-white">{roomType.name}</h4>
                          <p className="text-teal-600 dark:text-teal-400 font-bold">${roomType.pricePerNight}/night</p>
                        </div>
                        {roomType.images && roomType.images.length > 0 && (
                          <div className="w-16 h-16 rounded overflow-hidden">
                            <img
                              src={roomType.images[0]}
                              alt={roomType.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      {roomType.amenities && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {roomType.amenities.split(',').slice(0, 3).map((amenity, index) => (
                            <span 
                              key={index} 
                              className="bg-gray-100 dark:bg-gray-600 text-gray-800 dark:text-gray-200 px-2 py-0.5 rounded-full text-xs"
                            >
                              {amenity.trim()}
                            </span>
                          ))}
                          {roomType.amenities.split(',').length > 3 && (
                            <span className="text-gray-500 dark:text-gray-400 text-xs">+{roomType.amenities.split(',').length - 3} more</span>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No room types available</p>
            )}
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <button
              onClick={() => onViewDetails(hotel.id)}
              className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
            >
              View Details
            </button>
            {isOwner && onManage && (
              <button
                onClick={() => onManage(hotel.id)}
                className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
              >
                Manage Hotel
              </button>
            )}
          </div>
        </div>

        {/* Map */}
        <div className="h-[300px] lg:h-auto relative z-0">
          {hotel.latitude && hotel.longitude ? (
            <MapContainer
              center={[hotel.latitude, hotel.longitude]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              className="z-0"
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <Marker
                position={[hotel.latitude, hotel.longitude]}
                icon={customIcon}
              >
                <Popup>
                  <div>
                    <h3 className="font-semibold">{hotel.name}</h3>
                    <p>{typeof hotel.city === 'object' ? `${hotel.city.name}, ${hotel.city.country}` : hotel.city}</p>
                  </div>
                </Popup>
              </Marker>
            </MapContainer>
          ) : (
            <div className="h-full flex items-center justify-center bg-gray-100">
              <p className="text-gray-500">Location not available</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
import { useState, useEffect } from 'react';
import { XMarkIcon, PhotoIcon, BuildingOfficeIcon, CalendarIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import RoomTypeViewer from './RoomTypeViewer';
import { useRouter } from 'next/navigation';

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
  ownerId: number;
  address: string;
}

interface RoomType {
  id: number;
  name: string;
  pricePerNight: number;
  amenities: string;
  images?: string[];
}

interface HotelDetailsProps {
  hotelId: number;
  onClose: () => void;
}

export default function HotelDetails({ hotelId, onClose }: HotelDetailsProps) {
  const router = useRouter();
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedRoomType, setSelectedRoomType] = useState<RoomType | null>(null);
  const [showRoomTypeViewer, setShowRoomTypeViewer] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');
  const [selectedRoomTypeForBooking, setSelectedRoomTypeForBooking] = useState<RoomType | null>(null);

  useEffect(() => {
    const fetchHotelData = async () => {
      try {
        setLoading(true);
        
        // Fetch hotel details
        const hotelResponse = await fetch(`/api/hotels/${hotelId}`);
        
        if (!hotelResponse.ok) {
          throw new Error('Failed to fetch hotel');
        }
        
        const hotelData = await hotelResponse.json();
        setHotel(hotelData);
        
        // Fetch room types for this hotel
        const roomTypesResponse = await fetch(`/api/hotels/${hotelId}/room-types`);
        
        if (!roomTypesResponse.ok) {
          throw new Error('Failed to fetch room types');
        }
        
        const roomTypesData = await roomTypesResponse.json();
        setRoomTypes(roomTypesData);
      } catch (err) {
        console.error('Error fetching hotel data:', err);
        setError('Failed to load hotel information');
      } finally {
        setLoading(false);
      }
    };

    if (hotelId) {
      fetchHotelData();
    }
  }, [hotelId]);

  const handleViewRoomType = (roomType: RoomType) => {
    setSelectedRoomType(roomType);
    setShowRoomTypeViewer(true);
  };

  const handleBookNow = (roomType: RoomType) => {
    setSelectedRoomTypeForBooking(roomType);
    setShowDatePicker(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedRoomTypeForBooking || !checkInDate || !checkOutDate) return;

    const bookingItem = {
      type: 'HOTEL',
      hotelId: hotelId,
      roomTypeId: selectedRoomTypeForBooking.id,
      startDate: checkInDate,
      endDate: checkOutDate,
      price: selectedRoomTypeForBooking.pricePerNight,
      details: {
        ...selectedRoomTypeForBooking,
        hotelName: hotel?.name,
        hotelCity: typeof hotel?.city === 'object' ? hotel.city.name : hotel?.city,
        hotelCountry: typeof hotel?.city === 'object' ? hotel.city.country : ''
      }
    };

    // Encode the booking item and redirect to checkout
    const encodedItem = encodeURIComponent(JSON.stringify(bookingItem));
    router.push(`/checkout?items=${encodedItem}`);
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl transition-colors duration-300">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !hotel) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl transition-colors duration-300">
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-4">
            {error || 'Hotel not found'}
          </div>
          <button
            onClick={onClose}
            className="flex items-center text-teal-600 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300"
          >
            <XMarkIcon className="h-5 w-5 mr-1" />
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-colors duration-300">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-2xl font-bold dark:text-white">{hotel.name}</h1>
          <button 
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Hotel Images */}
            <div>
              <h2 className="text-xl font-semibold mb-3 dark:text-white">Hotel Images</h2>
              {hotel.images && hotel.images.length > 0 ? (
                <div className="relative">
                  <div className="overflow-x-auto pb-4">
                    <div className="flex space-x-4">
                      {hotel.images.map((image, index) => (
                        <div 
                          key={index} 
                          className="flex-none w-80 aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden"
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
                  <PhotoIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                </div>
              )}
            </div>
            
            {/* Hotel Details */}
            <div>
              <h2 className="text-xl font-semibold mb-3 dark:text-white">Hotel Details</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Location</h3>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">
                    {typeof hotel.city === 'object' ? `${hotel.city.name}, ${hotel.city.country}` : hotel.city}
                  </p>
                  <p className="text-gray-700 dark:text-gray-300 mt-1">{hotel.address}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Star Rating</h3>
                  <div className="flex mt-1">
                    {[...Array(hotel.starRating)].map((_, i) => (
                      <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Amenities</h3>
                  <div className="flex flex-wrap gap-2 mt-1">
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
              </div>
            </div>
          </div>
          
          {/* Room Types Section */}
          <div>
            <h2 className="text-2xl font-bold mb-4 dark:text-white">Room Types</h2>
            
            {roomTypes.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roomTypes.map((roomType) => (
                  <div 
                    key={roomType.id} 
                    className="bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div 
                      className="aspect-video bg-gray-100 dark:bg-gray-600 cursor-pointer"
                      onClick={() => handleViewRoomType(roomType)}
                    >
                      {roomType.images && roomType.images.length > 0 ? (
                        <img
                          src={roomType.images[0]}
                          alt={roomType.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 dark:text-gray-500" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-semibold mb-1 dark:text-white">{roomType.name}</h3>
                      <p className="text-teal-600 dark:text-teal-400 font-bold">${roomType.pricePerNight} <span className="text-sm font-normal text-gray-500 dark:text-gray-400">per night</span></p>
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
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBookNow(roomType);
                        }}
                        className="mt-4 w-full bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
                      >
                        Book Now
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 dark:text-gray-400">No room types available for this hotel.</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showRoomTypeViewer && selectedRoomType && (
        <RoomTypeViewer 
          roomType={selectedRoomType} 
          onClose={() => setShowRoomTypeViewer(false)} 
        />
      )}

      {showDatePicker && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 dark:text-white">Select Dates</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Check-in Date
                </label>
                <input
                  type="date"
                  value={checkInDate}
                  onChange={(e) => setCheckInDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Check-out Date
                </label>
                <input
                  type="date"
                  value={checkOutDate}
                  onChange={(e) => setCheckOutDate(e.target.value)}
                  min={checkInDate || new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  disabled={!checkInDate || !checkOutDate}
                  className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors disabled:opacity-50"
                >
                  Continue to Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
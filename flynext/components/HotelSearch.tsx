"use client";
import { useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';

const Map = dynamic(() => import('./Map'), { ssr: false });

interface Hotel {
  id: number;
  name: string;
  city: string;
  country?: string;
  starRating: number;
  startingPrice: number | null;
  latitude: number | null;
  longitude: number | null;
  imageUrl: string | null;
}

interface RoomType {
  id: string;
  type: string;
  amenities: string[];
  pricePerNight: number;
  quantity?: number;
}

interface HotelDetails {
  id: number;
  name: string;
  amenities: string;
  rooms: RoomType[];
  images: { id: string; imageUrl: string }[];
}

export default function HotelSearch() {
  const router = useRouter();
  const [hotelResults, setHotelResults] = useState<Hotel[]>([]);
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null);
  const [hotelDetails, setHotelDetails] = useState<HotelDetails | null>(null);
  const [searchParams, setSearchParams] = useState<{ checkIn: string; checkOut: string }>({ checkIn: "", checkOut: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<RoomType | null>(null);
  const [checkInDate, setCheckInDate] = useState('');
  const [checkOutDate, setCheckOutDate] = useState('');

  const handleHotelSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const city = formData.get("city") as string;
    const checkIn = formData.get("checkIn") as string;
    const checkOut = formData.get("checkOut") as string;
    const name = (formData.get("name") as string) || "";
    const starRating = (formData.get("starRating") as string) || "";
    const minPrice = (formData.get("minPrice") as string) || "";
    const maxPrice = (formData.get("maxPrice") as string) || "";

    setSearchParams({ checkIn, checkOut });

    try {
      const queryParams = new URLSearchParams({
        city,
        checkIn,
        checkOut,
        ...(name && { name }),
        ...(starRating && { starRating }),
        ...(minPrice && { minPrice }),
        ...(maxPrice && { maxPrice }),
      });

      const response = await fetch(`/api/hotels/search?${queryParams}`);
      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }
      const data = await response.json();
      setHotelResults(data);
      setSelectedHotel(null);
      setHotelDetails(null);
    } catch (err) {
      setError('Error searching for hotels');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHotelDetails = async (hotelId: number, checkIn: string, checkOut: string) => {
    try {
      const response = await fetch(`/api/hotels/${hotelId}?checkIn=${checkIn}&checkOut=${checkOut}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();

      // Fetch hotel images
      const imagesResponse = await fetch(`/api/hotels/${hotelId}/images`);
      if (imagesResponse.ok) {
        const images = await imagesResponse.json();
        data.images = images;
      }

      // Fetch room availability
      const availabilityResponse = await fetch(`/api/hotels/${hotelId}/availability?checkIn=${checkIn}&checkOut=${checkOut}`);
      if (availabilityResponse.ok) {
        const availabilityData = await availabilityResponse.json();
        if (Array.isArray(availabilityData) && availabilityData.length > 0) {
          data.rooms = data.rooms.map((room: RoomType) => ({
            ...room,
            quantity: availabilityData.find((avail: any) => avail.id === room.id)?.quantity || 0
          }));
        } else {
          data.rooms = data.rooms.map((room: RoomType) => ({
            ...room,
            quantity: 0
          }));
        }
      }

      setHotelDetails(data);
    } catch (error) {
      console.error("Error fetching hotel details:", error);
      setHotelDetails(null);
    }
  };

  const handleHotelClick = (hotel: Hotel) => {
    if (selectedHotel?.id === hotel.id) {
      setSelectedHotel(null);
      setHotelDetails(null);
      return;
    }
    setSelectedHotel(hotel);
    fetchHotelDetails(hotel.id, searchParams.checkIn, searchParams.checkOut);
  };

  const handleBookNow = (room: RoomType) => {
    setSelectedRoomForBooking(room);
    setShowDatePicker(true);
  };

  const handleConfirmBooking = () => {
    if (!selectedRoomForBooking || !checkInDate || !checkOutDate || !selectedHotel) return;

    const bookingItem = {
      type: 'HOTEL',
      hotelId: selectedHotel.id,
      roomTypeId: selectedRoomForBooking.id,
      startDate: checkInDate,
      endDate: checkOutDate,
      price: selectedRoomForBooking.pricePerNight,
      details: {
        ...selectedRoomForBooking,
        hotelName: selectedHotel.name,
        hotelCity: selectedHotel.city,
        hotelCountry: selectedHotel.country || ''
      }
    };

    // Encode the booking item and redirect to checkout
    const encodedItem = encodeURIComponent(JSON.stringify(bookingItem));
    router.push(`/checkout?items=${encodedItem}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <form onSubmit={handleHotelSearch} className="space-y-4">
        <input
          name="city"
          placeholder="City"
          className="border border-gray-300 p-2 w-full bg-white rounded text-gray-900"
          required
        />
        <input
          name="checkIn"
          type="date"
          className="border border-gray-300 p-2 w-full bg-white rounded text-gray-900"
          required
        />
        <input
          name="checkOut"
          type="date"
          className="border border-gray-300 p-2 w-full bg-white rounded text-gray-900"
          required
        />
        <input
          name="name"
          placeholder="Hotel Name (optional)"
          className="border border-gray-300 p-2 w-full bg-white rounded text-gray-900"
        />
        <input
          name="starRating"
          type="number"
          min="1"
          max="5"
          placeholder="Star Rating (1-5)"
          className="border border-gray-300 p-2 w-full bg-white rounded text-gray-900"
        />
        <input
          name="minPrice"
          type="number"
          placeholder="Min Price"
          className="border border-gray-300 p-2 w-full bg-white rounded text-gray-900"
        />
        <input
          name="maxPrice"
          type="number"
          placeholder="Max Price"
          className="border border-gray-300 p-2 w-full bg-white rounded text-gray-900"
        />
        <button
          type="submit"
          className="bg-[rgb(15,49,61)] text-white p-2 w-full rounded hover:bg-[rgb(20,60,75)]"
          disabled={loading}
        >
          {loading ? "Searching..." : "Search Hotels"}
        </button>
      </form>

      {error && <div className="mt-4 text-red-500">{error}</div>}

      {hotelResults.length > 0 && (
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            {hotelResults.map((hotel) => (
              <div
                key={hotel.id}
                className="border p-4 mb-2 cursor-pointer hover:bg-gray-100"
                onClick={() => handleHotelClick(hotel)}
              >
                <div className="flex">
                  {hotel.imageUrl && (
                    <img src={hotel.imageUrl} alt={hotel.name} className="w-24 h-24 object-cover mr-4" />
                  )}
                  <div>
                    <h3 className="text-lg font-bold">{hotel.name}</h3>
                    <p>
                      {hotel.city} - {hotel.starRating} stars
                    </p>
                    <p>Starting at ${hotel.startingPrice ?? "N/A"} per night</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="h-32 rounded-lg mt-2">
            <Map location={{ 
              lat: hotelResults[0].latitude || 0, 
              lng: hotelResults[0].longitude || 0 
            }} />
          </div>
        </div>
      )}

      {selectedHotel && hotelDetails && (
        <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <button 
            onClick={() => {
              setSelectedHotel(null);
              setHotelDetails(null);
            }}
            className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>

          {/* Image Gallery */}
          <div className="mb-4">
            <div className="relative w-full overflow-x-auto">
              <div className="flex space-x-4 pb-4">
                {hotelDetails.images?.map((image) => (
                  <div key={image.id} className="flex-none">
                    <img 
                      src={image.imageUrl} 
                      alt={`${selectedHotel.name} - ${image.id}`}
                      className="w-64 h-48 object-cover rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-start justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">{selectedHotel.name}</h2>
              <p className="text-gray-600">{selectedHotel.city} - {selectedHotel.starRating} stars</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Starting from</p>
              <p className="text-lg font-semibold">${selectedHotel.startingPrice ?? "N/A"}/night</p>
            </div>
          </div>

          <div className="mb-4">
            <h3 className="font-semibold mb-2">Hotel Amenities:</h3>
            <p className="text-gray-600">{hotelDetails.amenities || "N/A"}</p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Rooms:</h3>
            <div className="grid gap-4">
              {hotelDetails.rooms.map((room) => (
                <div key={room.id} className="border p-3 rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{room.type}</h4>
                      <div className="mt-1">
                        <p className="text-sm text-gray-600">Amenities:</p>
                        <ul className="text-sm text-gray-600 list-disc list-inside">
                          {room.amenities.map((amenity, index) => (
                            <li key={index}>{amenity}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">${room.pricePerNight}/night</p>
                      <p className={`text-sm mt-1 ${room.quantity && room.quantity > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {room.quantity && room.quantity > 0 
                          ? `${room.quantity} room${room.quantity > 1 ? 's' : ''} available`
                          : 'No rooms available'}
                      </p>
                      {room.quantity && room.quantity > 0 && (
                        <button
                          onClick={() => handleBookNow(room)}
                          className="mt-2 bg-teal-600 dark:bg-teal-500 text-white px-4 py-2 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors"
                        >
                          Book Now
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
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
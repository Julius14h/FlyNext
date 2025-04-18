import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { RoomType } from '@/types/hotel';

interface RoomAvailability {
  id: number;
  roomTypeId: number;
  date: string;
  availableRooms: number;
}

interface RoomAvailabilityManagerProps {
  hotelId: number;
  roomTypes: RoomType[];
}

export default function RoomAvailabilityManager({ hotelId, roomTypes }: RoomAvailabilityManagerProps) {
  const router = useRouter();
  const [selectedRoomType, setSelectedRoomType] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [availableRooms, setAvailableRooms] = useState<number>(0);
  const [availableRoomsInput, setAvailableRoomsInput] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [availabilityData, setAvailabilityData] = useState<RoomAvailability[]>([]);
  const [roomsError, setRoomsError] = useState<string | null>(null);

  useEffect(() => {
    if (roomTypes.length > 0 && roomTypes[0].id) {
      setSelectedRoomType(roomTypes[0].id);
    }
  }, [roomTypes]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    setRoomsError(null);

    // Validate available rooms
    const roomsValue = parseInt(availableRoomsInput);
    if (isNaN(roomsValue) || roomsValue < 0) {
      setRoomsError('Available rooms must be a valid non-negative integer');
      setLoading(false);
      return;
    }

    if (!selectedRoomType || !selectedDate) {
      setError('Please fill in all fields correctly');
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/hotels/${hotelId}/availability`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          roomTypeId: selectedRoomType,
          date: selectedDate,
          availableRooms: roomsValue,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update room availability');
      }

      const updatedAvailability = await response.json();
      
      // Update the availability data
      setAvailabilityData(prev => {
        const existingIndex = prev.findIndex(
          item => item.roomTypeId === selectedRoomType && item.date === selectedDate
        );
        
        if (existingIndex >= 0) {
          const newData = [...prev];
          newData[existingIndex] = updatedAvailability;
          return newData;
        } else {
          return [...prev, updatedAvailability];
        }
      });
      
      setSuccess('Room availability updated successfully');
      setAvailableRooms(roomsValue);
    } catch (error) {
      console.error('Error updating room availability:', error);
      setError('Failed to update room availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckAvailability = async () => {
    if (!selectedRoomType || !selectedDate) {
      setError('Please select a room type and date');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Format the date for the API
      const formattedDate = new Date(selectedDate).toISOString().split('T')[0];
      
      const response = await fetch(`/api/hotels/${hotelId}/availability?roomTypeId=${selectedRoomType}&date=${formattedDate}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch room availability');
      }

      const data = await response.json();
      
      if (data.availableRooms !== undefined) {
        setAvailableRooms(data.availableRooms);
        setAvailableRoomsInput(data.availableRooms.toString());
      } else {
        setAvailableRooms(0);
        setAvailableRoomsInput('0');
      }
    } catch (error) {
      console.error('Error checking room availability:', error);
      setError(error instanceof Error ? error.message : 'Failed to check room availability. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAvailableRoomsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    
    // Allow empty input for better UX
    if (value === '') {
      setAvailableRoomsInput('');
      setRoomsError(null);
      return;
    }
    
    // Check if the input is a valid integer
    const intValue = parseInt(value);
    if (isNaN(intValue)) {
      setRoomsError('Please enter a valid integer');
    } else if (intValue < 0) {
      setRoomsError('Available rooms cannot be negative');
    } else {
      setRoomsError(null);
    }
    
    setAvailableRoomsInput(value);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl transition-colors duration-300">
      <div className="flex items-center mb-4">
        <CalendarIcon className="h-6 w-6 mr-2 text-teal-600 dark:text-teal-400" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Manage Room Availability</h2>
      </div>

      {error && (
        <div className="bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 dark:bg-green-900/30 border border-green-400 dark:border-green-700 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Room Type
          </label>
          <select
            value={selectedRoomType || ''}
            onChange={(e) => setSelectedRoomType(Number(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          >
            <option value="">Select a room type</option>
            {roomTypes.map((roomType) => (
              <option key={roomType.id} value={roomType.id}>
                {roomType.name} - ${roomType.pricePerNight}/night
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Available Rooms
          </label>
          <input
            type="text"
            value={availableRoomsInput}
            onChange={handleAvailableRoomsChange}
            className={`w-full px-3 py-2 border ${roomsError ? 'border-red-500 dark:border-red-500' : 'border-gray-300 dark:border-gray-600'} rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100`}
            placeholder="Enter number of available rooms"
            required
          />
          {roomsError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{roomsError}</p>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <button
            type="button"
            onClick={handleCheckAvailability}
            disabled={loading || !selectedRoomType || !selectedDate}
            className="px-4 py-2 text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-900/30 hover:bg-teal-100 dark:hover:bg-teal-900/50 rounded-md transition-colors disabled:opacity-50"
          >
            Check Availability
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-teal-600 dark:bg-teal-500 text-white rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Availability'}
          </button>
        </div>
      </form>
    </div>
  );
} 
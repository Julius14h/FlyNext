import Image from 'next/image';
import { StarIcon } from '@heroicons/react/24/solid';

interface Hotel {
  id: number;
  name: string;
  logo: string;
  address: string;
  location: string;
  starRating: number;
  images: string[];
  ownerId: number;
  city?: {
    name: string;
    country: string;
  };
}

interface HotelCardProps {
  hotel: Hotel;
  onEdit: () => void;
  onDelete: () => void;
}

export default function HotelCard({ hotel, onEdit, onDelete }: HotelCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative h-48">
        {hotel.images && hotel.images.length > 0 ? (
          <div className="relative h-full">
            <div className="overflow-x-auto h-full">
              <div className="flex h-full">
                {hotel.images.map((image, index) => (
                  <div key={index} className="flex-none w-full h-full">
                    <Image
                      src={image}
                      alt={`${hotel.name} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <Image
            src="/placeholder-hotel.jpg"
            alt={hotel.name}
            fill
            className="object-cover"
          />
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xl font-semibold text-gray-800">{hotel.name}</h3>
          <div className="flex items-center">
            {[...Array(hotel.starRating)].map((_, i) => (
              <StarIcon key={i} className="h-5 w-5 text-yellow-400" />
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 text-sm">{hotel.address}</p>
          <p className="text-gray-600 text-sm">{hotel.city ? `${hotel.city.name}, ${hotel.city.country}` : ''}</p>
        </div>
        
        <div className="flex justify-end space-x-2">
          <button
            onClick={onEdit}
            className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={onDelete}
            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
} 
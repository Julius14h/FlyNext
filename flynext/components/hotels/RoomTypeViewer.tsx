import { useState } from 'react';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { RoomType } from '@/types/hotel';

interface RoomTypeViewerProps {
  roomType: RoomType;
  onClose: () => void;
}

export default function RoomTypeViewer({ roomType, onClose }: RoomTypeViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Convert amenities string to array if needed
  const amenitiesArray = roomType.amenities ? 
    (typeof roomType.amenities === 'string' ? 
      roomType.amenities.split(',').map(item => item.trim()).filter(Boolean) : 
      [roomType.amenities]) : 
    [];
  
  // Handle navigation between images
  const handlePreviousImage = () => {
    if (roomType.images && roomType.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === 0 ? roomType.images!.length - 1 : prevIndex - 1
      );
    }
  };
  
  const handleNextImage = () => {
    if (roomType.images && roomType.images.length > 0) {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === roomType.images!.length - 1 ? 0 : prevIndex + 1
      );
    }
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto transition-colors duration-300">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{roomType.name}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              {roomType.images && roomType.images.length > 0 ? (
                <>
                  <div className="relative aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden">
                    <img
                      src={roomType.images[currentImageIndex]}
                      alt={`${roomType.name} - Image ${currentImageIndex + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {roomType.images.length > 1 && (
                      <>
                        <button
                          onClick={handlePreviousImage}
                          className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 rounded-full p-1 hover:bg-opacity-100 dark:hover:bg-opacity-100 transition-colors"
                        >
                          <ChevronLeftIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                        </button>
                        <button
                          onClick={handleNextImage}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white dark:bg-gray-800 bg-opacity-70 dark:bg-opacity-70 rounded-full p-1 hover:bg-opacity-100 dark:hover:bg-opacity-100 transition-colors"
                        >
                          <ChevronRightIcon className="h-6 w-6 text-gray-800 dark:text-gray-200" />
                        </button>
                      </>
                    )}
                  </div>
                  
                  {roomType.images.length > 1 && (
                    <div className="flex space-x-2 overflow-x-auto pb-2">
                      {roomType.images.map((image, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`relative w-20 h-20 flex-shrink-0 rounded-md overflow-hidden border-2 transition-colors ${
                            index === currentImageIndex 
                              ? 'border-teal-500 dark:border-teal-400' 
                              : 'border-transparent hover:border-gray-300 dark:hover:border-gray-600'
                          }`}
                        >
                          <img
                            src={image}
                            alt={`Thumbnail ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                  <p className="text-gray-400 dark:text-gray-500">No images available</p>
                </div>
              )}
            </div>
            
            {/* Room Details */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Price</h3>
                <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                  ${roomType.pricePerNight} 
                  <span className="text-sm font-normal text-gray-500 dark:text-gray-400">per night</span>
                </p>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">Amenities</h3>
                {amenitiesArray.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {amenitiesArray.map((amenity, index) => (
                      <span 
                        key={index} 
                        className="bg-teal-100 dark:bg-teal-900 text-teal-800 dark:text-teal-200 px-3 py-1 rounded-full text-sm"
                      >
                        {amenity}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 dark:text-gray-400">No amenities listed</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
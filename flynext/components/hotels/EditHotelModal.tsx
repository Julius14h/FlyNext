import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface Hotel {
  id: number;
  name: string;
  logo: string;
  address: string;
  starRating: number;
  images: string[];
  ownerId: number;
  latitude: number | null;
  longitude: number | null;
  amenities: string[];
  city?: {
    id: number;
    name: string;
    country: string;
  };
  cityName?: string;
  country?: string;
  location?: string;
}

interface EditHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotel: Hotel;
  onHotelUpdated: (hotel: Hotel) => void;
}

interface City {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
}

export default function EditHotelModal({ isOpen, onClose, hotel, onHotelUpdated }: EditHotelModalProps) {
  const router = useRouter();
  const getAmenitiesArray = (amenities: string | string[]): string[] => {
    if (Array.isArray(amenities)) return amenities;
    return amenities.split(',').map((item: string) => item.trim()).filter((item: string) => Boolean(item));
  };

  const getAmenitiesString = (amenities: string[]): string => {
    return amenities.join(',');
  };

  const [formData, setFormData] = useState<Hotel>({
    ...hotel,
    amenities: getAmenitiesArray(hotel.amenities)
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [newAmenity, setNewAmenity] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form data when modal opens
      setFormData({
        ...hotel,
        amenities: getAmenitiesArray(hotel.amenities)
      });
      setError(null);
    }
  }, [isOpen, hotel]);

  // Load cities when the modal opens
  useEffect(() => {
    if (isOpen) {
      loadCities();
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter cities based on input
  useEffect(() => {
    if (!formData.location) {
      setFilteredCities([]);
      setIsDropdownOpen(false);
      return;
    }

    const searchTerm = formData.location.toLowerCase().trim();
    const filtered = allCities.filter(city => {
      const name = city.name.toLowerCase();
      const cityName = city.city.toLowerCase();
      return name.includes(searchTerm) || cityName.includes(searchTerm);
    });

    setFilteredCities(filtered);
    setIsDropdownOpen(filtered.length > 0);
  }, [formData.location, allCities]);

  const loadCities = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return;

      const response = await fetch('/api/cities', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Normalize cities data
        const normalizedCities = Array.isArray(data) ? data.map(city => ({
          id: city.id || '',
          name: city.name || city.city || '',
          city: city.city || city.name || '',
          country: city.country || '',
          latitude: city.latitude || '',
          longitude: city.longitude || ''
        })) : [];
        
        setAllCities(normalizedCities);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const handleCitySelect = (city: City) => {
    setSelectedCity(city);
    setFormData(prev => ({
      ...prev,
      cityName: city.name,
      country: city.country
    }));
    setIsDropdownOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAmenitiesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const amenities = e.target.value.split(',').map((item: string) => item.trim()).filter((item: string) => Boolean(item));
    setFormData(prev => ({ ...prev, amenities }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedHotel: Hotel = {
      ...formData,
      amenities: formData.amenities
    };
    onHotelUpdated(updatedHotel);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    const imageUrls: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to upload image');
        }

        const data = await response.json();
        imageUrls.push(data.url);
      } catch (error) {
        console.error('Error uploading image:', error);
        setError('Failed to upload one or more images. Please try again.');
      }
    }

    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...imageUrls],
    }));
  };

  const handleRemoveImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const handleAddAmenity = () => {
    if (newAmenity.trim()) {
      setFormData(prev => ({
        ...prev,
        amenities: [...prev.amenities, newAmenity.trim()]
      }));
      setNewAmenity('');
    }
  };

  const handleRemoveAmenity = (index: number) => {
    setFormData(prev => ({
      ...prev,
      amenities: getAmenitiesArray(prev.amenities).filter((_, i) => i !== index)
    }));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      handleAddAmenity();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Edit Hotel</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={handleInputChange}
              name="name"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              type="text"
              value={formData.logo}
              onChange={handleInputChange}
              name="logo"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={handleInputChange}
              name="address"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.cityName}
                onChange={handleInputChange}
                name="cityName"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Search for a city"
                onFocus={() => setIsDropdownOpen(true)}
              />
              {isDropdownOpen && filteredCities.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
                >
                  {filteredCities.map((city) => (
                    <div
                      key={city.id}
                      className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleCitySelect(city)}
                    >
                      {city.name}, {city.country}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country
            </label>
            <input
              type="text"
              value={formData.country}
              onChange={handleInputChange}
              name="country"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Star Rating
            </label>
            <select
              value={formData.starRating}
              onChange={handleInputChange}
              name="starRating"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              {[1, 2, 3, 4, 5].map(rating => (
                <option key={rating} value={rating}>
                  {rating} {rating === 1 ? 'Star' : 'Stars'}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hotel Images
            </label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageUpload}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
            {formData.images.length > 0 && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {formData.images.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Hotel image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-md"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveImage(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label htmlFor="amenities" className="block text-sm font-medium text-gray-700">
              Amenities
            </label>
            <div className="mt-1">
              <div className="flex flex-wrap gap-2 mb-2">
                {getAmenitiesArray(formData.amenities).map((amenity: string, index: number) => (
                  <div key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-md flex items-center">
                    <span>{amenity}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="ml-1 text-blue-600 hover:text-blue-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  id="amenities"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="shadow-sm focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md"
                  placeholder="Add an amenity (press Enter or comma to add)"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="ml-2 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Press Enter or comma to add an amenity
            </p>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { XMarkIcon } from '@heroicons/react/24/outline';
import AddressInput from '@/components/AddressInput';

interface CreateHotelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onHotelCreated: (hotel: any) => void;
}

interface City {
  id: string;
  name: string;
  city: string;
  country: string;
  latitude: string;
  longitude: string;
}

interface LocationData {
  formattedAddress: string;
  city: string;
  country: string;
  coordinates: {
    lat: number;
    lng: number;
  };
}

interface AddressInputProps {
  onLocationSelect: (location: LocationData) => void;
  placeholder?: string;
  className?: string;
}

interface HotelFormData {
  name: string;
  logo: string;
  address: string;
  location: string;
  starRating: number;
  images: string[];
  amenities: string[];
  latitude: number | null;
  longitude: number | null;
}

interface HotelSubmitData {
  name: string;
  logo: string;
  location: string;
  starRating: number;
  images: string[];
  amenities: string[];
  latitude: number | null;
  longitude: number | null;
}

export default function CreateHotelModal({ isOpen, onClose, onHotelCreated }: CreateHotelModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    address: '',
    location: '',
    starRating: 3,
    images: [] as string[],
    amenities: [] as string[],
    latitude: null as number | null,
    longitude: null as number | null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [filteredCities, setFilteredCities] = useState<City[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [newAmenity, setNewAmenity] = useState('');
  const [locationData, setLocationData] = useState<LocationData | null>(null);

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
        console.log('Raw city data:', data);
        
        // Normalize cities data
        const normalizedCities = Array.isArray(data) ? data.map(city => ({
          id: city.id || '',
          name: city.name || city.city || '',
          city: city.city || city.name || '',
          country: city.country || '',
          latitude: city.latitude || '',
          longitude: city.longitude || '',
        })) : [];
        
        console.log('Normalized cities:', normalizedCities);
        setAllCities(normalizedCities);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
    }
  };

  const handleCitySelect = (city: City) => {
    setFormData(prev => ({ 
      ...prev, 
      location: `${city.name}, ${city.country}`,
      latitude: parseFloat(city.latitude) || null,
      longitude: parseFloat(city.longitude) || null
    }));
    setSelectedCity(city);
    setIsDropdownOpen(false);
  };

  const handleLocationSelect = (data: LocationData) => {
    console.log('Selected location:', data);
    setLocationData(data);
    
    // Update form data with the location information
    setFormData(prev => ({
      ...prev,
      address: data.formattedAddress,
      location: `${data.city}, ${data.country}`,
      latitude: data.coordinates.lat,
      longitude: data.coordinates.lng
    }));
    
    // Try to find a matching city in our database
    const matchingCity = allCities.find(city => 
      city.city.toLowerCase() === data.city.toLowerCase() && 
      city.country.toLowerCase() === data.country.toLowerCase()
    );
    
    if (matchingCity) {
      setSelectedCity(matchingCity);
    } else {
      // If no exact match, try to find a partial match
      const partialMatch = allCities.find(city => 
        city.city.toLowerCase().includes(data.city.toLowerCase()) || 
        data.city.toLowerCase().includes(city.city.toLowerCase())
      );
      
      if (partialMatch) {
        setSelectedCity(partialMatch);
      } else {
        setSelectedCity(null);
      }
    }
  };

  const getCityId = async (name: string, country: string) => {
    const token = localStorage.getItem('accessToken');
    const response = await fetch('/api/cities/find', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ name, country }),
    });

    if (!response.ok) {
      throw new Error('Failed to find city');
    }

    const { id } = await response.json();
    return id;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Extract city name and country from the location string
      const locationParts = formData.location.split(',');
      const cityName = locationParts[0].trim();
      const country = locationParts[1]?.trim() || '';
      
      // Get the city ID
      let cityId;
      try {
        cityId = await getCityId(cityName, country);
        console.log('Found city ID:', cityId);
      } catch (error) {
        console.error('Error getting city ID:', error);
        setError('Failed to find the selected city. Please try again.');
        setLoading(false);
        return;
      }

      // Get the current user ID
      const userResponse = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (!userResponse.ok) {
        throw new Error('Failed to get user information');
      }
      
      const userData = await userResponse.json();
      const ownerId = userData.id;

      // Create a copy of formData without the location field
      const { location, ...submitData } = formData;

      // Prepare the data to submit
      const hotelData = {
        ...submitData,
        cityId,
        ownerId,
        amenities: Array.isArray(submitData.amenities) ? submitData.amenities.join(',') : '',
      };

      console.log('Submitting hotel data:', hotelData);

      const response = await fetch('/api/hotels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(hotelData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.error || 'Failed to create hotel');
      }

      const newHotel = await response.json();
      console.log('Created hotel:', newHotel);
      
      onHotelCreated({
        ...newHotel,
        location: formData.location,
        latitude: newHotel.latitude || null,
        longitude: newHotel.longitude || null,
        city: {
          id: newHotel.city?.id || 0,
          name: cityName,
          country: country
        }
      });
      onClose();
    } catch (error) {
      console.error('Error creating hotel:', error);
      setError('Failed to create hotel. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const token = localStorage.getItem('accessToken');
    if (!token) {
      router.push('/login');
      return;
    }

    setLoading(true);
    const imageUrls: string[] = [];
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

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
      }

      // Update form data with all uploaded images
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls],
      }));
    } catch (error) {
      console.error('Error uploading image:', error);
      setError('Failed to upload one or more images. Please try again.');
    } finally {
      setLoading(false);
    }
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
      amenities: prev.amenities.filter((_, i) => i !== index)
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
    <div className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isOpen ? '' : 'hidden'}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto transition-colors duration-300">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Create New Hotel</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Hotel Name *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>

            <div>
              <label htmlFor="logo" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Logo URL
              </label>
              <input
                type="text"
                id="logo"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://example.com/logo.png"
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Enter a URL for your hotel logo</p>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Hotel Address *
              </label>
              <AddressInput 
                onLocationSelect={handleLocationSelect}
                placeholder="Enter hotel address"
              />
            </div>

            <div>
              <label htmlFor="starRating" className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Star Rating *
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setFormData({ ...formData, starRating: rating })}
                    className={`p-2 rounded transition-colors ${
                      formData.starRating === rating
                        ? 'bg-teal-500 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Amenities
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {formData.amenities.map((amenity, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    <span className="text-gray-700 dark:text-gray-300">{amenity}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(index)}
                      className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      &times;
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex">
                <input
                  type="text"
                  value={newAmenity}
                  onChange={(e) => setNewAmenity(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Add an amenity"
                  className="flex-1 p-2 border border-gray-300 dark:border-gray-600 rounded-l focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="bg-teal-500 text-white px-4 py-2 rounded-r hover:bg-teal-600 transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-200 mb-1">
                Hotel Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageUpload}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded focus:ring-teal-500 focus:border-teal-500 dark:bg-gray-700 dark:text-white"
              />
              {formData.images.length > 0 && (
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {formData.images.map((image, index) => (
                    <div key={index} className="relative">
                      <img
                        src={image}
                        alt={`Hotel image ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setFormData({
                            ...formData,
                            images: formData.images.filter((_, i) => i !== index),
                          });
                        }}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center"
                      >
                        &times;
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-teal-500 text-white rounded hover:bg-teal-600 disabled:bg-teal-300 dark:disabled:bg-teal-700 transition-colors"
              >
                {loading ? 'Creating...' : 'Create Hotel'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 
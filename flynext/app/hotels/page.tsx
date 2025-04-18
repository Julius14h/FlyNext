"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { BuildingOfficeIcon, PlusIcon, MagnifyingGlassIcon, ListBulletIcon, HomeIcon } from '@heroicons/react/24/outline';
import dynamic from 'next/dynamic'
 
const CreateHotelModal = dynamic(
  () => import('@/components/hotels/CreateHotelModal'),
  { ssr: false }
)
const HotelDetails = dynamic(
  () => import('@/components/hotels/HotelDetails'),
  { ssr: false }
)
const HotelSearch = dynamic(
  () => import('@/components/hotels/HotelSearch'),
  { ssr: false }
)
const HotelListing = dynamic(
  () => import('@/components/hotels/HotelListing'),
  { ssr: false }
)
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

export default function HotelsPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchFilters, setSearchFilters] = useState({
    checkIn: '',
    checkOut: '',
    city: '',
    name: '',
    minRating: 0,
    minPrice: 0,
    maxPrice: 10000,
  });
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [hotelDetails, setHotelDetails] = useState<Record<number, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
  const [selectedHotelId, setSelectedHotelId] = useState<number | null>(null);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchHotels();
    checkUserRole();
  }, []);

  useEffect(() => {
    if (searchFilters.name.trim() === '') {
      setFilteredHotels(hotels);
    } else {
      const filtered = hotels.filter(hotel => 
        hotel.name.toLowerCase().includes(searchFilters.name.toLowerCase()) ||
        (typeof hotel.city === 'string' 
          ? hotel.city.toLowerCase().includes(searchFilters.name.toLowerCase())
          : `${hotel.city.name}, ${hotel.city.country}`.toLowerCase().includes(searchFilters.name.toLowerCase()))
      );
      setFilteredHotels(filtered);
    }
  }, [searchFilters.name, hotels]);

  // Fetch details for hotels that don't have them yet
  useEffect(() => {
    if (hotels.length > 0) {
      hotels.forEach(hotel => {
        if (!hotelDetails[hotel.id] && !loadingDetails[hotel.id]) {
          fetchHotelDetails(hotel.id);
        }
      });
    }
  }, [hotels, hotelDetails, loadingDetails]);

  // Update total pages when filtered hotels change
  useEffect(() => {
    const total = Math.ceil(filteredHotels.length / itemsPerPage);
    setTotalPages(total);
    // Reset to first page if current page is out of bounds
    if (currentPage > total && total > 0) {
      setCurrentPage(1);
    }
  }, [filteredHotels, itemsPerPage]);

  const fetchHotelDetails = async (hotelId: number) => {
    if (loadingDetails[hotelId]) return;
    
    setLoadingDetails(prev => ({ ...prev, [hotelId]: true }));
    
    try {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/hotels/${hotelId}`, {
        headers,
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch details for hotel ${hotelId}`);
      }

      const data = await response.json();
      // Ensure we're storing a string for the city property
      if (data.city && typeof data.city === 'object') {
        data.city = data.city.name || '';
      }
      setHotelDetails(prev => ({ ...prev, [hotelId]: data }));
    } catch (error) {
      console.error(`Error fetching details for hotel ${hotelId}:`, error);
    } finally {
      setLoadingDetails(prev => ({ ...prev, [hotelId]: false }));
    }
  };

  const checkUserRole = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setIsOwner(false);
        return;
      }

      const response = await fetch('/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserId(data.id);
        setIsOwner(data.role === 'OWNER');
      } else {
        setIsOwner(false);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setIsOwner(false);
    }
  };

  const fetchHotels = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let url = '/api/hotels';
      
      // If user is logged in and is an owner, fetch their hotels
      if (token && isOwner && userId) {
        url = `/api/protected/users/${userId}/hotels`;
      }

      const response = await fetch(url, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }

      const data = await response.json();
      
      // Handle different response formats
      const hotelsData = data.hotels || data || [];
      
      // Process the hotels data to ensure proper formatting
      const processedHotels = hotelsData.map((hotel: any) => {
        // Ensure city is a string, not an object
        const city = typeof hotel.city === 'object' ? hotel.city.name || '' : hotel.city || '';
        
        // Process images to ensure they're in the correct format
        let images: string[] = [];
        if (Array.isArray(hotel.images)) {
          // If images is already an array, use it directly
          images = hotel.images;
        } else if (hotel.images && typeof hotel.images === 'object') {
          // If images is an object with imageUrl property (from Prisma)
          images = hotel.images.map((img: any) => img.imageUrl || '');
        }
        
        return {
          ...hotel,
          city,
          images
        };
      });
      
      setHotels(processedHotels);
      setFilteredHotels(processedHotels);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError('Failed to fetch hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleHotelCreated = () => {
    setShowCreateModal(false);
    fetchHotels();
  };

  const handleViewHotel = (hotelId: number) => {
    setSelectedHotelId(hotelId);
  };

  const handleCloseHotelDetails = () => {
    setSelectedHotelId(null);
  };

  const handleManageHotel = (hotelId: number) => {
    router.push(`/hotels/manage/${hotelId}`);
  };

  const handleSearch = async (filters: any) => {
    setSearchFilters(filters);
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page on new search

    try {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      let url = '/api/hotels/search';
      
      // Add query parameters for filtering
      const queryParams = new URLSearchParams();
      if (filters.city) queryParams.append('city', filters.city);
      if (filters.name) queryParams.append('name', filters.name);
      if (filters.minRating) queryParams.append('minRating', filters.minRating.toString());
      if (filters.minPrice) queryParams.append('minPrice', filters.minPrice.toString());
      if (filters.maxPrice) queryParams.append('maxPrice', filters.maxPrice.toString());
      if (filters.checkIn) queryParams.append('checkIn', filters.checkIn);
      if (filters.checkOut) queryParams.append('checkOut', filters.checkOut);

      url = `${url}?${queryParams.toString()}`;

      const response = await fetch(url, {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }

      const data = await response.json();
      setHotels(data);
      setFilteredHotels(data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError('Failed to fetch hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewAllHotels = async () => {
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page
    setSearchFilters({
      checkIn: '',
      checkOut: '',
      city: '',
      name: '',
      minRating: 0,
      minPrice: 0,
      maxPrice: 10000
    });

    try {
      const token = localStorage.getItem('accessToken');
      const headers: HeadersInit = {};
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/hotels/search', {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch hotels');
      }

      const data = await response.json();
      setHotels(data);
      setFilteredHotels(data);
    } catch (error) {
      console.error('Error fetching hotels:', error);
      setError('Failed to fetch hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewMyHotels = async () => {
    if (!userId) return;
    
    setLoading(true);
    setError(null);
    setCurrentPage(1); // Reset to first page
    setSearchFilters({
      checkIn: '',
      checkOut: '',
      city: '',
      name: '',
      minRating: 0,
      minPrice: 0,
      maxPrice: 10000
    });

    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/protected/users/${userId}/hotels`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch your hotels');
      }

      const data = await response.json();
      
      // Process the hotels data to ensure proper formatting
      const processedHotels = data.map((hotel: any) => {
        // Ensure city is a string, not an object
        const city = typeof hotel.city === 'object' ? hotel.city.name || '' : hotel.city || '';
        
        // Process images to ensure they're in the correct format
        let images: string[] = [];
        if (Array.isArray(hotel.images)) {
          // If images is already an array, use it directly
          images = hotel.images;
        } else if (hotel.images && typeof hotel.images === 'object') {
          // If images is an object with imageUrl property (from Prisma)
          images = hotel.images.map((img: any) => img.imageUrl || '');
        }
        
        return {
          ...hotel,
          city,
          images
        };
      });
      
      setHotels(processedHotels);
      setFilteredHotels(processedHotels);
    } catch (error) {
      console.error('Error fetching your hotels:', error);
      setError('Failed to fetch your hotels. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Use useEffect to handle window.scrollTo on the client side only
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newItemsPerPage = parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  // Calculate paginated hotels
  const getPaginatedHotels = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredHotels.slice(startIndex, endIndex);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading hotels...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gray-50 dark:bg-gray-900">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center">
          <BuildingOfficeIcon className="h-8 w-8 mr-3 text-teal-600 dark:text-teal-400" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hotels</h1>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleViewAllHotels}
            className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors dark:bg-gray-700 dark:hover:bg-gray-600"
          >
            <ListBulletIcon className="h-5 w-5 mr-2" />
            View All Hotels
          </button>
          {isOwner && (
            <button
              onClick={handleViewMyHotels}
              className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors dark:bg-teal-500 dark:hover:bg-teal-600"
            >
              <HomeIcon className="h-5 w-5 mr-2" />
              My Hotels
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors dark:bg-teal-500 dark:hover:bg-teal-600"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            Add Hotel
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <HotelSearch onSearch={handleSearch} />

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
        </div>
      ) : filteredHotels.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No hotels found</h3>
          <p className="text-gray-500 mb-4">
            {searchFilters.name || searchFilters.city ? 'Try adjusting your search terms' : 'There are no hotels available at the moment'}
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {getPaginatedHotels().map((hotel) => (
              <HotelListing 
                key={hotel.id} 
                hotel={hotel} 
                onViewDetails={handleViewHotel}
                isOwner={isOwner && userId === hotel.ownerId}
                onManage={handleManageHotel}
              />
            ))}
          </div>
          
          {/* Pagination Controls */}
          <div className="mt-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center mb-4 sm:mb-0">
              <label htmlFor="itemsPerPage" className="mr-2 text-sm text-gray-600">
                Show:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={handleItemsPerPageChange}
                className="border border-gray-300 rounded px-2 py-1 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
              <span className="ml-2 text-sm text-gray-600">
                of {filteredHotels.length} hotels
              </span>
            </div>
            
            <div className="flex items-center">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded transition-colors duration-300 ${
                  currentPage === 1
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800'
                }`}
              >
                Previous
              </button>
              
              <div className="mx-2 flex">
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages around current page
                    return (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    if (index > 0 && page - array[index - 1] > 1) {
                      return (
                        <React.Fragment key={`ellipsis-${page}`}>
                          <span className="px-2 py-1 text-gray-500 dark:text-gray-400">...</span>
                          <button
                            onClick={() => handlePageChange(page)}
                            className={`px-3 py-1 rounded transition-colors duration-300 ${
                              currentPage === page
                                ? 'bg-teal-600 dark:bg-teal-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-1 rounded transition-colors duration-300 ${
                          currentPage === page
                            ? 'bg-teal-600 dark:bg-teal-500 text-white'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                        }`}
                      >
                        {page}
                      </button>
                    );
                  })}
              </div>
              
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded transition-colors duration-300 ${
                  currentPage === totalPages
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    : 'bg-teal-100 dark:bg-teal-900 text-teal-600 dark:text-teal-300 hover:bg-teal-200 dark:hover:bg-teal-800'
                }`}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {showCreateModal && (
        <CreateHotelModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onHotelCreated={handleHotelCreated}
        />
      )}

      {selectedHotelId && (
        <HotelDetails
          hotelId={selectedHotelId}
          onClose={handleCloseHotelDetails}
        />
      )}
    </div>
  );
} 
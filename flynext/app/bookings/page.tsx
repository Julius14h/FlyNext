"use client";
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PaperAirplaneIcon, BuildingOfficeIcon, DocumentTextIcon, XCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/components/ThemeContext';

interface Flight {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  origin: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  destination: {
    code: string;
    name: string;
    city: string;
    country: string;
  };
  airline: {
    code: string;
    name: string;
  };
  price: number;
  currency: string;
  status: string;
  bookingReference: string;
  details?: {
    flights?: any[];
    error?: boolean;
    message?: string;
    bookingReference?: string;
  };
}

interface BookingItem {
  id: string;
  type: 'FLIGHT' | 'HOTEL';
  referenceId?: string;
  hotelId?: number;
  roomTypeId?: number;
  startDate?: string;
  endDate?: string;
  price?: number;
  status?: string;
  details?: any;
  hotel?: {
    id: number;
    name: string;
    city: {
      id: number;
      name: string;
    };
  };
  roomType?: {
    id: number;
    name: string;
    pricePerNight: number;
  };
}

interface Booking {
  id: string;
  userId: string;
  status: string;
  totalPrice?: number;
  paymentDetails?: any;
  createdAt: string;
  updatedAt: string;
  bookingItems: BookingItem[];
  flights?: Flight[];
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatPrice = (price: number, currency: string = 'CAD') => {
  return new Intl.NumberFormat('en-CA', {
    style: 'currency',
    currency: currency
  }).format(price);
};

// Flight details component
const FlightDetails = ({ flight }: { flight: any }) => {
  if (!flight) return <div className="text-sm text-gray-500 dark:text-gray-400">Flight details not available</div>;
  
  // Debug the flight data structure
  console.log('FlightDetails received:', flight);
  
  // Check if we have the nested flights array in details
  if (flight.details?.flights && flight.details.flights.length > 0) {
    const flightDetails = flight.details.flights[0];
    return (
      <>
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {flightDetails.airline?.code || 'N/A'} {flightDetails.flightNumber || 'N/A'}
          </div>
          <div className="mx-2 text-gray-500 dark:text-gray-400">•</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {flightDetails.departureTime ? formatDate(flightDetails.departureTime) : 'N/A'} - {flightDetails.arrivalTime ? formatDate(flightDetails.arrivalTime) : 'N/A'}
          </div>
        </div>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {flightDetails.origin?.city || 'N/A'} ({flightDetails.origin?.code || 'N/A'}) → {flightDetails.destination?.city || 'N/A'} ({flightDetails.destination?.code || 'N/A'})
        </div>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-800 dark:text-gray-200">Duration:</span> {flightDetails.duration ? `${Math.floor(flightDetails.duration / 60)}h ${flightDetails.duration % 60}m` : 'N/A'}
        </div>
      </>
    );
  }
  
  // Check if we have the nested flights array directly
  if (flight.flights && flight.flights.length > 0) {
    const flightDetails = flight.flights[0];
    return (
      <>
        <div className="flex items-center">
          <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
            {flightDetails.airline?.code || 'N/A'} {flightDetails.flightNumber || 'N/A'}
          </div>
          <div className="mx-2 text-gray-500 dark:text-gray-400">•</div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {flightDetails.departureTime ? formatDate(flightDetails.departureTime) : 'N/A'} - {flightDetails.arrivalTime ? formatDate(flightDetails.arrivalTime) : 'N/A'}
          </div>
        </div>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          {flightDetails.origin?.city || 'N/A'} ({flightDetails.origin?.code || 'N/A'}) → {flightDetails.destination?.city || 'N/A'} ({flightDetails.destination?.code || 'N/A'})
        </div>
        <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-medium text-gray-800 dark:text-gray-200">Duration:</span> {flightDetails.duration ? `${Math.floor(flightDetails.duration / 60)}h ${flightDetails.duration % 60}m` : 'N/A'}
        </div>
      </>
    );
  }
  
  // Fallback for direct flight details
  return (
    <>
      <div className="flex items-center">
        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
          {flight.airline?.code || 'N/A'} {flight.flightNumber || 'N/A'}
        </div>
        <div className="mx-2 text-gray-500 dark:text-gray-400">•</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {flight.departureTime ? formatDate(flight.departureTime) : 'N/A'} - {flight.arrivalTime ? formatDate(flight.arrivalTime) : 'N/A'}
        </div>
      </div>
      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        {flight.origin?.city || 'N/A'} ({flight.origin?.code || 'N/A'}) → {flight.destination?.city || 'N/A'} ({flight.destination?.code || 'N/A'})
      </div>
      <div className="mt-1 text-sm text-gray-500 dark:text-gray-400">
        <span className="font-medium text-gray-800 dark:text-gray-200">Duration:</span> {flight.duration ? `${Math.floor(flight.duration / 60)}h ${flight.duration % 60}m` : 'N/A'}
      </div>
    </>
  );
};

// Hotel details component
const HotelDetails = ({ bookingItem }: { bookingItem: BookingItem }) => {
  if (!bookingItem) return <div className="text-sm text-gray-500 dark:text-gray-400">Hotel details not available</div>;
  
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-2">
        <BuildingOfficeIcon className="h-5 w-5 text-teal-600 dark:text-teal-400 mr-2" />
        <h3 className="text-base font-medium text-gray-900 dark:text-white">
          {bookingItem.hotel?.name || 'Hotel Name Not Available'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <div className="ml-2">
            <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
            <p className="text-sm font-medium text-gray-900 dark:text-white">{bookingItem.hotel?.city?.name || 'Location Not Available'}</p>
          </div>
        </div>
        
        {bookingItem.roomType && (
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Room Type</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{bookingItem.roomType.name}</p>
            </div>
          </div>
        )}
        
        {bookingItem.startDate && (
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Check-in</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(bookingItem.startDate)}</p>
            </div>
          </div>
        )}
        
        {bookingItem.endDate && (
          <div className="flex items-start">
            <div className="flex-shrink-0 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-2">
              <p className="text-sm text-gray-500 dark:text-gray-400">Check-out</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{formatDate(bookingItem.endDate)}</p>
            </div>
          </div>
        )}
      </div>
      
      {bookingItem.price && (
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Price</span>
          <span className="text-sm font-bold text-teal-600 dark:text-teal-400">{formatPrice(bookingItem.price)}</span>
        </div>
      )}
    </div>
  );
};

export default function BookingsPage() {
  const router = useRouter();
  const { theme } = useTheme();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'upcoming' | 'past'>('all');
  const [verificationDetails, setVerificationDetails] = useState<any>(null);
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showCancelConfirmModal, setShowCancelConfirmModal] = useState(false);
  const [showCancelSuccessModal, setShowCancelSuccessModal] = useState(false);
  const [bookingToCancel, setBookingToCancel] = useState<{id: string, reference: string, lastName: string} | null>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Decode the JWT token to get the user ID
      const tokenPayload = JSON.parse(atob(token.split('.')[1]));
      const userId = tokenPayload.user;

      const response = await fetch(`/api/bookings/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }

      const data = await response.json();
      
      // Ensure data is always an array
      const bookingsArray = Array.isArray(data) ? data : [];
      
      // Debug the flight data structure
      console.log('Bookings data:', bookingsArray);
      if (bookingsArray.length > 0 && bookingsArray[0].flights) {
        console.log('First booking flights:', bookingsArray[0].flights);
        if (bookingsArray[0].flights[0]?.details?.flights) {
          console.log('First booking flight details:', bookingsArray[0].flights[0].details.flights);
        }
      }
      
      setBookings(bookingsArray);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      setError('Failed to fetch bookings. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string, bookingReference: string, lastName: string) => {
    // Store the booking details and show confirmation modal
    setBookingToCancel({ id: bookingId, reference: bookingReference, lastName: lastName });
    setShowCancelConfirmModal(true);
  };

  const confirmCancelBooking = async () => {
    if (!bookingToCancel) return;
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      console.log('Attempting to cancel booking:', bookingToCancel.id);
      
      // Delete the booking from our database (which will also cancel it in the AFS system)
      const response = await fetch(`/api/bookings/${bookingToCancel.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Cancel response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = 'Failed to cancel booking';
        
        try {
          // Check if the response has content before trying to parse it
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const errorData = await response.json();
            console.error('Cancel error data:', errorData);
            
            if (errorData && errorData.error) {
              errorMessage = `Failed to cancel booking: ${errorData.error}`;
            }
          }
        } catch (parseError) {
          console.error('Error parsing error response:', parseError);
        }
        
        // Add status text if available
        if (response.statusText) {
          errorMessage += ` (${response.statusText})`;
        }
        
        throw new Error(errorMessage);
      }

      // Update the booking status in the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingToCancel.id 
            ? { ...booking, status: 'CANCELLED' } 
            : booking
        )
      );

      // Show success modal
      setShowCancelConfirmModal(false);
      setShowCancelSuccessModal(true);
    } catch (error) {
      console.error('Error canceling booking:', error);
      setError(error instanceof Error ? error.message : 'Failed to cancel booking. Please try again.');
      setShowCancelConfirmModal(false);
    }
  };

  const handleVerifyBooking = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}/verify`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to verify booking');
      }

      const data = await response.json();
      
      // Store verification details and show modal
      setVerificationDetails(data);
      setShowVerificationModal(true);
      
      // Update the booking status in the local state
      setBookings(prevBookings => 
        prevBookings.map(booking => 
          booking.id === bookingId 
            ? { ...booking, status: 'CONFIRMED' } 
            : booking
        )
      );
    } catch (error) {
      console.error('Error verifying booking:', error);
      setError('Failed to verify booking. Please try again.');
    }
  };

  const handleDownloadInvoice = async (bookingId: string) => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`/api/bookings/${bookingId}/invoice`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to download invoice');
      }

      // Create a blob from the PDF data
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice-${bookingId}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading invoice:', error);
      setError('Failed to download invoice. Please try again.');
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'CONFIRMED':
        return 'bg-green-100 text-green-800';
      case 'CANCELLED':
        return 'bg-red-100 text-red-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const now = new Date();
    
    // Check if any booking item has a start date in the future
    const hasUpcomingItems = booking.bookingItems.some(item => {
      if (item.startDate) {
        const startDate = new Date(item.startDate);
        return startDate > now;
      }
      return false;
    });
    
    // Check if all booking items have end dates in the past
    const hasPastItems = booking.bookingItems.every(item => {
      if (item.endDate) {
        const endDate = new Date(item.endDate);
        return endDate < now;
      }
      return false;
    });
    
    if (activeTab === 'upcoming') {
      return hasUpcomingItems;
    } else if (activeTab === 'past') {
      return hasPastItems;
    } else {
      return true; // 'all' tab
    }
  });

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-8">
          <DocumentTextIcon className="h-8 w-8 text-teal-600 dark:text-teal-500 mr-3 transition-colors duration-300" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">My Bookings</h1>
        </div>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-400 dark:border-red-800 p-4 mb-6 transition-colors duration-300">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400 dark:text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700 dark:text-red-400 transition-colors duration-300">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Verification Modal */}
        {showVerificationModal && verificationDetails && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 flex items-center justify-center z-50 p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-3xl w-full p-8 transition-colors duration-300">
              <div className="flex justify-between items-start">
                <h3 className="text-xl font-medium text-gray-900 dark:text-white transition-colors duration-300">Booking Verification</h3>
                <button 
                  onClick={() => setShowVerificationModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-6">
                {verificationDetails.booking_info && verificationDetails.booking_info.length > 0 ? (
                  <div className="space-y-6">
                    <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4 transition-colors duration-300">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <CheckCircleIcon className="h-6 w-6 text-green-400 dark:text-green-500" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-base font-medium text-green-800 dark:text-green-400 transition-colors duration-300">Booking Verified</h3>
                          <div className="mt-1 text-base text-green-700 dark:text-green-300 transition-colors duration-300">
                            <p>Your booking has been verified and is <span className="font-medium">CONFIRMED</span>.</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border-t border-gray-200 dark:border-gray-700 pt-6 transition-colors duration-300">
                      <h4 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">Booking Details</h4>
                      <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Booking Reference</dt>
                          <dd className="mt-1 text-base text-gray-900 dark:text-white transition-colors duration-300">{verificationDetails.booking_info[0].bookingReference}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Ticket Number</dt>
                          <dd className="mt-1 text-base text-gray-900 dark:text-white transition-colors duration-300">{verificationDetails.booking_info[0].ticketNumber}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Passenger</dt>
                          <dd className="mt-1 text-base text-gray-900 dark:text-white transition-colors duration-300">{verificationDetails.booking_info[0].firstName} {verificationDetails.booking_info[0].lastName}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 transition-colors duration-300">Status</dt>
                          <dd className="mt-1 text-base text-gray-900 dark:text-white transition-colors duration-300">{verificationDetails.booking_info[0].status}</dd>
                        </div>
                      </dl>
                    </div>
                    
                    {verificationDetails.booking_info[0].flights && verificationDetails.booking_info[0].flights.length > 0 && (
                      <div className="border-t border-gray-200 pt-6">
                        <h4 className="text-lg font-medium text-gray-900">Flight Details</h4>
                        {verificationDetails.booking_info[0].flights.map((flight: any, index: number) => (
                          <div key={index} className="mt-4 bg-gray-50 p-4 rounded-md">
                            <div className="flex items-center">
                              <div className="text-base font-medium text-gray-800">
                                {flight.airline.code} {flight.flightNumber}
                              </div>
                              <div className="mx-3 text-gray-500">•</div>
                              <div className="text-base text-gray-500">
                                {formatDate(flight.departureTime)} - {formatDate(flight.arrivalTime)}
                              </div>
                            </div>
                            <div className="mt-2 text-base text-gray-500">
                              {flight.origin.city} ({flight.origin.code}) → {flight.destination.city} ({flight.destination.code})
                            </div>
                            <div className="mt-2 text-base text-gray-500">
                              <span className="font-medium text-gray-800">Duration:</span> {Math.floor(flight.duration / 60)}h {flight.duration % 60}m
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-md p-4 transition-colors duration-300">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <XCircleIcon className="h-6 w-6 text-red-400 dark:text-red-500" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-base font-medium text-red-800 dark:text-red-400 transition-colors duration-300">Booking Not Found</h3>
                        <div className="mt-1 text-base text-red-700 dark:text-red-300 transition-colors duration-300">
                          <p>We couldn't find a booking with the provided details.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowVerificationModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Cancel Confirmation Modal */}
        {showCancelConfirmModal && bookingToCancel && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 flex items-center justify-center z-50 p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 transition-colors duration-300">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">Cancel Booking</h3>
                <button 
                  onClick={() => setShowCancelConfirmModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-4 transition-colors duration-300">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400 transition-colors duration-300">Are you sure you want to cancel this booking?</h3>
                      <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300 transition-colors duration-300">
                        <p>This action cannot be undone. Your booking with reference <span className="font-medium">{bookingToCancel.reference}</span> will be cancelled.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setShowCancelConfirmModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                >
                  No, keep booking
                </button>
                <button
                  onClick={confirmCancelBooking}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                >
                  Yes, cancel booking
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Cancel Success Modal */}
        {showCancelSuccessModal && bookingToCancel && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 dark:bg-gray-900 dark:bg-opacity-80 flex items-center justify-center z-50 p-4 transition-colors duration-300">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full p-6 transition-colors duration-300">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">Booking Cancelled</h3>
                <button 
                  onClick={() => setShowCancelSuccessModal(false)}
                  className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors duration-300"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="mt-4">
                <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 rounded-md p-4 transition-colors duration-300">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <CheckCircleIcon className="h-5 w-5 text-green-400 dark:text-green-500" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800 dark:text-green-400 transition-colors duration-300">Booking Cancelled Successfully</h3>
                      <div className="mt-2 text-sm text-green-700 dark:text-green-300 transition-colors duration-300">
                        <p>Your booking with reference <span className="font-medium">{bookingToCancel.reference}</span> has been cancelled.</p>
                        <p className="mt-1">A confirmation email has been sent to your registered email address.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setShowCancelSuccessModal(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        
        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6 transition-colors duration-300">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`${
                activeTab === 'all'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300`}
            >
              All Bookings
            </button>
            <button
              onClick={() => setActiveTab('upcoming')}
              className={`${
                activeTab === 'upcoming'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setActiveTab('past')}
              className={`${
                activeTab === 'past'
                  ? 'border-teal-500 text-teal-600 dark:text-teal-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-300`}
            >
              Past
            </button>
          </nav>
        </div>
        
        {isLoading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">Loading bookings...</div>
        ) : filteredBookings.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400 transition-colors duration-300">
            {activeTab === 'all' 
              ? 'You have no bookings yet.' 
              : activeTab === 'upcoming' 
                ? 'You have no upcoming bookings.' 
                : 'You have no past bookings.'}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden transition-colors duration-300 hover:shadow-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center transition-colors duration-300">
                  <div>
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
                      {booking.bookingItems.some(item => item.type === 'FLIGHT') ? (
                        `Booking Reference: ${booking.flights && booking.flights.length > 0 && booking.flights[0].details?.bookingReference 
                          ? booking.flights[0].details.bookingReference 
                          : booking.bookingItems.find(item => item.referenceId)?.referenceId || 'N/A'}`
                      ) : (
                        'Hotel Booking'
                      )}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
                      Booked on {formatDate(booking.createdAt)}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                      getStatusColor(booking.status)
                    } transition-colors duration-300`}>
                      {booking.status}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="space-y-6">
                    {booking.bookingItems.map((item, index) => (
                      <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-6 last:border-b-0 last:pb-0">
                        <div className="flex items-start">
                          <div className="bg-teal-100 dark:bg-teal-900/30 p-2 rounded-full mr-3">
                            {item.type === 'FLIGHT' ? (
                              <PaperAirplaneIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            ) : (
                              <BuildingOfficeIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-medium text-gray-900 dark:text-white transition-colors duration-300">
                              {item.type === 'FLIGHT' ? 'Flight' : 'Hotel'}
                            </h3>
                            {item.type === 'FLIGHT' ? (
                              <div className="mt-2">
                                {booking.flights && booking.flights.length > 0 ? (
                                  <>
                                    {booking.flights[0]?.details?.error ? (
                                      <div className="bg-yellow-50 dark:bg-yellow-900/30 border border-yellow-200 dark:border-yellow-800 rounded-md p-3">
                                        <div className="flex">
                                          <div className="flex-shrink-0">
                                            <svg className="h-5 w-5 text-yellow-400 dark:text-yellow-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                            </svg>
                                          </div>
                                          <div className="ml-3">
                                            <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-400">Booking Confirmed</h3>
                                            <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                                              <p>Your flight booking is confirmed with reference: <span className="font-medium">{booking.flights[0].details.bookingReference}</span></p>
                                              <p className="mt-1">{booking.flights[0].details.message}</p>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    ) : (
                                      <FlightDetails flight={booking.flights[0]} />
                                    )}
                                  </>
                                ) : (
                                  <div className="text-sm text-gray-500 dark:text-gray-400">Flight details not available</div>
                                )}
                              </div>
                            ) : (
                              <div className="mt-2">
                                <HotelDetails bookingItem={item} />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => handleDownloadInvoice(booking.id)}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                      Invoice
                    </button>
                    {booking.status !== 'CANCELLED' && (
                      <>
                        {booking.bookingItems.some(item => item.type === 'FLIGHT') && (
                          <button
                            onClick={() => handleVerifyBooking(booking.id)}
                            className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300"
                          >
                            <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                            Verify
                          </button>
                        )}
                        <button
                          onClick={() => handleCancelBooking(
                            booking.id, 
                            booking.flights && booking.flights.length > 0 && booking.flights[0].details?.bookingReference 
                              ? booking.flights[0].details.bookingReference 
                              : booking.bookingItems.find(item => item.referenceId)?.referenceId || '',
                            booking.bookingItems.find(item => item.type === 'FLIGHT')?.details?.lastName || ''
                          )}
                          className="inline-flex items-center px-3 py-2 border border-red-300 dark:border-red-700 shadow-sm text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-700 hover:bg-red-50 dark:hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
                        >
                          <XCircleIcon className="h-4 w-4 mr-1.5" />
                          Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 
"use client";
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaperAirplaneIcon, BuildingOfficeIcon, CreditCardIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { Suspense } from 'react'
import { useAuth } from '@/components/AuthContext';
import { useTheme } from '@/components/ThemeContext';
import Link from 'next/link';
import { send_request } from '@/utils/AFS';

interface BookingItem {
  type: 'FLIGHT' | 'HOTEL';
  referenceId?: string;
  hotelId?: number;
  roomTypeId?: number;
  startDate?: string;
  endDate?: string;
  price?: number;
  status?: string;
  details?: any;
}

interface FlightDetails {
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
}

interface HotelDetails {
  id: number;
  name: string;
  city: string;
  country: string;
  roomType: string;
  price: number;
  currency: string;
}

export default function CheckoutPage(){
    return <Suspense>
                <CheckoutPageInner/>
            </Suspense>
}
function CheckoutPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, user } = useAuth();
  const { theme } = useTheme();
  const [bookingItems, setBookingItems] = useState<BookingItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<{
    hotels?: any[];
    flights?: any[];
  }>({});
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [cardErrors, setCardErrors] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    nameOnCard: ''
  });
  const [passportNumber, setPassportNumber] = useState('');
  const [passportError, setPassportError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingReference, setBookingReference] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookingItems = async () => {
      try {
        setLoading(true);
        
        // Get booking items from URL parameters
        const itemsParam = searchParams.get('items');
        if (itemsParam) {
          const decodedItems = JSON.parse(decodeURIComponent(itemsParam));
          const items = Array.isArray(decodedItems) ? decodedItems : [decodedItems];
          
          // Process each booking item
          const processedItems = await Promise.all(items.map(async (item) => {
            if (item.type === 'FLIGHT') {
              // For flights, we already have the details in the item
              return {
                type: 'FLIGHT',
                referenceId: item.referenceId,
                price: item.price,
                details: item.details
              };
            } else if (item.type === 'HOTEL') {
              // For hotels, fetch the details if needed
              if (!item.details && item.hotelId) {
                const response = await fetch(`/api/hotels/${item.hotelId}`);
                if (response.ok) {
                  const hotelData = await response.json();
                  return {
                    ...item,
                    details: hotelData
                  };
                }
              }
              return item;
            }
            return item;
          }));
          
          setBookingItems(processedItems);
          
          // Calculate total price
          const total = processedItems.reduce((sum, item) => sum + (item.price || 0), 0);
          setTotalPrice(total);
          
          // Fetch suggestions based on the booking items
          await fetchSuggestions(processedItems);
        }
      } catch (err) {
        console.error('Error fetching booking items:', err);
        setError('Failed to load booking details. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookingItems();
  }, [searchParams]);

  const fetchSuggestions = async (items: BookingItem[]) => {
    try {
      // Find flight destinations to suggest hotels
      const flightDestinations = items
        .filter(item => item.type === 'FLIGHT')
        .map(item => item.details?.destination?.city)
        .filter(Boolean);
      
      // Find hotel cities to suggest flights
      const hotelCities = items
        .filter(item => item.type === 'HOTEL')
        .map(item => item.details?.city)
        .filter(Boolean);
      
      const newSuggestions: { hotels?: any[], flights?: any[] } = {};
      
      // Fetch hotel suggestions for flight destinations
      if (flightDestinations.length > 0) {
        const hotelPromises = flightDestinations.map(city => 
          fetch(`/api/hotels/search?city=${encodeURIComponent(city)}&limit=3`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => [])
        );
        
        const hotelResults = await Promise.all(hotelPromises);
        newSuggestions.hotels = hotelResults.flat();
      }
      
      // Fetch flight suggestions for hotel cities
      if (hotelCities.length > 0) {
        const flightPromises = hotelCities.map(city => 
          fetch(`/api/flights/search?destination=${encodeURIComponent(city)}&limit=3`)
            .then(res => res.ok ? res.json() : [])
            .catch(() => [])
        );
        
        const flightResults = await Promise.all(flightPromises);
        newSuggestions.flights = flightResults.flat();
      }
      
      setSuggestions(newSuggestions);
    } catch (err) {
      console.error('Error fetching suggestions:', err);
    }
  };

  const handleAddHotelSuggestion = (hotel: any) => {
    const hotelItem: BookingItem = {
      type: 'HOTEL',
      hotelId: hotel.id,
      startDate: bookingItems.find(item => item.type === 'FLIGHT')?.details?.arrivalTime?.split('T')[0] || '',
      endDate: '', // User can select this later
      price: hotel.startingPrice || 0,
      details: hotel
    };
    
    setBookingItems([...bookingItems, hotelItem]);
    setTotalPrice(totalPrice + (hotel.startingPrice || 0));
    
    // Remove this hotel from suggestions
    setSuggestions(prev => ({
      ...prev,
      hotels: prev.hotels?.filter(h => h.id !== hotel.id) || []
    }));
  };

  const handleAddFlightSuggestion = (flight: any) => {
    const flightItem: BookingItem = {
      type: 'FLIGHT',
      referenceId: flight.id,
      price: flight.price,
      details: {
        id: flight.id,
        flightNumber: flight.flightNumber,
        departureTime: flight.departureTime,
        arrivalTime: flight.arrivalTime,
        origin: {
          code: flight.origin?.code || '',
          name: flight.origin?.name || '',
          city: flight.origin?.city || '',
          country: flight.origin?.country || ''
        },
        destination: {
          code: flight.destination?.code || '',
          name: flight.destination?.name || '',
          city: flight.destination?.city || '',
          country: flight.destination?.country || ''
        },
        airline: {
          code: flight.airline?.code || '',
          name: flight.airline?.name || ''
        },
        price: flight.price,
        currency: flight.currency
      }
    };
    
    setBookingItems([...bookingItems, flightItem]);
    setTotalPrice(totalPrice + flight.price);
    
    // Remove this flight from suggestions
    setSuggestions(prev => ({
      ...prev,
      flights: prev.flights?.filter(f => f.id !== flight.id) || []
    }));
  };

  const handleViewAllHotels = (city: string) => {
    router.push(`/hotels?city=${encodeURIComponent(city)}`);
  };

  const handleViewAllFlights = (destination: string) => {
    router.push(`/flights?destination=${encodeURIComponent(destination)}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateCard()) {
      setError('Please enter valid card details');
      return;
    }
    
    if (!passportNumber) {
      setError('Please enter your passport number');
      return;
    }
    
    setIsSubmitting(true);
    setError('');
    
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        router.push('/login');
        return;
      }

      // Ensure we have at least one booking item
      if (bookingItems.length === 0) {
        throw new Error('No items to book');
      }

      // Separate flight and hotel bookings
      const flightItems = bookingItems.filter(item => item.type === 'FLIGHT');
      const hotelItems = bookingItems.filter(item => item.type === 'HOTEL');

      let bookingResponse;
      let bookingReference = null;

      // Handle flight bookings if any
      if (flightItems.length > 0) {
        // Format the flight booking items
        const flightIds = flightItems.map(item => item.referenceId!);
        
        // Create payment details object for flights
        const flightPaymentDetails = {
          cardNumber: paymentDetails.cardNumber.replace(/\s/g, ''),
          cardExpiry: paymentDetails.expiryDate,
          cardCvv: paymentDetails.cvv,
          cardName: paymentDetails.nameOnCard
        };
        
        // Stringify the payment details
        const flightPaymentDetailsString = JSON.stringify(flightPaymentDetails);
        
        // Get user details
        const userResponse = await fetch('/api/protected/users/me', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!userResponse.ok) {
          throw new Error('Failed to get user details');
        }
        
        const userData = await userResponse.json();
        
        // Book flights using AFS API
        const flight_response = await send_request(
          "/bookings", 
          {
            method: "POST",
            body: JSON.stringify({
              "email": userData.email,
              "firstName": userData.firstName,
              "flightIds": flightIds,
              "lastName": userData.lastName,
              "passportNumber": passportNumber.toString(),
            })
          }
        );

        if (flight_response.error) {
          throw new Error(flight_response.error);
        }

        bookingReference = flight_response.bookingReference;
      }

      // Handle hotel bookings if any
      if (hotelItems.length > 0) {
        // Process each hotel booking
        for (const hotelItem of hotelItems) {
          // Create payment details object for hotels
          const hotelPaymentDetails = {
            cardNumber: paymentDetails.cardNumber.replace(/\s/g, ''),
            cardExpiry: paymentDetails.expiryDate,
            cardCvv: paymentDetails.cvv,
            cardName: paymentDetails.nameOnCard
          };
          
          // Stringify the payment details
          const hotelPaymentDetailsString = JSON.stringify(hotelPaymentDetails);
          
          // Book hotel using our new API
          const hotelResponse = await fetch('/api/hotels/bookings', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              hotelId: hotelItem.hotelId,
              roomTypeId: hotelItem.roomTypeId,
              startDate: hotelItem.startDate,
              endDate: hotelItem.endDate,
              price: hotelItem.price,
              passportNumber,
              paymentDetails: hotelPaymentDetailsString
            })
          });
          
          if (!hotelResponse.ok) {
            const errorData = await hotelResponse.json();
            throw new Error(errorData.error || 'Failed to book hotel');
          }
          
          const hotelData = await hotelResponse.json();
          bookingResponse = hotelData;
          bookingReference = hotelData.bookingReference || `HOTEL-${hotelData.booking.id}`;
        }
      }

      // Set success state and booking reference
      setBookingSuccess(true);
      setBookingReference(bookingReference || bookingResponse?.bookingReference);
      
      // Don't redirect immediately to show success message
      // router.push(`/bookings/${data.booking.id}`);
    } catch (error: any) {
      console.error('Error creating booking:', error);
      setError(error.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateCard = () => {
    // Basic validation for card number (Luhn algorithm)
    const cardNumberValid = paymentDetails.cardNumber.replace(/\s/g, '').length >= 13 && 
                           paymentDetails.cardNumber.replace(/\s/g, '').length <= 19;
    
    // Basic validation for expiry date (MM/YY format)
    const expiryRegex = /^(0[1-9]|1[0-2])\/([0-9]{2})$/;
    const expiryValid = expiryRegex.test(paymentDetails.expiryDate);
    
    // Basic validation for CVV (3-4 digits)
    const cvvValid = /^[0-9]{3,4}$/.test(paymentDetails.cvv);
    
    // Basic validation for cardholder name
    const nameValid = paymentDetails.nameOnCard.trim().length > 0;
    
    return cardNumberValid && expiryValid && cvvValid && nameValid;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatPrice = (price: number, currency: string = 'CAD') => {
    return new Intl.NumberFormat('en-CA', {
      style: 'currency',
      currency
    }).format(price);
  };

  if (bookingSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center transition-colors duration-300">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 dark:bg-green-900 mb-4 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-green-600 dark:text-green-400 transition-colors duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Booking Confirmed!</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors duration-300">
              Your booking has been successfully confirmed.
            </p>
            {bookingReference && (
              <p className="text-lg font-medium text-teal-600 dark:text-teal-500 mb-6 transition-colors duration-300">
                Booking Reference: {bookingReference}
              </p>
            )}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/bookings" 
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-300"
              >
                View My Bookings
              </Link>
              <Link 
                href="/" 
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                Return to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-500 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-300">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <button
              onClick={() => router.back()}
              className="mt-4 bg-teal-600 dark:bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-300"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Check if user is not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-8 text-center transition-colors duration-300">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-teal-100 dark:bg-teal-900 mb-4 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-teal-600 dark:text-teal-400 transition-colors duration-300">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Login Required</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 transition-colors duration-300">
              You need to be logged in to book flights. Please log in or create an account to continue.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link 
                href="/login" 
                className="inline-flex justify-center items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-teal-600 dark:bg-teal-700 hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-300"
              >
                Log In
              </Link>
              <button
                onClick={() => router.back()}
                className="inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-base font-medium rounded-md shadow-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors duration-300"
              >
                Go Back
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors duration-300">Checkout</h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Complete your booking</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Order Summary</h2>
              <div className="space-y-4">
                {bookingItems.map((item, index) => (
                  <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-4 transition-colors duration-300">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white transition-colors duration-300">
                          {item.type === 'FLIGHT' ? 'Flight Booking' : 'Hotel Booking'}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1 transition-colors duration-300">
                          {item.type === 'FLIGHT' 
                            ? `${item.details?.origin?.city || 'Unknown'} → ${item.details?.destination?.city || 'Unknown'}`
                            : `${item.details?.name}, ${item.details?.city || 'Unknown'}, ${item.details?.country || 'Unknown'}`}
                        </p>
                      </div>
                      <p className="text-gray-900 dark:text-white font-medium transition-colors duration-300">
                        {formatPrice(item.price || 0)}
                      </p>
                    </div>
                  </div>
                ))}
                <div className="pt-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white transition-colors duration-300">Total</span>
                    <span className="text-2xl font-bold text-teal-600 dark:text-teal-500 transition-colors duration-300">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 transition-colors duration-300">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 transition-colors duration-300">Payment Information</h2>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="mb-6">
                  <label htmlFor="passportNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Passport Number
                  </label>
                  <input
                    type="text"
                    id="passportNumber"
                    name="passportNumber"
                    required
                    value={passportNumber}
                    onChange={(e) => {
                      setPassportNumber(e.target.value);
                      setPassportError('');
                    }}
                    className="w-full px-4 py-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                  />
                  {passportError && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{passportError}</p>
                  )}
                </div>

                <div className="mb-6">
                  <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Card Number
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    required
                    value={paymentDetails.cardNumber}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').substring(0, 16);
                      setPaymentDetails({...paymentDetails, cardNumber: value});
                      setCardErrors({...cardErrors, cardNumber: ''});
                    }}
                    className="w-full px-4 py-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                    placeholder="1234 5678 9012 3456"
                  />
                  {cardErrors.cardNumber && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{cardErrors.cardNumber}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      Expiry Date
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      required
                      value={paymentDetails.expiryDate}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').substring(0, 4);
                        const formatted = value.length > 2 ? `${value.substring(0, 2)}/${value.substring(2)}` : value;
                        setPaymentDetails({...paymentDetails, expiryDate: formatted});
                        setCardErrors({...cardErrors, expiryDate: ''});
                      }}
                      className="w-full px-4 py-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                      placeholder="MM/YY"
                    />
                    {cardErrors.expiryDate && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{cardErrors.expiryDate}</p>
                    )}
                  </div>
                  <div>
                    <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                      CVV
                    </label>
                    <input
                      type="text"
                      id="cvv"
                      name="cvv"
                      required
                      value={paymentDetails.cvv}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').substring(0, 3);
                        setPaymentDetails({...paymentDetails, cvv: value});
                        setCardErrors({...cardErrors, cvv: ''});
                      }}
                      className="w-full px-4 py-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                      placeholder="123"
                    />
                    {cardErrors.cvv && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{cardErrors.cvv}</p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 transition-colors duration-300">
                    Name on Card
                  </label>
                  <input
                    type="text"
                    id="nameOnCard"
                    name="nameOnCard"
                    required
                    value={paymentDetails.nameOnCard}
                    onChange={(e) => {
                      setPaymentDetails({...paymentDetails, nameOnCard: e.target.value});
                      setCardErrors({...cardErrors, nameOnCard: ''});
                    }}
                    className="w-full px-4 py-2 rounded-md border-gray-300 dark:border-gray-600 shadow-sm focus:border-teal-500 focus:ring-teal-500 dark:bg-gray-700 dark:text-white transition-colors duration-300"
                    placeholder="John Doe"
                  />
                  {cardErrors.nameOnCard && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{cardErrors.nameOnCard}</p>
                  )}
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-teal-600 dark:bg-teal-700 text-white py-3 px-4 rounded-md hover:bg-teal-700 dark:hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-colors duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Processing...' : 'Complete Booking'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
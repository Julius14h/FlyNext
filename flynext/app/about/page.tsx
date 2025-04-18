"use client";

import React from 'react';
import Image from 'next/image';
import { PaperAirplaneIcon, BuildingOfficeIcon, DocumentTextIcon, BellIcon, DevicePhoneMobileIcon } from '@heroicons/react/24/outline';
import { useTheme } from '@/components/ThemeContext';

export default function AboutPage() {
  const { theme } = useTheme();
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-teal-600 dark:bg-teal-700 p-2 rounded-full mr-3 transition-colors duration-300">
              <PaperAirplaneIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white transition-colors duration-300">About FlyNext</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-300">Your trusted travel companion</p>
        </div>

        {/* Introduction */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-300">Your Most Reliable Travel Companion</h2>
          <p className="text-gray-700 dark:text-gray-300 mb-6 transition-colors duration-300">
            FlyNext is a robust travel search platform tailored to simplify the process of booking flights and hotels. 
            With an intuitive interface, FlyNext enables users to effortlessly search, compare flights across various airlines, 
            find accommodations matching their preferences, and organize trips—all within a single platform.
          </p>
          <p className="text-gray-700 dark:text-gray-300 mb-6 transition-colors duration-300">
            FlyNext leverages real-time data to provide accurate, up-to-date availability and pricing information, 
            ensuring efficient and seamless travel planning. Users can refine searches using advanced filters such as price, 
            departure time, duration, layovers, hotel amenities, ratings, and location.
          </p>
          <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
            With a minimalistic design, FlyNext aims to enhance the travel search experience, offering both convenience and 
            flexibility for a diverse range of travelers. Additionally, the platform integrates secure booking options, 
            making it a one-stop destination for planning everything from short getaways to extended vacations.
          </p>
        </div>

        {/* Features */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 mb-8 transition-colors duration-300">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-300">FlyNext Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div className="flex items-start">
              <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded-full mr-3 transition-colors duration-300">
                <PaperAirplaneIcon className="h-6 w-6 text-teal-600 dark:text-teal-400 transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-300">Flight Search</h3>
                <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Search for flights by specifying source, destination, and dates. View detailed flight information including 
                  departure/arrival times, duration, and layovers. Auto-complete suggestions for cities and airports.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded-full mr-3 transition-colors duration-300">
                <BuildingOfficeIcon className="h-6 w-6 text-teal-600 dark:text-teal-400 transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-300">Hotel Search</h3>
                <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Search for hotels by check-in/out dates and city. Filter by name, star-rating, and price range. 
                  View detailed hotel information including room types, amenities, and pricing.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded-full mr-3 transition-colors duration-300">
                <DocumentTextIcon className="h-6 w-6 text-teal-600 dark:text-teal-400 transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-300">Booking Management</h3>
                <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Book flights and hotels with a streamlined checkout process. View and manage your bookings, 
                  receive PDF invoices, and cancel reservations when needed.
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="bg-teal-100 dark:bg-teal-900 p-2 rounded-full mr-3 transition-colors duration-300">
                <BellIcon className="h-6 w-6 text-teal-600 dark:text-teal-400 transition-colors duration-300" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2 transition-colors duration-300">Notifications</h3>
                <p className="text-gray-700 dark:text-gray-300 transition-colors duration-300">
                  Receive notifications for new bookings, changes to existing bookings, and important updates. 
                  Stay informed with real-time alerts about your travel plans.
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-md transition-colors duration-300">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4 transition-colors duration-300">User Types</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm transition-colors duration-300">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2 transition-colors duration-300">Visitors</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
                  Access to flight and hotel search functionality without authentication.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm transition-colors duration-300">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2 transition-colors duration-300">Users</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
                  Authenticated users with access to booking, profile management, and notifications.
                </p>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-md shadow-sm transition-colors duration-300">
                <h4 className="font-medium text-gray-800 dark:text-white mb-2 transition-colors duration-300">Hotel Owners</h4>
                <p className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
                  Specialized features for managing hotels, room types, and viewing booking information.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Experience */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 transition-colors duration-300">
          <div className="flex items-center mb-6">
            <DevicePhoneMobileIcon className="h-8 w-8 text-teal-600 dark:text-teal-400 mr-3 transition-colors duration-300" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-300">User Experience</h2>
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-6 transition-colors duration-300">
            FlyNext is designed with a clean and intuitive user interface that allows users to navigate the platform effortlessly. 
            The website is responsive and rendered well across different screen sizes, ensuring accessibility and usability 
            on monitors, laptops, tablets, and mobile devices.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md transition-colors duration-300">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2 transition-colors duration-300">Accessibility</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
                The platform is designed to be accessible to all users, with clear navigation, readable text, and 
                responsive design that works across all devices.
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md transition-colors duration-300">
              <h3 className="font-medium text-gray-800 dark:text-white mb-2 transition-colors duration-300">Design Philosophy</h3>
              <p className="text-gray-700 dark:text-gray-300 text-sm transition-colors duration-300">
                Minimalistic design with a focus on user experience, making travel planning simple, efficient, and enjoyable.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
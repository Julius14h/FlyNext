"use client";
import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Notifications from './Notifications';
import { useTheme } from './ThemeContext';
import { useAuth } from '@/components/AuthContext';
import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { user, isAuthenticated, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    console.log("Logging out...");
    logout();
    setIsMenuOpen(false);
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Function to handle theme toggle
  const handleThemeToggle = () => {
    // Call the React context toggle function
    toggleTheme();
    
    // Log for debugging
    console.log('Theme toggled via button click');
    console.log('Current theme:', theme);
    console.log('HTML classes:', document.documentElement.classList);
  };

  return (
    <header className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white p-6 sticky top-0 z-10 shadow-sm transition-colors duration-300">
      <nav className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center space-x-2">
          <Image
            src="/flynext-logo.png"
            alt="FlyNext Logo"
            width={80}
            height={80}
            className="object-contain"
          />
          <span className="text-3xl font-bold text-gray-900 dark:text-white">FlyNext</span>
        </Link>

        <button
          onClick={toggleMenu}
          className="md:hidden text-2xl focus:outline-none dark:text-white"
        >
          {isMenuOpen ? "✕" : "☰"}
        </button>

        <div className="hidden md:flex items-center space-x-4">
          <Link href="/flights" className="hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white">
            Flights
          </Link>
          <Link href="/hotels" className="hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white">
            Hotels
          </Link>
          <Link href="/about" className="hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white">
            About
          </Link>
          {isAuthenticated ? (
            <>
              <Link href="/profile" className="hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white">
                Profile
              </Link>
              <Link href="/bookings" className="hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white">
                My Bookings
              </Link>
              <button
                onClick={handleLogout}
                className="hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white"
              >
                Log Out
              </button>
              <Notifications />
            </>
          ) : (
            <>
              <Link href="/signup" className="hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white">
                Sign Up
              </Link>
              <Link href="/login" className="hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white">
                Log In
              </Link>
            </>
          )}
          <button 
            onClick={handleThemeToggle}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Toggle dark mode"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>
        </div>

        {isMenuOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-800 shadow-lg md:hidden transition-colors duration-300">
            <div className="container mx-auto p-4 space-y-4">
              <Link
                href="/flights"
                className="block hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Flights
              </Link>
              <Link
                href="/hotels"
                className="block hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                Hotels
              </Link>
              <Link
                href="/about"
                className="block hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white"
                onClick={() => setIsMenuOpen(false)}
              >
                About
              </Link>
              {isAuthenticated ? (
                <>
                  <Link
                    href="/profile"
                    className="block hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Edit Profile
                  </Link>
                  <Link
                    href="/bookings"
                    className="block hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Bookings
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white"
                  >
                    Log Out
                  </button>
                  <Notifications />
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="block hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                  <Link
                    href="/login"
                    className="block hover:text-gray-600 dark:hover:text-gray-300 text-lg dark:text-white"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log In
                  </Link>
                </>
              )}
              <button 
                onClick={handleThemeToggle}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle dark mode"
              >
                {theme === 'dark' ? (
                  <SunIcon className="h-5 w-5" />
                ) : (
                  <MoonIcon className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
// generated by grok
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-teal-600 dark:bg-teal-700 text-white py-8 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About FlyNext</h3>
            <p className="text-teal-100 dark:text-teal-200">
              Your one-stop platform for finding the perfect flights and hotels for your next adventure.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/flights" className="text-teal-100 dark:text-teal-200 hover:text-white dark:hover:text-white transition-colors">
                  Search Flights
                </Link>
              </li>
              <li>
                <Link href="/hotels" className="text-teal-100 dark:text-teal-200 hover:text-white dark:hover:text-white transition-colors">
                  Search Hotels
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-teal-100 dark:text-teal-200 hover:text-white dark:hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Account</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/login" className="text-teal-100 dark:text-teal-200 hover:text-white dark:hover:text-white transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link href="/signup" className="text-teal-100 dark:text-teal-200 hover:text-white dark:hover:text-white transition-colors">
                  Sign Up
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-teal-100 dark:text-teal-200 hover:text-white dark:hover:text-white transition-colors">
                  My Profile
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-teal-500 dark:border-teal-600 text-center text-teal-100 dark:text-teal-200">
          <p>&copy; {new Date().getFullYear()} FlyNext. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
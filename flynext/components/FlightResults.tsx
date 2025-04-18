import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';

interface Flight {
  id: string;
  flightNumber: string;
  departureTime: string;
  arrivalTime: string;
  duration: number;
  price: number;
  currency: string;
  availableSeats: number;
  status: string;
  airline: {
    code: string;
    name: string;
  };
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
}

interface FlightResult {
  legs: number;
  flights: Flight[];
}

interface FlightResultsProps {
  results: Record<string, { results: FlightResult[] }>;
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

function formatLayoverDuration(departureTime: string, arrivalTime: string): string {
  const departure = new Date(departureTime);
  const arrival = new Date(arrivalTime);
  const diffMs = departure.getTime() - arrival.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  return formatDuration(diffMins);
}

export default function FlightResults({ results }: FlightResultsProps) {
  const router = useRouter();

  const handleBookFlight = (flight: Flight) => {
    // Create a booking item for the flight
    const bookingItem = {
      type: 'FLIGHT',
      referenceId: flight.id,
      price: flight.price,
      details: flight
    };
    
    // Encode the booking item and redirect to checkout
    const encodedItem = encodeURIComponent(JSON.stringify(bookingItem));
    router.push(`/checkout?items=${encodedItem}`);
  };

  // Check if there are any results
  const hasResults = Object.keys(results).length > 0 && 
    Object.values(results).some(dayResults => dayResults.results && dayResults.results.length > 0);

  if (!hasResults) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center transition-colors duration-300">
        <div className="text-gray-600 dark:text-gray-300">
          <p className="text-lg font-medium mb-2">No flights found</p>
          <p>We couldn't find any flights matching your search criteria.</p>
          <p className="mt-2 text-sm">Try searching for flights between different cities.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.entries(results).map(([date, dayResults]) => (
        <div key={date} className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-colors duration-300">
          <div className="flex items-center mb-4">
            <div className="h-5 w-5 text-teal-600 dark:text-teal-500 mr-2 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white transition-colors duration-300">
              {format(new Date(date), 'EEEE, MMMM d, yyyy')}
            </h2>
          </div>
          <div className="space-y-4">
            {dayResults.results?.map((result, index) => (
              <div key={index} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-gray-800 transition-colors duration-300">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="text-2xl font-bold text-gray-800 dark:text-white transition-colors duration-300">
                      {result.flights[0].origin.code} → {result.flights[result.flights.length - 1].destination.code}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded transition-colors duration-300">
                      {result.legs === 1 ? 'Direct' : `${result.legs - 1} stop${result.legs > 2 ? 's' : ''}`}
                    </div>
                  </div>
                  <div className="text-xl font-bold text-teal-600 dark:text-teal-500 transition-colors duration-300">
                    {result.flights[0].currency} {result.flights.reduce((sum, flight) => sum + flight.price, 0).toLocaleString()}
                  </div>
                </div>

                {result.flights.map((flight, flightIndex) => (
                  <div key={flight.id} className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white transition-colors duration-300">{flight.airline.name}</div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">Flight {flight.flightNumber}</div>
                      </div>
                      <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 mr-1 text-teal-600 dark:text-teal-500 transition-colors duration-300">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {formatDuration(flight.duration)}
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-gray-800 dark:text-white transition-colors duration-300">
                          {format(new Date(flight.departureTime), 'h:mm a')}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 mr-1 text-teal-600 dark:text-teal-500 transition-colors duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {flight.origin.city} ({flight.origin.code})
                        </div>
                      </div>
                      <div className="flex-1 px-4">
                        <div className="border-t border-gray-200 dark:border-gray-700 relative transition-colors duration-300">
                          <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2 transition-colors duration-300">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-teal-600 dark:text-teal-500 transition-colors duration-300">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.25 59.25 0 0121.72 12H6z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.25 59.25 0 0121.72 12H6z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.25 59.25 0 0121.72 12H6z" />
                            </svg>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-800 dark:text-white transition-colors duration-300">
                          {format(new Date(flight.arrivalTime), 'h:mm a')}
                        </div>
                        <div className="text-sm text-gray-600 dark:text-gray-300 flex items-center justify-end transition-colors duration-300">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-4 w-4 mr-1 text-teal-600 dark:text-teal-500 transition-colors duration-300">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                          </svg>
                          {flight.destination.city} ({flight.destination.code})
                        </div>
                      </div>
                    </div>

                    {flightIndex < result.flights.length - 1 && (
                      <div className="mt-2 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 p-2 rounded transition-colors duration-300">
                        <span className="font-medium">Layover:</span> {formatLayoverDuration(
                          result.flights[flightIndex + 1].departureTime,
                          flight.arrivalTime
                        )} in {flight.destination.city}
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 transition-colors duration-300">
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600 dark:text-gray-300 transition-colors duration-300">
                      {result.flights[0].availableSeats} seats available
                    </div>
                    <button
                      onClick={() => handleBookFlight(result.flights[0])}
                      className="bg-teal-600 dark:bg-teal-700 text-white px-4 py-2 rounded hover:bg-teal-700 dark:hover:bg-teal-600 transition-colors duration-300"
                    >
                      Book Now
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
} 
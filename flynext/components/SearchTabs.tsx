"use client";
import { useState } from 'react';
import FlightSearch from './FlightSearch';
import HotelSearch from './HotelSearch';

type Tab = "flights" | "hotels";

export default function SearchTabs() {
  const [activeTab, setActiveTab] = useState<Tab>("flights");

  return (
    <div className="bg-[rgb(30,200,191)] p-6 rounded-lg shadow-md">
      <div className="flex space-x-4 mb-4">
        <button
          className={`p-2 ${activeTab === "flights" ? "bg-white text-gray-900" : "bg-gray-300"}`}
          onClick={() => setActiveTab("flights")}
        >
          Flights
        </button>
        <button
          className={`p-2 ${activeTab === "hotels" ? "bg-white text-gray-900" : "bg-gray-300"}`}
          onClick={() => setActiveTab("hotels")}
        >
          Hotels
        </button>
      </div>

      {activeTab === "flights" ? <FlightSearch /> : <HotelSearch />}
    </div>
  );
}
import { MapPin } from 'lucide-react';
import { useState } from 'react';
import MapPlaceHolder from '../components/routes/MapPlaceHolder';
import RouteResults from '../components/routes/RouteResults';
import RouteSearchForm from '../components/routes/RouteSearchForm';
import { landmarks } from '../data/routeLoader';
import { findRoute } from '../lib/routeFinder';
import type { Landmark, RouteResult } from '../types/jeepneyRoutes';

export default function JeepneyRoutes() {
  const [searchResult, setSearchResult] = useState<RouteResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedOrigin, setSelectedOrigin] = useState<Landmark | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<Landmark | null>(null);

  const handleSearch = async (origin: Landmark, destination: Landmark) => {
    setSelectedOrigin(origin);
    setSelectedDestination(destination);
    setIsSearching(true);

    await new Promise((resolve) => setTimeout(resolve, 500));

    const result = findRoute(origin.id, destination.id);
    setSearchResult(result);
    setIsSearching(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-10 h-10" />
            <h1 className="text-4xl font-bold">Jeepney Routes</h1>
          </div>
          <p className="text-primary-100 text-lg max-w-2xl">
            Find the best jeepney routes to get around Bacolod City. Enter your
            origin and destination to see available routes and transfers.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <RouteSearchForm onSearch={handleSearch} isLoading={isSearching} />
            <RouteResults result={searchResult} isSearching={isSearching} />
          </div>

          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Map View
              </h3>
              <MapPlaceHolder
                landmarks={landmarks}
                selectedOrigin={selectedOrigin}
                selectedDestination={selectedDestination}
                routeResult={searchResult}
              />
              <div className="mt-4 flex items-center justify-center gap-6 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-primary-700"></div>
                  <span>Origin</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full bg-secondary-500"></div>
                  <span>Destination</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-primary-400 opacity-60"></div>
                  <span>All Stops</span>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-primary-50 rounded-lg p-6 border border-primary-100">
              <h3 className="font-semibold text-primary-900 mb-2">
                How to use
              </h3>
              <ul className="text-sm text-primary-800 space-y-2">
                <li>• Enter your starting point (origin)</li>
                <li>• Enter your destination</li>
                <li>
                  • Click &quot;Find Route&quot; to see available jeepneys
                </li>
                <li>• Follow the boarding and alighting instructions</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

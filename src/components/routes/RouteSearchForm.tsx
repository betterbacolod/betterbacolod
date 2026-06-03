import { Search } from 'lucide-react';
import { useState } from 'react';
import { searchLandmarks } from '../../data/routeLoader';
import { cn } from '../../lib/utils';
import type { Landmark } from '../../types/jeepneyRoutes';

interface RouteSearchFormProps {
  onSearch: (origin: Landmark, destination: Landmark) => void;
  isLoading?: boolean;
}

export default function RouteSearchForm({
  onSearch,
  isLoading = false,
}: RouteSearchFormProps) {
  const [originQuery, setOriginQuery] = useState('');
  const [destQuery, setDestQuery] = useState('');
  const [originResults, setOriginResults] = useState<Landmark[]>([]);
  const [destResults, setDestResults] = useState<Landmark[]>([]);
  const [selectedOrigin, setSelectedOrigin] = useState<Landmark | null>(null);
  const [selectedDestination, setSelectedDestination] =
    useState<Landmark | null>(null);

  const handleOriginChange = (value: string) => {
    setOriginQuery(value);
    setOriginResults(searchLandmarks(value));
    if (value === '') setSelectedOrigin(null);
  };

  const handleDestChange = (value: string) => {
    setDestQuery(value);
    setDestResults(searchLandmarks(value));
    if (value === '') setSelectedDestination(null);
  };

  const handleSearch = () => {
    if (selectedOrigin && selectedDestination) {
      onSearch(selectedOrigin, selectedDestination);
    }
  };

  const swapLocations = () => {
    const temp = selectedOrigin;
    const tempQuery = originQuery;
    setSelectedOrigin(selectedDestination);
    setSelectedDestination(temp);
    setOriginQuery(destQuery);
    setDestQuery(tempQuery);
    setOriginResults([]);
    setDestResults([]);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Find Jeepney Routes
      </h2>

      <div className="space-y-4">
        {/* Origin Input */}
        <div className="relative">
          <label
            htmlFor="origin-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            From (Origin)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="origin-input"
              type="text"
              value={originQuery}
              onChange={(e) => handleOriginChange(e.target.value)}
              placeholder="Search origin (e.g., SM City, Bata Terminal)"
              className={cn(
                'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500',
                selectedOrigin
                  ? 'border-primary-500 bg-primary-50'
                  : 'border-gray-300',
              )}
              autoComplete="off"
            />
          </div>
          {originResults.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-sm max-h-48 overflow-auto">
              {originResults.map((landmark) => (
                <li
                  key={landmark.id}
                  onClick={() => {
                    setSelectedOrigin(landmark);
                    setOriginQuery(landmark.name);
                    setOriginResults([]);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedOrigin(landmark);
                      setOriginQuery(landmark.name);
                      setOriginResults([]);
                    }
                  }}
                  className="px-4 py-3 hover:bg-primary-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <div className="font-medium text-gray-900">
                    {landmark.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {landmark.category} • {landmark.barangay}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Swap Button */}
        <div className="flex justify-center">
          <button
            onClick={swapLocations}
            className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
            aria-label="Swap origin and destination"
            type="button"
          >
            <svg
              className="w-5 h-5 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              role="img"
              aria-label="Swap locations"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
              />
            </svg>
          </button>
        </div>

        {/* Destination Input */}
        <div className="relative">
          <label
            htmlFor="destination-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            To (Destination)
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              id="destination-input"
              type="text"
              value={destQuery}
              onChange={(e) => handleDestChange(e.target.value)}
              placeholder="Search destination (e.g., Libertad, Robinsons)"
              className={cn(
                'w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-secondary-500 focus:border-secondary-500',
                selectedDestination
                  ? 'border-secondary-500 bg-secondary-50'
                  : 'border-gray-300',
              )}
              autoComplete="off"
            />
          </div>
          {destResults.length > 0 && (
            <ul className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-sm max-h-48 overflow-auto">
              {destResults.map((landmark) => (
                <li
                  key={landmark.id}
                  onClick={() => {
                    setSelectedDestination(landmark);
                    setDestQuery(landmark.name);
                    setDestResults([]);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setSelectedDestination(landmark);
                      setDestQuery(landmark.name);
                      setDestResults([]);
                    }
                  }}
                  className="px-4 py-3 hover:bg-secondary-50 cursor-pointer border-b border-gray-100 last:border-0"
                >
                  <div className="font-medium text-gray-900">
                    {landmark.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {landmark.category} • {landmark.barangay}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={handleSearch}
          disabled={!selectedOrigin || !selectedDestination || isLoading}
          className={cn(
            'w-full py-3 px-6 font-semibold rounded-lg transition-colors',
            !selectedOrigin || !selectedDestination || isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-primary-600 text-white hover:bg-primary-700',
          )}
          type="button"
        >
          {isLoading ? 'Finding Route...' : 'Find Route'}
        </button>
      </div>
    </div>
  );
}

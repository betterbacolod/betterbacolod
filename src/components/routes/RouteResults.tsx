import { Clock, MapPin, Repeat } from 'lucide-react';
import type { RouteResult } from '../../types/jeepneyRoutes';
import RouteSegmentedCard from './RouteSegmentedCard';

interface RouteResultsProps {
  result: RouteResult | null;
  isSearching: boolean;
}

export default function RouteResults({
  result,
  isSearching,
}: RouteResultsProps) {
  if (isSearching) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mb-4" />
          <p className="text-gray-600">Finding the best route for you...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-8 text-center">
        <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">
          Enter your origin and destination to find a route
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <div className="bg-primary-600 rounded-lg shadow-sm p-6 text-white">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <MapPin className="w-8 h-8" />
            <div>
              <p className="text-primary-100 text-sm">Route Found</p>
              <p className="text-2xl font-bold">
                {result.segments.length}{' '}
                {result.segments.length === 1 ? 'jeepney' : 'jeepneys'}
              </p>
            </div>
          </div>
          <div className="flex gap-6 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{result.totalStops} stops</span>
            </div>
            {result.transfers > 0 && (
              <div className="flex items-center gap-2">
                <Repeat className="w-4 h-4" />
                <span>{result.transfers} transfer</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Route Segments */}
      <div className="space-y-4">
        {result.segments.map((segment, index) => (
          <div key={index} className="relative">
            <RouteSegmentedCard segment={segment} />
            {index < result.segments.length - 1 && (
              <div className="flex justify-center my-2">
                <div className="bg-accent-100 text-accent-800 px-4 py-2 rounded-full text-sm font-medium">
                  Transfer here →
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

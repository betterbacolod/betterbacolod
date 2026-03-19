import { MapPin } from 'lucide-react';
import type { Segment } from '../../types/jeepneyRoutes';

interface RouteSegmentedCardProps {
  segment: Segment;
}

export default function RouteSegmentedCard({
  segment,
}: RouteSegmentedCardProps) {
  const { route, board, alight, stops, direction } = segment;

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
      {/* Route Header */}
      <div className="bg-primary-600 px-6 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold">{route.code}</h3>
            <p className="text-sm opacity-90">{direction}</p>
          </div>
          <div className="text-right text-sm">
            <p className="opacity-90">{route.schedule[0].frequency}</p>
            <p className="opacity-75">
              {route.schedule[0].start} - {route.schedule[0].end}
            </p>
          </div>
        </div>
      </div>

      {/* Stops */}
      <div className="p-6">
        <div className="space-y-3">
          {/* Boarding Stop */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-primary-700 border-2 border-primary-200" />
              {stops.length > 2 && (
                <div className="w-0.5 h-8 bg-gray-300 my-1" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                Board at: {board.name}
              </p>
            </div>
          </div>

          {/* Intermediate Stops */}
          {stops.length > 2 && (
            <div className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-3 h-3 rounded-full bg-gray-300" />
                {stops.length > 3 && (
                  <div className="w-0.5 h-6 bg-gray-200 my-1" />
                )}
              </div>
              <div className="flex-1 text-sm text-gray-600">
                {stops.length - 2} intermediate stop
                {stops.length - 2 !== 1 ? 's' : ''}
              </div>
            </div>
          )}

          {/* Alighting Stop */}
          <div className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className="w-4 h-4 rounded-full bg-secondary-500 border-2 border-secondary-200" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                Alight at: {alight.name}
              </p>
            </div>
          </div>
        </div>

        {/* Stop Count Badge */}
        <div className="mt-4 inline-flex items-center gap-2 bg-gray-100 px-3 py-1.5 rounded-full text-sm text-gray-700">
          <MapPin className="w-4 h-4" />
          <span>
            {stops.length} stop{stops.length !== 1 ? 's' : ''} on this route
          </span>
        </div>
      </div>
    </div>
  );
}

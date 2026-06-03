import { Layer, Marker, Source } from 'react-map-gl/mapbox';
import 'mapbox-gl/dist/mapbox-gl.css';

// biome-ignore lint/suspicious/noShadowRestrictedNames: Map is exported from react-map-gl
import Map from 'react-map-gl/mapbox';
import { cn } from '../../lib/utils';
import type { Landmark, RouteResult } from '../../types/jeepneyRoutes';

interface MapPlaceHolderProps {
  landmarks?: Landmark[];
  selectedOrigin?: Landmark | null;
  selectedDestination?: Landmark | null;
  routeResult?: RouteResult | null;
  center?: { latitude: number; longitude: number };
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

export default function MapPlaceHolder({
  landmarks = [],
  selectedOrigin,
  selectedDestination,
  routeResult,
  center,
}: MapPlaceHolderProps) {
  const initialView = center
    ? { longitude: center.longitude, latitude: center.latitude, zoom: 13 }
    : { longitude: 122.956, latitude: 10.676, zoom: 13 };

  // Build route path coordinates from segments
  const routeCoordinates =
    routeResult?.segments.flatMap((segment) =>
      segment.stops.map((stop) => [
        stop.coordinates.longitude,
        stop.coordinates.latitude,
      ]),
    ) || [];

  // Add destination as final point if not included
  if (routeResult && selectedDestination) {
    const lastCoord = routeCoordinates[routeCoordinates.length - 1];
    if (
      !lastCoord ||
      lastCoord[0] !== selectedDestination.coordinates.longitude ||
      lastCoord[1] !== selectedDestination.coordinates.latitude
    ) {
      routeCoordinates.push([
        selectedDestination.coordinates.longitude,
        selectedDestination.coordinates.latitude,
      ]);
    }
  }

  // GeoJSON for the route line
  const routeGeoJSON = {
    type: 'Feature' as const,
    properties: {},
    geometry: {
      type: 'LineString' as const,
      coordinates: routeCoordinates,
    },
  };

  const layerStyle = {
    id: 'route-line',
    type: 'line' as const,
    paint: {
      'line-color': '#0052bc',
      'line-width': 4,
      'line-opacity': 0.8,
    },
  };

  return (
    <div className="h-96 w-full rounded-lg overflow-hidden border border-gray-200">
      <Map
        {...initialView}
        mapStyle="mapbox://styles/mapbox/streets-v12"
        mapboxAccessToken={MAPBOX_TOKEN}
        style={{ width: '100%', height: '100%' }}
      >
        {/* Draw route line if we have a result */}
        {routeCoordinates.length > 1 && (
          <Source id="route-source" type="geojson" data={routeGeoJSON}>
            <Layer {...layerStyle} />
          </Source>
        )}

        {/* Origin marker - dark primary */}
        {selectedOrigin && (
          <Marker
            longitude={selectedOrigin.coordinates.longitude}
            latitude={selectedOrigin.coordinates.latitude}
            anchor="bottom"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full border-[3px] border-white flex items-center justify-center text-white text-sm font-bold shadow-lg',
                'bg-primary-700',
              )}
              title={selectedOrigin.name}
            >
              A
            </div>
          </Marker>
        )}

        {/* Destination marker - secondary (orange) */}
        {selectedDestination && (
          <Marker
            longitude={selectedDestination.coordinates.longitude}
            latitude={selectedDestination.coordinates.latitude}
            anchor="bottom"
          >
            <div
              className={cn(
                'w-8 h-8 rounded-full border-[3px] border-white flex items-center justify-center text-white text-sm font-bold shadow-lg',
                'bg-secondary-500',
              )}
              title={selectedDestination.name}
            >
              B
            </div>
          </Marker>
        )}

        {/* Other landmarks as smaller dots */}
        {landmarks
          .filter(
            (l) =>
              l.id !== selectedOrigin?.id && l.id !== selectedDestination?.id,
          )
          .map((landmark) => (
            <Marker
              key={landmark.id}
              longitude={landmark.coordinates.longitude}
              latitude={landmark.coordinates.latitude}
              anchor="center"
            >
              <div
                className="w-3 h-3 rounded-full bg-primary-400 opacity-60"
                title={landmark.name}
              />
            </Marker>
          ))}
      </Map>
    </div>
  );
}

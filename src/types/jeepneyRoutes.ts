export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type Landmark = {
  id: string;
  name: string;
  category: string;
  barangay: string;
  coordinates: Coordinates;
  aliases: string[];
};

export type Stop = {
  id: string;
  name: string;
  landmark: string | null; // Reference to a Landmark by name
  coordinates: Coordinates;
};

export type RouteSchedule = {
  start: string;
  end: string;
  frequency: string;
};

export type JeepneyRoute = {
  id: string;
  code: string; // Bata-Libertad (orange)
  color: string;
  schedule: RouteSchedule[];
  stops: Stop[];
  reversible: boolean;
};

// Route finder output types

export type Segment = {
  route: JeepneyRoute;
  board: Stop;
  alight: Stop;
  stops: Stop[]; // List of stops from board to alight
  direction: string;
};

export type RouteResult = {
  segments: Segment[];
  transfers: number;
  totalStops: number;
};

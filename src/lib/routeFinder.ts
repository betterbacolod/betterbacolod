import { routes } from '../data/routeLoader';
import type {
  JeepneyRoute,
  RouteResult,
  Segment,
} from '../types/jeepneyRoutes';

interface GraphNode {
  stopId: string;
  routeId: string;
}

interface BFSState {
  node: GraphNode;
  path: GraphNode[]; // all nodes visited so far in the path
  transfers: number;
}

/**
 *
 */
function buildLandmarkToStopsMap(): Map<
  string,
  { route: JeepneyRoute; stopIndex: number }[]
> {
  const map = new Map<string, { route: JeepneyRoute; stopIndex: number }[]>();

  for (const route of routes) {
    for (let i = 0; i < route.stops.length; i++) {
      const stop = route.stops[i];
      const key = stop.landmark ?? stop.id; // use stop ID if no landmark

      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push({ route, stopIndex: i });
    }
  }
  return map;
}

export function findRoute(
  originId: string,
  destinationId: string,
): RouteResult | null {
  const landmarkStops = buildLandmarkToStopsMap();

  // Find all starting points (routes and stop indices) for the origin
  const originEntries = landmarkStops.get(originId);
  if (!originEntries || originEntries.length === 0) return null;

  // Find all ending points (routes and stop indices) for the destination
  const destEntries = landmarkStops.get(destinationId);
  if (!destEntries || destEntries.length === 0) return null;

  // Create a set of destination (stopId, routeId) pairs for quick lookup
  const destSet = new Set(
    destEntries.map((e) => `${e.route.stops[e.stopIndex].id}:${e.route.id}`),
  );

  // BFS initialization
  const visited = new Set<string>();
  const queue: BFSState[] = [];

  // Seed the queue with all starting points
  for (const entry of originEntries) {
    const stop = entry.route.stops[entry.stopIndex];
    const node: GraphNode = { stopId: stop.id, routeId: entry.route.id };
    const key = `${node.stopId}:${node.routeId}`;
    visited.add(key);
    queue.push({ node, path: [node], transfers: 0 });
  }

  while (queue.length > 0) {
    const current = queue.shift()!; // FIFO for BFS
    const { node, path, transfers } = current;

    // Check if we've reached a destination
    const nodeKey = `${node.stopId}:${node.routeId}`;
    if (destSet.has(nodeKey)) {
      return buildResult(path);
    }

    const currentRoute = routes.find((r) => r.id === node.routeId)!;
    const currentStopIndex = currentRoute.stops.findIndex(
      (s) => s.id === node.stopId,
    )!;

    // Ride to next/previous stops on the same route
    const neighbors: number[] = [currentStopIndex + 1];
    if (currentRoute.reversible) {
      neighbors.push(currentStopIndex - 1); // also consider reverse direction if route is reversible
    }

    for (const nextIndex of neighbors) {
      if (nextIndex < 0 || nextIndex >= currentRoute.stops.length) continue; // out of bounds

      const nextStop = currentRoute.stops[nextIndex];
      const nextNode: GraphNode = {
        stopId: nextStop.id,
        routeId: currentRoute.id,
      };
      const nextKey = `${nextNode.stopId}:${nextNode.routeId}`;

      if (!visited.has(nextKey)) {
        visited.add(nextKey);
        queue.push({
          node: nextNode,
          path: [...path, nextNode],
          transfers, // same route, no new transfer
        });
      }
    }

    // Consider transfers to a different route at the same stop
    const currentStop = currentRoute.stops[currentStopIndex];
    const transferKey = currentStop.landmark ?? currentStop.id;
    const transferOptions = landmarkStops.get(transferKey) || [];

    for (const option of transferOptions) {
      if (option.route.id === currentRoute.id) continue; // skip same route

      const transferStop = option.route.stops[option.stopIndex];
      const nextNode: GraphNode = {
        stopId: transferStop.id,
        routeId: option.route.id,
      };
      const nextKey = `${nextNode.stopId}:${nextNode.routeId}`;

      if (!visited.has(nextKey)) {
        visited.add(nextKey);
        queue.push({
          node: nextNode,
          path: [...path, nextNode],
          transfers: transfers + 1, // new route, so increment transfer count
        });
      }
    }
  }
  return null; // No route found
}

/**
 * Convert the raw BFS path into a clean RouteResult with segments.
 * A new segment starts every time the routeId changes (= a transfer).
 */
function buildResult(path: GraphNode[]): RouteResult {
  const segments: Segment[] = [];
  let currentSegmentNodes: GraphNode[] = [path[0]];

  for (let i = 1; i < path.length; i++) {
    if (path[i].routeId === path[i - 1].routeId) {
      // Same route and continue the segment
      currentSegmentNodes.push(path[i]);
    } else {
      // Route changed so finalize previous segment, start new one
      segments.push(toSegment(currentSegmentNodes));
      currentSegmentNodes = [path[i]];
    }
  }
  segments.push(toSegment(currentSegmentNodes));

  const totalStops = segments.reduce((sum, seg) => sum + seg.stops.length, 0);

  return {
    segments,
    transfers: segments.length - 1,
    totalStops,
  };
}

/** Convert a list of consecutive GraphNodes (all same route) into a Segment. */
function toSegment(nodes: GraphNode[]): Segment {
  const route = routes.find((r) => r.id === nodes[0].routeId)!;
  const stopIds = nodes.map((n) => n.stopId);
  const stops = stopIds.map((id) => route.stops.find((s) => s.id === id)!);

  const board = stops[0];
  const alight = stops[stops.length - 1];

  // Determine direction from stop order in the route
  const boardIndex = route.stops.findIndex((s) => s.id === board.id);
  const alightIndex = route.stops.findIndex((s) => s.id === alight.id);
  const direction =
    alightIndex > boardIndex
      ? `Towards ${route.stops[route.stops.length - 1].name}`
      : `Towards ${route.stops[0].name}`;

  return { route, board, alight, stops, direction };
}

/**
 * Input: original Landmark, destination Landmark, and a list of all Landmarks
 * 1. Finds all stops near origin (same landmark)
 * 2. Find all stops near destination (same landmark)
 * 3. Build adjacency graph of all stops
 * 4. Run BFS/Dijkstra's to find the shortest path from origin stops to destination stops
 * 5. Return to a list of routes (each route is a list of stops)
 */

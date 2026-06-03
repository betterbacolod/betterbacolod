import yaml from 'js-yaml';
import landMarksYaml from '../../content/routes/landmarks.yaml?raw';
import routesYaml from '../../content/routes/routes.yaml?raw';
import type { JeepneyRoute, Landmark } from '../types/jeepneyRoutes';

interface LandMarksData {
  landmarks: Landmark[];
}

interface RoutesData {
  routes: JeepneyRoute[];
}

const landmarksData = yaml.load(landMarksYaml) as LandMarksData;
const routesData = yaml.load(routesYaml) as RoutesData;

export const landmarks: Landmark[] = landmarksData.landmarks;
export const routes: JeepneyRoute[] = routesData.routes;

/** Find a landmark by its ID */
export function findLandmarkById(id: string): Landmark | undefined {
  return landmarks.find((l) => l.id === id);
}

/** Search landmarks by name or alias */
export function searchLandmarks(query: string): Landmark[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];

  return landmarks.filter((l) => {
    const nameMatch = l.name.toLowerCase().includes(q);
    const aliasMatch = l.aliases.some((alias) =>
      alias.toLowerCase().includes(q),
    );
    const barangayMatch = l.barangay.toLowerCase().includes(q);
    return nameMatch || aliasMatch || barangayMatch;
  });
}

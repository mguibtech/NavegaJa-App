/**
 * Fluvial Navigation Utilities
 * Math for river navigation: haversine, route progress, speed, ETA, heading.
 */

export interface Coordinate {
  latitude: number;
  longitude: number;
}

const EARTH_RADIUS_M = 6_371_000;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Haversine distance between two points in meters */
export function haversineDistance(a: Coordinate, b: Coordinate): number {
  const dLat = toRad(b.latitude - a.latitude);
  const dLng = toRad(b.longitude - a.longitude);
  const sinLat = Math.sin(dLat / 2);
  const sinLng = Math.sin(dLng / 2);
  const c =
    sinLat * sinLat +
    Math.cos(toRad(a.latitude)) *
      Math.cos(toRad(b.latitude)) *
      sinLng *
      sinLng;
  return 2 * EARTH_RADIUS_M * Math.atan2(Math.sqrt(c), Math.sqrt(1 - c));
}

/** Total route length in meters */
export function routeLength(route: Coordinate[]): number {
  let total = 0;
  for (let i = 0; i < route.length - 1; i++) {
    total += haversineDistance(route[i], route[i + 1]);
  }
  return total;
}

/** Project a point onto segment AB, clamped to the segment (in degree space, fine for short segments). */
function projectPointToSegment(
  p: Coordinate,
  a: Coordinate,
  b: Coordinate,
): Coordinate {
  const ax = a.longitude;
  const ay = a.latitude;
  const bx = b.longitude;
  const by = b.latitude;
  const px = p.longitude;
  const py = p.latitude;
  const abx = bx - ax;
  const aby = by - ay;
  const abLenSq = abx * abx + aby * aby;
  if (abLenSq === 0) {return a;}
  const t = Math.max(0, Math.min(1, ((px - ax) * abx + (py - ay) * aby) / abLenSq));
  return {latitude: ay + t * aby, longitude: ax + t * abx};
}

/**
 * Find the closest point on a polyline to the given position.
 * Returns the segment index and the projected (snapped) coordinate.
 */
export function findClosestPointOnRoute(
  position: Coordinate,
  route: Coordinate[],
): {segmentIndex: number; projectedPoint: Coordinate; distanceFromRoute: number} {
  let bestDist = Infinity;
  let bestSegment = 0;
  let bestProjected: Coordinate = route[0];

  for (let i = 0; i < route.length - 1; i++) {
    const projected = projectPointToSegment(position, route[i], route[i + 1]);
    const dist = haversineDistance(position, projected);
    if (dist < bestDist) {
      bestDist = dist;
      bestSegment = i;
      bestProjected = projected;
    }
  }

  return {
    segmentIndex: bestSegment,
    projectedPoint: bestProjected,
    distanceFromRoute: bestDist,
  };
}

/** Distance remaining from projectedPoint on segmentIndex to end of route, in meters */
export function distanceRemainingOnRoute(
  route: Coordinate[],
  segmentIndex: number,
  projectedPoint: Coordinate,
): number {
  let total = haversineDistance(projectedPoint, route[segmentIndex + 1] ?? projectedPoint);
  for (let i = segmentIndex + 1; i < route.length - 1; i++) {
    total += haversineDistance(route[i], route[i + 1]);
  }
  return total;
}

/** Compass bearing from a → b in degrees (0 = north, 90 = east) */
export function bearing(a: Coordinate, b: Coordinate): number {
  const dLng = toRad(b.longitude - a.longitude);
  const lat1 = toRad(a.latitude);
  const lat2 = toRad(b.latitude);
  const y = Math.sin(dLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Moving average position smoother (last `window` positions) */
export function smoothPosition(history: Coordinate[], window: number = 5): Coordinate {
  const recent = history.slice(-window);
  const lat = recent.reduce((s, p) => s + p.latitude, 0) / recent.length;
  const lng = recent.reduce((s, p) => s + p.longitude, 0) / recent.length;
  return {latitude: lat, longitude: lng};
}

/** Instant speed in km/h from two positions and elapsed seconds */
export function calculateSpeed(
  prev: Coordinate,
  curr: Coordinate,
  elapsedSeconds: number,
): number {
  if (elapsedSeconds <= 0) {return 0;}
  return (haversineDistance(prev, curr) / elapsedSeconds) * 3.6;
}

/** ETA Date given remaining distance (m) and speed (km/h). Returns null if speed < 2 km/h. */
export function calculateETA(distanceM: number, speedKmh: number): Date | null {
  if (speedKmh < 2) {return null;}
  const eta = new Date();
  eta.setSeconds(eta.getSeconds() + (distanceM / 1000 / speedKmh) * 3600);
  return eta;
}

/** Human-readable distance string */
export function formatDistance(meters: number): string {
  if (meters < 1000) {return `${Math.round(meters)} m`;}
  return `${(meters / 1000).toFixed(1)} km`;
}

/** Human-readable duration from seconds */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {return `< 1 min`;}
  if (seconds < 3600) {return `${Math.round(seconds / 60)} min`;}
  const h = Math.floor(seconds / 3600);
  const m = Math.round((seconds % 3600) / 60);
  return `${h}h ${m}min`;
}

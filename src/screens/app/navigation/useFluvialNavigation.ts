import {useCallback, useRef, useState} from 'react';

import {
  Coordinate,
  findClosestPointOnRoute,
  distanceRemainingOnRoute,
  bearing,
  smoothPosition,
  calculateSpeed,
  calculateETA,
  haversineDistance,
  routeLength,
} from './fluvialNavigationUtils';
import {DangerZone, AMAZON_DANGER_ZONES} from './dangerZones';

// 1.5 km off the polyline = "off-route" warning (rivers are wide)
const OFF_ROUTE_THRESHOLD_M = 1500;
// Alert when within 2 km of a danger zone boundary
const DANGER_ALERT_DISTANCE_M = 2000;
// Speed smoothing: 30% new sample weight
const SPEED_ALPHA = 0.3;
// Minimum movement to update heading (avoids jitter at rest)
const HEADING_MIN_MOVE_M = 15;

export interface NearbyZone {
  zone: DangerZone;
  distanceM: number; // distance from current pos to zone boundary (0 = inside)
}

export interface FluvialNavState {
  smoothedPosition: Coordinate | null;
  heading: number;       // degrees (0 = north)
  speed: number;         // km/h (EWM smoothed)
  distanceRemaining: number; // meters to destination
  eta: Date | null;
  isOffRoute: boolean;
  progress: number;      // 0 (start) → 1 (arrived)
  nearbyZones: NearbyZone[];
}

const INITIAL_STATE: FluvialNavState = {
  smoothedPosition: null,
  heading: 0,
  speed: 0,
  distanceRemaining: 0,
  eta: null,
  isOffRoute: false,
  progress: 0,
  nearbyZones: [],
};

export function useFluvialNavigation(route: Coordinate[]) {
  // Use refs for values needed inside the callback to avoid stale closures
  const historyRef = useRef<{coord: Coordinate; ts: number}[]>([]);
  const routeTotalRef = useRef<number>(0);
  const headingRef = useRef<number>(0);
  const speedRef = useRef<number>(0);

  const [navState, setNavState] = useState<FluvialNavState>(INITIAL_STATE);

  const updatePosition = useCallback(
    (rawPosition: Coordinate) => {
      const now = Date.now();
      const history = historyRef.current;
      history.push({coord: rawPosition, ts: now});
      if (history.length > 10) {history.shift();}

      // ── 1. Smooth position ────────────────────────────────────────────────
      const smoothed = smoothPosition(history.map(h => h.coord), 5);

      // ── 2. Heading (from last significant movement) ───────────────────────
      if (history.length >= 2) {
        const prev = history[history.length - 2].coord;
        const curr = history[history.length - 1].coord;
        if (haversineDistance(prev, curr) > HEADING_MIN_MOVE_M) {
          headingRef.current = bearing(prev, curr);
        }
      }

      // ── 3. Speed (EWM) ───────────────────────────────────────────────────
      if (history.length >= 2) {
        const a = history[history.length - 2];
        const b = history[history.length - 1];
        const elapsed = (b.ts - a.ts) / 1000;
        if (elapsed > 0) {
          const instant = calculateSpeed(a.coord, b.coord, elapsed);
          speedRef.current =
            speedRef.current * (1 - SPEED_ALPHA) + instant * SPEED_ALPHA;
        }
      }

      // ── 4. Route progress ─────────────────────────────────────────────────
      let distanceRemaining = 0;
      let isOffRoute = false;
      let progress = 0;

      if (route.length >= 2) {
        const {segmentIndex, projectedPoint, distanceFromRoute} =
          findClosestPointOnRoute(smoothed, route);

        isOffRoute = distanceFromRoute > OFF_ROUTE_THRESHOLD_M;
        distanceRemaining = distanceRemainingOnRoute(
          route,
          segmentIndex,
          projectedPoint,
        );

        if (routeTotalRef.current === 0) {
          routeTotalRef.current = routeLength(route);
        }
        const total = routeTotalRef.current;
        progress =
          total > 0
            ? Math.max(0, Math.min(1, (total - distanceRemaining) / total))
            : 0;
      }

      // ── 5. Nearby danger zones ────────────────────────────────────────────
      const nearbyZones: NearbyZone[] = AMAZON_DANGER_ZONES
        .map(zone => ({
          zone,
          distanceM: Math.max(
            0,
            haversineDistance(smoothed, zone.center) - zone.radiusM,
          ),
        }))
        .filter(({distanceM}) => distanceM < DANGER_ALERT_DISTANCE_M)
        .sort((a, b) => a.distanceM - b.distanceM);

      setNavState({
        smoothedPosition: smoothed,
        heading: headingRef.current,
        speed: speedRef.current,
        distanceRemaining,
        eta: calculateETA(distanceRemaining, speedRef.current),
        isOffRoute,
        progress,
        nearbyZones,
      });
    },
    [route],
  );

  return {navState, updatePosition};
}

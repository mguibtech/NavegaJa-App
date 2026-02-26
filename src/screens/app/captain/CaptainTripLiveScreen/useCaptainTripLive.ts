import {useEffect, useMemo, useRef, useState} from 'react';
import {
  PermissionsAndroid,
  Platform,
  Alert,
} from 'react-native';
import Geolocation from '@react-native-community/geolocation';

import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  useUpdateTripLocation,
  useCompleteTrip,
  useNavigationSafety,
  useWeatherAlerts,
  useFloodInundation,
  REGION_COORDINATES,
  Region,
  NavigationSafetyAssessment,
  WeatherAlert,
  SafetyLevel,
  AlertSeverity,
  RISK_FILL,
  RISK_STROKE,
} from '@domain';

import {
  useFluvialNavigation,
  Coordinate,
} from '../../navigation';

type MapType = 'standard' | 'satellite' | 'hybrid' | 'terrain';

import {AppStackParamList} from '@routes';

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_POSITION: Coordinate = {latitude: -3.119, longitude: -60.0217};
const LOCATION_UPDATE_INTERVAL_MS = 30_000;

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function lookupCityCoords(cityName: string): Coordinate | null {
  const normalized = cityName
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
  const entry = REGION_COORDINATES[normalized as Region];
  return entry ? {latitude: entry.lat, longitude: entry.lng} : null;
}

export function buildRoute(origin: string, destination: string): Coordinate[] {
  const a = lookupCityCoords(origin);
  const b = lookupCityCoords(destination);
  if (!a || !b) {return [];}
  const mid: Coordinate = {
    latitude: (a.latitude + b.latitude) / 2,
    longitude: (a.longitude + b.longitude) / 2,
  };
  return [a, mid, b];
}

export const SAFETY_CIRCLE_COLORS: Record<SafetyLevel, {fill: string; stroke: string}> = {
  [SafetyLevel.SAFE]: {fill: 'rgba(16,185,129,0.07)', stroke: 'rgba(16,185,129,0.25)'},
  [SafetyLevel.CAUTION]: {fill: 'rgba(245,158,11,0.07)', stroke: 'rgba(245,158,11,0.25)'},
  [SafetyLevel.WARNING]: {fill: 'rgba(239,68,68,0.09)', stroke: 'rgba(239,68,68,0.30)'},
  [SafetyLevel.DANGER]: {fill: 'rgba(220,38,38,0.13)', stroke: 'rgba(220,38,38,0.45)'},
};

export const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  [AlertSeverity.INFO]: '#3B82F6',
  [AlertSeverity.WARNING]: '#F59E0B',
  [AlertSeverity.SEVERE]: '#EF4444',
  [AlertSeverity.EXTREME]: '#7C3AED',
};

export function useCaptainTripLive() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CaptainTripLive'>>();
  const {tripId, origin, destination} = route.params;

  const tripRoute = useMemo(() => buildRoute(origin, destination), [origin, destination]);
  const originCoords = lookupCityCoords(origin);
  const destCoords = lookupCityCoords(destination);

  const {navState, updatePosition} = useFluvialNavigation(tripRoute);

  const {updateLocation} = useUpdateTripLocation();
  const {completeTrip} = useCompleteTrip();
  const {assess: fetchSafety} = useNavigationSafety();
  const {fetchAlerts} = useWeatherAlerts();

  // Flood inundation polygons — centralizado na posição atual do barco
  const inundPos = navState.smoothedPosition ?? DEFAULT_POSITION;
  const {inundation} = useFloodInundation(inundPos.latitude, inundPos.longitude);

  const watchIdRef = useRef<number | null>(null);
  const updateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rawPositionRef = useRef<Coordinate | null>(null);
  const prevZoneCountRef = useRef<number>(0);

  const [locationReady, setLocationReady] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [isCameraLocked, setIsCameraLocked] = useState(true);
  const [isCompletingTrip, setIsCompletingTrip] = useState(false);

  const [safetyAssessment, setSafetyAssessment] =
    useState<NavigationSafetyAssessment | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);

  useEffect(() => {
    startTracking();
    return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    prevZoneCountRef.current = navState.nearbyZones.length;
  }, [navState.nearbyZones.length]);

  async function requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  }

  async function startTracking() {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      const fallback = DEFAULT_POSITION;
      rawPositionRef.current = fallback;
      updatePosition(fallback);
      setLocationReady(true);
      loadWeatherData(fallback.latitude, fallback.longitude);
      return;
    }

    Geolocation.getCurrentPosition(
      pos => {
        const coords: Coordinate = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        rawPositionRef.current = coords;
        updatePosition(coords);
        setLocationReady(true);
        sendLocationUpdate(coords);
        loadWeatherData(coords.latitude, coords.longitude);
      },
      () => {
        rawPositionRef.current = DEFAULT_POSITION;
        updatePosition(DEFAULT_POSITION);
        setLocationReady(true);
        loadWeatherData(DEFAULT_POSITION.latitude, DEFAULT_POSITION.longitude);
      },
      {enableHighAccuracy: false, timeout: 8000, maximumAge: 10000},
    );

    watchIdRef.current = Geolocation.watchPosition(
      pos => {
        const coords: Coordinate = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        };
        rawPositionRef.current = coords;
        updatePosition(coords);
      },
      () => {},
      {enableHighAccuracy: true, distanceFilter: 20},
    );

    updateTimerRef.current = setInterval(() => {
      if (rawPositionRef.current) {
        sendLocationUpdate(rawPositionRef.current);
      }
    }, LOCATION_UPDATE_INTERVAL_MS);
  }

  function stopTracking() {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (updateTimerRef.current) {
      clearInterval(updateTimerRef.current);
      updateTimerRef.current = null;
    }
  }

  async function sendLocationUpdate(coords: Coordinate) {
    try {
      await updateLocation(tripId, coords.latitude, coords.longitude);
      setLastUpdate(new Date());
    } catch {
      // silently retry on next interval
    }
  }

  async function loadWeatherData(lat: number, lng: number) {
    try {
      const [safety, alerts] = await Promise.all([
        fetchSafety(lat, lng),
        fetchAlerts(lat, lng),
      ]);
      setSafetyAssessment(safety);
      setWeatherAlerts(Array.isArray(alerts) ? alerts : []);
    } catch {
      // weather overlay is optional
    }
  }

  function recenter(mapRef: React.RefObject<any>) {
    const pos = navState.smoothedPosition ?? rawPositionRef.current;
    if (!pos) {return;}
    setIsCameraLocked(true);
    mapRef.current?.animateCamera(
      {center: pos, heading: navState.heading, pitch: 25, zoom: 14, altitude: 4000},
      {duration: 500},
    );
  }

  function toggleMapMode() {
    setMapType((prev: MapType) => (prev === 'standard' ? 'satellite' : 'standard'));
  }

  function handleSOS() {
    Alert.alert(
      'Alerta SOS',
      'Confirma envio de alerta de emergência?',
      [
        {text: 'Cancelar', style: 'cancel'},
        {
          text: 'Enviar SOS',
          style: 'destructive',
          onPress: () => navigation.navigate('SosAlert', {tripId}),
        },
      ],
    );
  }

  function handleCompleteTrip() {
    const label =
      navState.progress >= 0.8 ? 'Confirmar Chegada' : 'Encerrar Viagem';
    const message =
      navState.progress >= 0.8
        ? `Chegou em ${destination}? Confirme o encerramento da viagem.`
        : 'Deseja encerrar a viagem antes de chegar ao destino?';

    Alert.alert(label, message, [
      {text: 'Cancelar', style: 'cancel'},
      {
        text: navState.progress >= 0.8 ? 'Confirmar Chegada' : 'Encerrar',
        style: 'default',
        onPress: async () => {
          setIsCompletingTrip(true);
          try {
            await completeTrip(tripId);
            stopTracking();
            Alert.alert('Viagem encerrada!', `Chegada em ${destination} registrada com sucesso.`, [
              {text: 'OK', onPress: () => navigation.pop(1)},
            ]);
          } catch (err: any) {
            Alert.alert(
              'Erro',
              err?.message || 'Não foi possível encerrar a viagem. Tente novamente.',
            );
            setIsCompletingTrip(false);
          }
        },
      },
    ]);
  }

  function goBack() {
    navigation.goBack();
  }

  // Build weather alert markers
  const weatherAlertMarkers: {
    key: string;
    coord: Coordinate;
    severity: AlertSeverity;
    event: string;
  }[] = [];
  const seenAlertCoords = new Set<string>();
  for (const alert of weatherAlerts) {
    for (const region of alert.regions) {
      const c = lookupCityCoords(region);
      if (!c) {continue;}
      const key = `${c.latitude.toFixed(2)},${c.longitude.toFixed(2)}`;
      if (seenAlertCoords.has(key)) {continue;}
      seenAlertCoords.add(key);
      weatherAlertMarkers.push({key: `${alert.id}-${region}`, coord: c, severity: alert.severity, event: alert.event});
    }
  }

  const safetyColors = safetyAssessment
    ? SAFETY_CIRCLE_COLORS[safetyAssessment.level]
    : null;

  const boatPosition = navState.smoothedPosition ?? rawPositionRef.current ?? DEFAULT_POSITION;

  return {
    // params
    tripId,
    origin,
    destination,
    // map data
    tripRoute,
    originCoords,
    destCoords,
    boatPosition,
    // nav state
    navState,
    // location
    locationReady,
    lastUpdate,
    rawPositionRef,
    // map controls
    mapType,
    isCameraLocked,
    setIsCameraLocked,
    isCompletingTrip,
    // weather
    safetyAssessment,
    weatherAlertMarkers,
    safetyColors,
    // flood inundation
    inundation,
    RISK_FILL,
    RISK_STROKE,
    // handlers
    recenter,
    toggleMapMode,
    handleSOS,
    handleCompleteTrip,
    goBack,
  };
}

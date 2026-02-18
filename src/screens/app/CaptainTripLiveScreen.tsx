import React, {useEffect, useMemo, useRef, useState} from 'react';
import {
  StyleSheet,
  PermissionsAndroid,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  Circle,
  PROVIDER_GOOGLE,
  MapType,
} from 'react-native-maps';
import Geolocation from '@react-native-community/geolocation';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {
  captainAPI,
  weatherAPI,
  REGION_COORDINATES,
  Region,
  NavigationSafetyAssessment,
  WeatherAlert,
  SafetyLevel,
  AlertSeverity,
  SAFETY_LEVEL_CONFIGS,
} from '@domain';
import {AppStackParamList} from '@routes';

import {
  useFluvialNavigation,
  NavigationHUD,
  Coordinate,
  AMAZON_DANGER_ZONES,
  DANGER_ZONE_FILL,
  DANGER_ZONE_STROKE,
  DANGER_ZONE_COLOR,
  DANGER_ZONE_ICON,
} from './navigation';

type Props = NativeStackScreenProps<AppStackParamList, 'CaptainTripLive'>;

// ─── Constants ────────────────────────────────────────────────────────────────
const DEFAULT_POSITION: Coordinate = {latitude: -3.119, longitude: -60.0217};
const LOCATION_UPDATE_INTERVAL_MS = 30_000;

const SAFETY_CIRCLE_COLORS: Record<SafetyLevel, {fill: string; stroke: string}> = {
  [SafetyLevel.SAFE]: {fill: 'rgba(16,185,129,0.07)', stroke: 'rgba(16,185,129,0.25)'},
  [SafetyLevel.CAUTION]: {fill: 'rgba(245,158,11,0.07)', stroke: 'rgba(245,158,11,0.25)'},
  [SafetyLevel.WARNING]: {fill: 'rgba(239,68,68,0.09)', stroke: 'rgba(239,68,68,0.30)'},
  [SafetyLevel.DANGER]: {fill: 'rgba(220,38,38,0.13)', stroke: 'rgba(220,38,38,0.45)'},
};

const ALERT_SEVERITY_COLORS: Record<AlertSeverity, string> = {
  [AlertSeverity.INFO]: '#3B82F6',
  [AlertSeverity.WARNING]: '#F59E0B',
  [AlertSeverity.SEVERE]: '#EF4444',
  [AlertSeverity.EXTREME]: '#7C3AED',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function lookupCityCoords(cityName: string): Coordinate | null {
  const normalized = cityName
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '-');
  const entry = REGION_COORDINATES[normalized as Region];
  return entry ? {latitude: entry.lat, longitude: entry.lng} : null;
}

/**
 * Build a simple river route between two cities.
 * Uses REGION_COORDINATES for endpoints.
 * In production, the backend would supply real river waypoints.
 */
function buildRoute(origin: string, destination: string): Coordinate[] {
  const a = lookupCityCoords(origin);
  const b = lookupCityCoords(destination);
  if (!a || !b) {return [];}
  // Mid-point (in real app: river waypoints from backend)
  const mid: Coordinate = {
    latitude: (a.latitude + b.latitude) / 2,
    longitude: (a.longitude + b.longitude) / 2,
  };
  return [a, mid, b];
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export function CaptainTripLiveScreen({navigation, route}: Props) {
  const {tripId, origin, destination} = route.params;
  const {top, bottom} = useSafeAreaInsets();

  // Route polyline (derived from city coords)
  const tripRoute = useMemo(() => buildRoute(origin, destination), [origin, destination]);
  const originCoords = lookupCityCoords(origin);
  const destCoords = lookupCityCoords(destination);

  // Navigation state from hook
  const {navState, updatePosition} = useFluvialNavigation(tripRoute);

  // Map refs & controls
  const mapRef = useRef<MapView>(null);
  const watchIdRef = useRef<number | null>(null);
  const updateTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const rawPositionRef = useRef<Coordinate | null>(null);

  const [locationReady, setLocationReady] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [mapType, setMapType] = useState<MapType>('standard');
  const [isCameraLocked, setIsCameraLocked] = useState(true);
  const [isCompletingTrip, setIsCompletingTrip] = useState(false);

  // Weather overlay
  const [safetyAssessment, setSafetyAssessment] =
    useState<NavigationSafetyAssessment | null>(null);
  const [weatherAlerts, setWeatherAlerts] = useState<WeatherAlert[]>([]);

  // Previous zone count for vibration alert
  const prevZoneCountRef = useRef<number>(0);

  // ── Effects ──────────────────────────────────────────────────────────────
  useEffect(() => {
    startTracking();
    return () => stopTracking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Camera follow with heading when locked
  useEffect(() => {
    if (navState.smoothedPosition && isCameraLocked) {
      mapRef.current?.animateCamera(
        {
          center: navState.smoothedPosition,
          heading: navState.heading,
          pitch: 25,
          zoom: 14,
          altitude: 4000, // iOS
        },
        {duration: 700},
      );
    }
  }, [navState.smoothedPosition, navState.heading, isCameraLocked]);

  // Track zone count changes (vibration removed — needs VIBRATE permission + rebuild)
  useEffect(() => {
    prevZoneCountRef.current = navState.nearbyZones.length;
  }, [navState.nearbyZones.length]);

  // ── Location ──────────────────────────────────────────────────────────────
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
      await captainAPI.updateTripLocation(tripId, coords.latitude, coords.longitude);
      setLastUpdate(new Date());
    } catch {
      // silently retry on next interval
    }
  }

  async function loadWeatherData(lat: number, lng: number) {
    try {
      const [safety, alerts] = await Promise.all([
        weatherAPI.getNavigationSafety(lat, lng),
        weatherAPI.getAlerts(lat, lng),
      ]);
      setSafetyAssessment(safety);
      setWeatherAlerts(Array.isArray(alerts) ? alerts : []);
    } catch {
      // weather overlay is optional
    }
  }

  // ── Map controls ──────────────────────────────────────────────────────────
  function recenter() {
    const pos = navState.smoothedPosition ?? rawPositionRef.current;
    if (!pos) {return;}
    setIsCameraLocked(true);
    mapRef.current?.animateCamera(
      {center: pos, heading: navState.heading, pitch: 25, zoom: 14, altitude: 4000},
      {duration: 500},
    );
  }

  function toggleMapMode() {
    setMapType(prev => (prev === 'standard' ? 'satellite' : 'standard'));
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
            await captainAPI.updateTripStatus(tripId, 'completed');
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

  // ── Alert markers from weather API ───────────────────────────────────────
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

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box flex={1}>

      {/* Map */}
      {locationReady ? (
        <MapView
          ref={mapRef}
          provider={PROVIDER_GOOGLE}
          style={StyleSheet.absoluteFillObject}
          mapType={mapType}
          initialRegion={{
            latitude: boatPosition.latitude,
            longitude: boatPosition.longitude,
            latitudeDelta: 0.5,
            longitudeDelta: 0.5,
          }}
          showsUserLocation={false}
          showsMyLocationButton={false}
          showsCompass={false}
          showsTraffic={false}
          onPanDrag={() => setIsCameraLocked(false)}>

          {/* ── Route polyline ─────────────────────────────── */}
          {tripRoute.length >= 2 && (
            <Polyline
              coordinates={tripRoute}
              strokeColor="#0a6fbd"
              strokeWidth={5}
              lineDashPattern={[1]}
              geodesic
            />
          )}

          {/* ── Weather safety circle ──────────────────────── */}
          {safetyColors && (
            <Circle
              center={boatPosition}
              radius={30000}
              fillColor={safetyColors.fill}
              strokeColor={safetyColors.stroke}
              strokeWidth={2}
            />
          )}

          {/* ── Static danger zones ────────────────────────── */}
          {AMAZON_DANGER_ZONES.map(zone => (
            <React.Fragment key={zone.id}>
              <Circle
                center={zone.center}
                radius={zone.radiusM}
                fillColor={DANGER_ZONE_FILL[zone.severity]}
                strokeColor={DANGER_ZONE_STROKE[zone.severity]}
                strokeWidth={2}
              />
              <Marker
                coordinate={zone.center}
                title={zone.name}
                description={zone.description}
                anchor={{x: 0.5, y: 0.5}}>
                <Box
                  width={28}
                  height={28}
                  alignItems="center"
                  justifyContent="center"
                  style={{
                    borderRadius: 14,
                    backgroundColor: DANGER_ZONE_COLOR[zone.severity],
                    elevation: 3,
                  }}>
                  <Icon
                    name={DANGER_ZONE_ICON[zone.type]}
                    size={16}
                    color="surface"
                  />
                </Box>
              </Marker>
            </React.Fragment>
          ))}

          {/* ── Weather alert markers ──────────────────────── */}
          {weatherAlertMarkers.map(am => (
            <Marker
              key={am.key}
              coordinate={am.coord}
              title={am.event}
              anchor={{x: 0.5, y: 0.5}}>
              <Box
                width={32}
                height={32}
                alignItems="center"
                justifyContent="center"
                style={{
                  borderRadius: 16,
                  backgroundColor: ALERT_SEVERITY_COLORS[am.severity],
                  elevation: 4,
                }}>
                <Icon name="warning" size={18} color="surface" />
              </Box>
            </Marker>
          ))}

          {/* ── Origin marker ──────────────────────────────── */}
          {originCoords && (
            <Marker
              coordinate={originCoords}
              title={`Origem: ${origin}`}
              anchor={{x: 0.5, y: 0.5}}>
              <Box
                width={40}
                height={40}
                alignItems="center"
                justifyContent="center"
                style={{borderRadius: 20, backgroundColor: '#16a34a', elevation: 5}}>
                <Icon name="place" size={22} color="surface" />
              </Box>
            </Marker>
          )}

          {/* ── Destination marker ─────────────────────────── */}
          {destCoords && (
            <Marker
              coordinate={destCoords}
              title={`Destino: ${destination}`}
              anchor={{x: 0.5, y: 0.5}}>
              <Box
                width={40}
                height={40}
                alignItems="center"
                justifyContent="center"
                style={{borderRadius: 20, backgroundColor: '#dc2626', elevation: 5}}>
                <Icon name="flag" size={22} color="surface" />
              </Box>
            </Marker>
          )}

          {/* ── Boat marker (smoothed position) ───────────── */}
          <Marker
            coordinate={boatPosition}
            title="Sua embarcação"
            description={`${origin} → ${destination}`}
            anchor={{x: 0.5, y: 0.5}}>
            <Box
              width={48}
              height={48}
              borderRadius="s24"
              backgroundColor="secondary"
              alignItems="center"
              justifyContent="center"
              style={{elevation: 8}}>
              <Icon name="directions-boat" size={26} color="surface" />
            </Box>
          </Marker>
        </MapView>
      ) : (
        <Box flex={1} alignItems="center" justifyContent="center" backgroundColor="background">
          <ActivityIndicator size="large" color="#0a6fbd" />
          <Text preset="paragraphSmall" color="textSecondary" mt="s16">
            Obtendo localização...
          </Text>
        </Box>
      )}

      {/* ── Floating header ────────────────────────────────────────────── */}
      <Box
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          paddingTop: top + 8,
          paddingBottom: 12,
          paddingHorizontal: 16,
          backgroundColor: 'rgba(255,255,255,0.95)',
          flexDirection: 'row',
          alignItems: 'center',
        }}>
        <TouchableOpacityBox
          width={40}
          height={40}
          borderRadius="s20"
          backgroundColor="background"
          alignItems="center"
          justifyContent="center"
          mr="s12"
          onPress={() => navigation.goBack()}>
          <Icon name="arrow-back" size={22} color="text" />
        </TouchableOpacityBox>

        <Box flex={1}>
          <Text preset="headingSmall" color="text" bold numberOfLines={1}>
            {origin} → {destination}
          </Text>
          <Box flexDirection="row" alignItems="center" mt="s4">
            <Box
              width={8}
              height={8}
              style={{borderRadius: 4, backgroundColor: '#3b82f6', marginRight: 6}}
            />
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              Em andamento
            </Text>
            {safetyAssessment && (
              <Text
                preset="paragraphCaptionSmall"
                style={{
                  color: SAFETY_LEVEL_CONFIGS[safetyAssessment.level].color,
                  marginLeft: 8,
                }}>
                · {SAFETY_LEVEL_CONFIGS[safetyAssessment.level].label}
              </Text>
            )}
            {lastUpdate && (
              <Text
                preset="paragraphCaptionSmall"
                color="textSecondary"
                style={{marginLeft: 8}}>
                · sync{' '}
                {lastUpdate.toLocaleTimeString('pt-BR', {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </Text>
            )}
          </Box>
        </Box>
      </Box>

      {/* ── NavigationHUD (controls + alerts + bottom panel) ─────────── */}
      {locationReady && (
        <NavigationHUD
          distanceRemaining={navState.distanceRemaining}
          eta={navState.eta}
          speed={navState.speed}
          progress={navState.progress}
          isOffRoute={navState.isOffRoute}
          nearbyZones={navState.nearbyZones}
          origin={origin}
          destination={destination}
          mapMode={mapType === 'standard' ? 'standard' : 'satellite'}
          isCameraLocked={isCameraLocked}
          isCompletingTrip={isCompletingTrip}
          bottom={bottom}
          onSOS={handleSOS}
          onCompleteTrip={handleCompleteTrip}
          onRecenter={recenter}
          onToggleMapMode={toggleMapMode}
          onToggleCameraLock={() => {
            const next = !isCameraLocked;
            setIsCameraLocked(next);
            if (next) {recenter();}
          }}
        />
      )}
    </Box>
  );
}

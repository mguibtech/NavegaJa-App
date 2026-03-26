import React, {useEffect, useRef} from 'react';
import {
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import MapView, {
  Marker,
  Polyline,
  Circle,
  Polygon,
  PROVIDER_GOOGLE,
} from 'react-native-maps';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {SAFETY_LEVEL_CONFIGS} from '@domain';

import {
  NavigationHUD,
  AMAZON_DANGER_ZONES,
  DANGER_ZONE_FILL,
  DANGER_ZONE_STROKE,
  DANGER_ZONE_COLOR,
  DANGER_ZONE_ICON,
} from '../../navigation';

import {
  useCaptainTripLive,
  ALERT_SEVERITY_COLORS,
} from './useCaptainTripLive';

export function CaptainTripLiveScreen() {
  const {top, bottom} = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const {
    origin,
    destination,
    tripRoute,
    originCoords,
    destCoords,
    boatPosition,
    navState,
    locationReady,
    lastUpdate,
    mapType,
    isCameraLocked,
    setIsCameraLocked,
    isCompletingTrip,
    safetyAssessment,
    weatherAlertMarkers,
    safetyColors,
    inundation,
    RISK_FILL,
    RISK_STROKE,
    recenter,
    toggleMapMode,
    handleSOS,
    handleCompleteTrip,
    goBack,
  } = useCaptainTripLive();

  // Camera follow with heading when locked — needs mapRef from screen
  useEffect(() => {
    if (navState.smoothedPosition && isCameraLocked) {
      mapRef.current?.animateCamera(
        {
          center: navState.smoothedPosition,
          heading: navState.heading,
          pitch: 25,
          zoom: 14,
          altitude: 4000,
        },
        {duration: 700},
      );
    }
  }, [navState.smoothedPosition, navState.heading, isCameraLocked]);

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
                  style={[
                    styles.zoneDot,
                    {backgroundColor: DANGER_ZONE_COLOR[zone.severity]},
                  ]}>
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
                style={[
                  styles.weatherMarker,
                  {
                    backgroundColor: ALERT_SEVERITY_COLORS[am.severity],
                  },
                ]}>
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
              style={[styles.markerCircle, {backgroundColor: '#16a34a'}]}>
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
              style={[styles.markerCircle, {backgroundColor: '#dc2626'}]}>
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
              style={styles.boatMarker}>
              <Icon name="directions-boat" size={26} color="surface" />
            </Box>
          </Marker>

          {/* ── Flood Inundation Polygons — apenas com dados reais do Flood Hub ── */}
          {inundation?.source === 'flood_hub' &&
            inundation.polygons.map(poly => (
              <Polygon
                key={poly.id}
                coordinates={poly.coordinates}
                fillColor={RISK_FILL[poly.risk]}
                strokeColor={RISK_STROKE[poly.risk]}
                strokeWidth={1}
              />
            ))}
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
        backgroundColor="surface"
        style={[styles.headerBar, {paddingTop: top + 8}]}>
        <TouchableOpacityBox
          width={40}
          height={40}
          borderRadius="s20"
          backgroundColor="background"
          alignItems="center"
          justifyContent="center"
          mr="s12"
          onPress={goBack}>
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
              style={[styles.headerDot, {backgroundColor: '#3b82f6'}]}
            />
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              Em andamento
            </Text>
            {safetyAssessment && SAFETY_LEVEL_CONFIGS[safetyAssessment.level] && (
              <Text
                preset="paragraphCaptionSmall"
                style={[
                  styles.headerStatusText,
                  {color: SAFETY_LEVEL_CONFIGS[safetyAssessment.level].color},
                ]}>
                · {SAFETY_LEVEL_CONFIGS[safetyAssessment.level].label}
              </Text>
            )}
            {lastUpdate && (
              <Text
                preset="paragraphCaptionSmall"
                color="textSecondary"
                style={styles.headerTimestamp}>
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
          onRecenter={() => recenter(mapRef)}
          onToggleMapMode={toggleMapMode}
          onToggleCameraLock={() => {
            const next = !isCameraLocked;
            setIsCameraLocked(next);
            if (next) {recenter(mapRef);}
          }}
        />
      )}
    </Box>
  );
}

const styles = StyleSheet.create({
  zoneDot: {
    borderRadius: 14,
    elevation: 3,
  },
  weatherMarker: {
    borderRadius: 16,
    elevation: 4,
  },
  markerCircle: {
    borderRadius: 20,
    elevation: 5,
  },
  boatMarker: {
    elevation: 8,
  },
  headerBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    paddingBottom: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 4,
  },
  headerDot: {
    borderRadius: 4,
    marginRight: 6,
  },
  headerStatusText: {
    marginLeft: 8,
  },
  headerTimestamp: {
    marginLeft: 8,
  },
});

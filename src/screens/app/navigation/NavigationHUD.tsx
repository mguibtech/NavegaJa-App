import React from 'react';
import {StyleSheet} from 'react-native';

import {Box, Icon, Text, TouchableOpacityBox} from '@components';
import {formatDistance} from './fluvialNavigationUtils';
import {NearbyZone} from './useFluvialNavigation';
import {DANGER_ZONE_COLOR, DANGER_ZONE_ICON} from './dangerZones';

interface Props {
  distanceRemaining: number; // meters
  eta: Date | null;
  speed: number;             // km/h
  progress: number;          // 0–1
  isOffRoute: boolean;
  nearbyZones: NearbyZone[];
  origin: string;
  destination: string;
  mapMode: 'standard' | 'satellite';
  isCameraLocked: boolean;
  isCompletingTrip: boolean;
  bottom: number;            // safe area bottom inset
  onSOS: () => void;
  onRecenter: () => void;
  onToggleMapMode: () => void;
  onToggleCameraLock: () => void;
  onCompleteTrip: () => void;
}

function getAlertBannerStyle(bottom: number, backgroundColor: string) {
  return [styles.alertBanner, {bottom: bottom + 220, backgroundColor}];
}

export function NavigationHUD({
  distanceRemaining,
  eta,
  speed,
  progress,
  isCompletingTrip,
  onCompleteTrip,
  isOffRoute,
  nearbyZones,
  origin,
  destination,
  mapMode,
  isCameraLocked,
  bottom,
  onSOS,
  onRecenter,
  onToggleMapMode,
  onToggleCameraLock,
}: Props) {
  const etaStr = eta
    ? eta.toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})
    : '--:--';

  const progressPct = Math.round(progress * 100);
  const closestZone = nearbyZones[0] ?? null;

  return (
    <>
      {/* ── Floating controls (right side) ─────────────────────── */}
      <Box
        style={[styles.floatingControls, {bottom: bottom + 200}]}
        alignItems="center">
        {/* Map mode toggle */}
        <TouchableOpacityBox
          width={44}
          height={44}
          borderRadius="s8"
          backgroundColor="surface"
          alignItems="center"
          justifyContent="center"
          mb="s8"
          onPress={onToggleMapMode}
          style={styles.floatingButton}>
          <Icon
            name={mapMode === 'standard' ? 'satellite' : 'map'}
            size={22}
            color="text"
          />
        </TouchableOpacityBox>

        {/* Camera lock toggle */}
        <TouchableOpacityBox
          width={44}
          height={44}
          borderRadius="s8"
          backgroundColor="surface"
          alignItems="center"
          justifyContent="center"
          onPress={onToggleCameraLock}
          style={styles.floatingButton}>
          <Icon
            name={isCameraLocked ? 'navigation' : 'explore'}
            size={22}
            color={isCameraLocked ? 'secondary' : 'textSecondary'}
          />
        </TouchableOpacityBox>
      </Box>

      {/* ── Off-route banner ──────────────────────────────────────────── */}
      {isOffRoute && (
        <Box
          style={getAlertBannerStyle(bottom, '#EF4444')}>
          <Icon name="navigation" size={20} color="surface" />
          <Text
            preset="paragraphSmall"
            bold
            style={styles.alertText}>
            Fora da rota — retorne ao canal principal
          </Text>
        </Box>
      )}

      {/* ── Danger zone alert banner ──────────────────────────────────── */}
      {!isOffRoute && closestZone && (
        <Box
          style={[
            styles.alertBanner,
            {
              bottom: bottom + 220,
              backgroundColor: DANGER_ZONE_COLOR[closestZone.zone.severity],
            },
          ]}>
          <Icon
            name={DANGER_ZONE_ICON[closestZone.zone.type]}
            size={20}
            color="surface"
          />
          <Box flex={1} style={styles.dangerTextWrapper}>
            <Text preset="paragraphSmall" bold style={styles.alertText}>
              {closestZone.distanceM < 100
                ? `⚠ Área de risco — ${closestZone.zone.name}`
                : `⚠ Perigo em ${Math.round(closestZone.distanceM / 100) * 100} m — ${closestZone.zone.name}`}
            </Text>
            <Text
              preset="paragraphCaptionSmall"
              style={styles.alertCaption}
              numberOfLines={1}>
              {closestZone.zone.description}
            </Text>
          </Box>
        </Box>
      )}

      {/* ── Main HUD panel ──────────────────────────────────────────────── */}
      <Box
        backgroundColor="surface"
        style={[styles.hudPanel, {paddingBottom: bottom + 16}]}>

        {/* Drag handle */}
        <Box
          alignSelf="center"
          width={40}
          height={4}
          backgroundColor="border"
          mb="s12"
          style={styles.dragHandle}
        />

        {/* Route label */}
        <Box flexDirection="row" alignItems="center" mb="s12">
          <Box
            width={10}
            height={10}
            style={[styles.routeDot, styles.routeDotStart]}
          />
          <Text
            preset="paragraphCaptionSmall"
            color="textSecondary"
            flex={1}
            numberOfLines={1}>
            {origin}
          </Text>
          <Icon name="arrow-forward" size={14} color="textSecondary" />
          <Box
            width={10}
            height={10}
            style={[styles.routeDot, styles.routeDotEnd]}
          />
          <Text
            preset="paragraphCaptionSmall"
            color="textSecondary"
            numberOfLines={1}>
            {destination}
          </Text>
        </Box>

        {/* Main stats row */}
        <Box flexDirection="row" alignItems="flex-end" mb="s12">
          {/* Distance remaining */}
          <Box flex={1}>
            <Text preset="headingSmall" color="text" bold style={styles.distanceText}>
              {formatDistance(distanceRemaining)}
            </Text>
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              restantes · chegada às {etaStr}
            </Text>
          </Box>
          {/* Speed */}
          <Box alignItems="flex-end">
            <Text
              preset="headingSmall"
              color="secondary"
              bold
              style={styles.speedText}>
              {Math.round(speed)}
            </Text>
            <Text preset="paragraphCaptionSmall" color="textSecondary">
              km/h
            </Text>
          </Box>
        </Box>

        {/* Progress bar */}
        <Box
          height={6}
          backgroundColor="border"
          mb="s16"
          overflow="hidden"
          style={styles.progressTrack}>
          <Box
            height={6}
            backgroundColor="secondary"
            style={[styles.progressFill, {width: `${progressPct}%`}]}
          />
        </Box>

        {/* Action buttons: [SOS] [Encerrar Viagem] [Recenter] */}
        <Box flexDirection="row" alignItems="center">
          {/* SOS */}
          <TouchableOpacityBox
            width={52}
            height={52}
            borderRadius="s12"
            alignItems="center"
            justifyContent="center"
            mr="s8"
            onPress={onSOS}
            style={[styles.actionButton, styles.sosButton]}>
            <Icon name="sos" size={24} color="surface" />
          </TouchableOpacityBox>

          {/* Encerrar Viagem */}
          <TouchableOpacityBox
            flex={1}
            height={52}
            borderRadius="s12"
            alignItems="center"
            justifyContent="center"
            flexDirection="row"
            mr="s8"
            onPress={onCompleteTrip}
            disabled={isCompletingTrip}
            style={[
              styles.completeButton,
              progress >= 0.8 ? styles.completeReady : styles.completeDefault,
              isCompletingTrip && styles.disabledButton,
            ]}>
            <Icon
              name={isCompletingTrip ? 'hourglass-top' : 'flag-circle'}
              size={22}
              color="surface"
            />
            <Text
              preset="paragraphSmall"
              bold
              style={styles.completeButtonText}>
              {isCompletingTrip
                ? 'Encerrando...'
                : progress >= 0.8
                ? 'Cheguei!'
                : 'Encerrar Viagem'}
            </Text>
          </TouchableOpacityBox>

          {/* Recenter */}
          <TouchableOpacityBox
            width={52}
            height={52}
            borderRadius="s12"
            backgroundColor="background"
            alignItems="center"
            justifyContent="center"
            onPress={onRecenter}
            style={styles.actionButton}>
            <Icon name="my-location" size={24} color="secondary" />
          </TouchableOpacityBox>
        </Box>
      </Box>
    </>
  );
}

const styles = StyleSheet.create({
  floatingControls: {
    position: 'absolute',
    right: 16,
  },
  floatingButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  alertBanner: {
    position: 'absolute',
    left: 16,
    right: 70,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 6,
  },
  alertText: {
    color: '#fff',
    marginLeft: 8,
    flex: 1,
  },
  dangerTextWrapper: {
    marginLeft: 8,
  },
  alertCaption: {
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  hudPanel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
    paddingHorizontal: 20,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: -4},
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  dragHandle: {
    borderRadius: 2,
  },
  routeDot: {
    borderRadius: 5,
  },
  routeDotStart: {
    backgroundColor: '#16a34a',
    marginRight: 6,
  },
  routeDotEnd: {
    backgroundColor: '#dc2626',
    marginLeft: 6,
    marginRight: 6,
  },
  distanceText: {
    fontSize: 32,
    lineHeight: 36,
  },
  speedText: {
    fontSize: 22,
  },
  progressTrack: {
    borderRadius: 3,
  },
  progressFill: {
    borderRadius: 3,
  },
  actionButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  sosButton: {
    backgroundColor: '#dc2626',
  },
  completeButton: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  completeDefault: {
    backgroundColor: '#0a6fbd',
  },
  completeReady: {
    backgroundColor: '#16a34a',
  },
  disabledButton: {
    opacity: 0.6,
  },
  completeButtonText: {
    color: '#fff',
    marginLeft: 6,
  },
});

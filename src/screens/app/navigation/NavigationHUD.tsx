import React from 'react';

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
        style={{position: 'absolute', right: 16, bottom: bottom + 200}}
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
          style={{
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}>
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
          style={{
            elevation: 4,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.2,
            shadowRadius: 4,
          }}>
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
          style={{
            position: 'absolute',
            bottom: bottom + 170,
            left: 16,
            right: 70,
            backgroundColor: '#EF4444',
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            elevation: 6,
          }}>
          <Icon name="navigation" size={20} color="surface" />
          <Text
            preset="paragraphSmall"
            bold
            style={{color: '#fff', marginLeft: 8, flex: 1}}>
            Fora da rota — retorne ao canal principal
          </Text>
        </Box>
      )}

      {/* ── Danger zone alert banner ──────────────────────────────────── */}
      {!isOffRoute && closestZone && (
        <Box
          style={{
            position: 'absolute',
            bottom: bottom + 170,
            left: 16,
            right: 70,
            backgroundColor: DANGER_ZONE_COLOR[closestZone.zone.severity],
            borderRadius: 12,
            padding: 12,
            flexDirection: 'row',
            alignItems: 'center',
            elevation: 6,
          }}>
          <Icon
            name={DANGER_ZONE_ICON[closestZone.zone.type]}
            size={20}
            color="surface"
          />
          <Box flex={1} style={{marginLeft: 8}}>
            <Text preset="paragraphSmall" bold style={{color: '#fff'}}>
              {closestZone.distanceM < 100
                ? `⚠ Área de risco — ${closestZone.zone.name}`
                : `⚠ Perigo em ${Math.round(closestZone.distanceM / 100) * 100} m — ${closestZone.zone.name}`}
            </Text>
            <Text
              preset="paragraphCaptionSmall"
              style={{color: 'rgba(255,255,255,0.85)', marginTop: 2}}
              numberOfLines={1}>
              {closestZone.zone.description}
            </Text>
          </Box>
        </Box>
      )}

      {/* ── Main HUD panel ──────────────────────────────────────────────── */}
      <Box
        backgroundColor="surface"
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          borderTopLeftRadius: 24,
          borderTopRightRadius: 24,
          paddingTop: 16,
          paddingHorizontal: 20,
          paddingBottom: bottom + 16,
          elevation: 12,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: -4},
          shadowOpacity: 0.15,
          shadowRadius: 12,
        }}>

        {/* Drag handle */}
        <Box
          alignSelf="center"
          width={40}
          height={4}
          backgroundColor="border"
          mb="s12"
          style={{borderRadius: 2}}
        />

        {/* Route label */}
        <Box flexDirection="row" alignItems="center" mb="s12">
          <Box
            width={10}
            height={10}
            style={{borderRadius: 5, backgroundColor: '#16a34a', marginRight: 6}}
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
            style={{borderRadius: 5, backgroundColor: '#dc2626', marginLeft: 6, marginRight: 6}}
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
            <Text
              preset="headingSmall"
              color="text"
              bold
              style={{fontSize: 32, lineHeight: 36}}>
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
              style={{fontSize: 22}}>
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
          style={{borderRadius: 3}}>
          <Box
            height={6}
            backgroundColor="secondary"
            style={{borderRadius: 3, width: `${progressPct}%`}}
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
            style={{backgroundColor: '#dc2626'}}>
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
            style={{
              backgroundColor: progress >= 0.8 ? '#16a34a' : '#0a6fbd',
              opacity: isCompletingTrip ? 0.6 : 1,
            }}>
            <Icon
              name={isCompletingTrip ? 'hourglass-top' : 'flag-circle'}
              size={22}
              color="surface"
            />
            <Text
              preset="paragraphSmall"
              bold
              style={{color: '#fff', marginLeft: 6}}>
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
            onPress={onRecenter}>
            <Icon name="my-location" size={24} color="secondary" />
          </TouchableOpacityBox>
        </Box>
      </Box>
    </>
  );
}

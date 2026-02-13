import React, {useEffect, useRef} from 'react';
import {Animated} from 'react-native';

import {Box} from '../Box/Box';

export interface SkeletonProps {
  /**
   * Largura do skeleton
   */
  width?: number | `${number}%`;

  /**
   * Altura do skeleton
   */
  height?: number;

  /**
   * Raio da borda
   */
  borderRadius?: number;

  /**
   * Se deve animar (padrão: true)
   */
  animate?: boolean;

  /**
   * Margin bottom
   */
  mb?: string;
}

export function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 8,
  animate = true,
  mb,
}: SkeletonProps) {
  const opacity = useRef(new Animated.Value(0.3)).current;

  useEffect(() => {
    if (animate) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      ).start();
    }
  }, [animate, opacity]);

  return (
    <Box mb={mb as any}>
      <Animated.View
        style={{
          opacity,
          width,
          height,
          borderRadius,
          backgroundColor: '#E5E7EB',
        }}
      />
    </Box>
  );
}

/**
 * Skeleton para card de viagem
 */
export function TripCardSkeleton() {
  return (
    <Box
      mb="s16"
      backgroundColor="surface"
      borderRadius="s16"
      padding="s20"
      style={{
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 3,
      }}>
      {/* Date Badge */}
      <Skeleton width={80} height={28} borderRadius={8} mb="s12" />

      {/* Time & Duration */}
      <Box flexDirection="row" alignItems="center" mb="s16">
        <Box flex={1}>
          <Skeleton width={60} height={14} borderRadius={6} mb="s4" />
          <Skeleton width={80} height={24} borderRadius={8} />
        </Box>

        <Box alignItems="center" mx="s12">
          <Skeleton width={20} height={20} borderRadius={10} />
          <Skeleton width={40} height={12} borderRadius={6} mb="s4" />
        </Box>

        <Box flex={1} alignItems="flex-end">
          <Skeleton width={60} height={14} borderRadius={6} mb="s4" />
          <Skeleton width={80} height={24} borderRadius={8} />
        </Box>
      </Box>

      {/* Boat & Captain */}
      <Box
        flexDirection="row"
        alignItems="center"
        mb="s12"
        paddingVertical="s12"
        paddingHorizontal="s16"
        backgroundColor="background"
        borderRadius="s12">
        <Skeleton width={20} height={20} borderRadius={10} />
        <Box flex={1} ml="s12">
          <Skeleton width="70%" height={16} borderRadius={6} mb="s4" />
          <Skeleton width="50%" height={14} borderRadius={6} />
        </Box>
        <Skeleton width={100} height={14} borderRadius={6} />
      </Box>

      {/* Price & Seats */}
      <Box
        flexDirection="row"
        alignItems="center"
        justifyContent="space-between">
        <Box flex={1}>
          <Skeleton width={120} height={28} borderRadius={8} />
        </Box>
        <Skeleton width={140} height={32} borderRadius={8} />
      </Box>
    </Box>
  );
}

/**
 * Skeleton para lista de viagens
 */
export function TripListSkeleton({count = 3}: {count?: number}) {
  return (
    <>
      {Array.from({length: count}).map((_, index) => (
        <TripCardSkeleton key={index} />
      ))}
    </>
  );
}

/**
 * Skeleton para detalhes da viagem
 */
export function TripDetailsSkeleton() {
  return (
    <Box padding="s24">
      {/* Trip Info Card */}
      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        mb="s16"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Box flexDirection="row" alignItems="center" mb="s16">
          <Skeleton width={56} height={56} borderRadius={12} />
          <Box flex={1} ml="s16">
            <Skeleton width="80%" height={20} borderRadius={8} mb="s8" />
            <Skeleton width="60%" height={16} borderRadius={6} />
          </Box>
        </Box>

        <Box
          backgroundColor="background"
          padding="s16"
          borderRadius="s12"
          mb="s12">
          <Skeleton width="100%" height={18} borderRadius={6} mb="s8" />
          <Skeleton width="80%" height={16} borderRadius={6} />
        </Box>

        <Skeleton width={120} height={36} borderRadius={12} />
      </Box>

      {/* Captain Info Card */}
      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        mb="s16"
        style={{
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Skeleton width={80} height={18} borderRadius={6} mb="s16" />

        <Box flexDirection="row" alignItems="center">
          <Skeleton width={56} height={56} borderRadius={28} />
          <Box flex={1} ml="s16">
            <Skeleton width="70%" height={18} borderRadius={6} mb="s8" />
            <Skeleton width="50%" height={14} borderRadius={6} />
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

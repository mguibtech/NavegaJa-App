import React, {useEffect, useRef} from 'react';
import {Animated, StyleSheet} from 'react-native';

import {Box} from '../Box/Box';

export interface SkeletonProps {
  width?: number | `${number}%`;
  height?: number;
  borderRadius?: number;
  animate?: boolean;
  mb?: string;
}

const styles = StyleSheet.create({
  badgeCircle: {
    backgroundColor: '#E5E7EB',
  },
  card: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  forecastCard: {
    width: 110,
    elevation: 2,
  },
  line: {
    backgroundColor: '#E5E7EB',
  },
  loadingBlock: {
    opacity: 0.5,
  },
  riverBar: {
    borderRadius: 4,
  },
  smallCard: {
    elevation: 2,
  },
});

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

  const skeletonStyle = {
    opacity,
    width,
    height,
    borderRadius,
  };

  return (
    <Box mb={mb as any}>
      <Animated.View style={[styles.line, skeletonStyle]} />
    </Box>
  );
}

export function TripCardSkeleton() {
  return (
    <Box
      mb="s16"
      backgroundColor="surface"
      borderRadius="s16"
      padding="s20"
      style={styles.card}>
      <Skeleton width={80} height={28} borderRadius={8} mb="s12" />

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

      <Box
        flexDirection="row"
        alignItems="center"
        mb="s12"
        py="s12"
        px="s16"
        backgroundColor="background"
        borderRadius="s12">
        <Skeleton width={20} height={20} borderRadius={10} />
        <Box flex={1} ml="s12">
          <Skeleton width="70%" height={16} borderRadius={6} mb="s4" />
          <Skeleton width="50%" height={14} borderRadius={6} />
        </Box>
        <Skeleton width={100} height={14} borderRadius={6} />
      </Box>

      <Box flexDirection="row" alignItems="center" justifyContent="space-between">
        <Box flex={1}>
          <Skeleton width={120} height={28} borderRadius={8} />
        </Box>
        <Skeleton width={140} height={32} borderRadius={8} />
      </Box>
    </Box>
  );
}

export function BookingCardSkeleton() {
  return (
    <Box
      mb="s16"
      backgroundColor="surface"
      borderRadius="s16"
      padding="s20"
      style={styles.card}>
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s16">
        <Skeleton width={80} height={14} borderRadius={6} />
        <Skeleton width={90} height={24} borderRadius={8} />
      </Box>

      <Box flexDirection="row" alignItems="center" mb="s16">
        <Box flex={1}>
          <Skeleton width={48} height={12} borderRadius={4} mb="s4" />
          <Skeleton width="80%" height={18} borderRadius={6} />
        </Box>
        <Box
          width={40}
          height={40}
          borderRadius="s20"
          mx="s12"
          style={styles.badgeCircle}
        />
        <Box flex={1}>
          <Skeleton width={48} height={12} borderRadius={4} mb="s4" />
          <Skeleton width="80%" height={18} borderRadius={6} />
        </Box>
      </Box>

      <Box
        flexDirection="row"
        alignItems="center"
        mb="s12"
        py="s12"
        px="s16"
        backgroundColor="background"
        borderRadius="s12">
        <Skeleton width={20} height={20} borderRadius={10} />
        <Box flex={1} ml="s8">
          <Skeleton width="70%" height={16} borderRadius={6} />
        </Box>
      </Box>

      <Box flexDirection="row" alignItems="center" mb="s16">
        <Skeleton width={18} height={18} borderRadius={9} />
        <Skeleton width="50%" height={14} borderRadius={6} />
      </Box>

      <Box flexDirection="row" alignItems="center" justifyContent="space-between" pt="s16">
        <Box>
          <Skeleton width={60} height={12} borderRadius={4} mb="s4" />
          <Skeleton width={100} height={22} borderRadius={6} />
        </Box>
        <Skeleton width={120} height={40} borderRadius={8} />
      </Box>
    </Box>
  );
}

export function ShipmentCardSkeleton() {
  return (
    <Box
      mb="s12"
      backgroundColor="surface"
      borderRadius="s16"
      padding="s16"
      mx="s20"
      style={styles.card}>
      <Box flexDirection="row" alignItems="center" justifyContent="space-between" mb="s12">
        <Skeleton width={120} height={16} borderRadius={6} />
        <Skeleton width={80} height={24} borderRadius={8} />
      </Box>

      <Box flexDirection="row" mb="s12">
        <Box flex={1}>
          <Skeleton width={56} height={12} borderRadius={4} mb="s4" />
          <Skeleton width="90%" height={16} borderRadius={6} />
        </Box>
        <Box width={24} alignItems="center" justifyContent="center">
          <Skeleton width={16} height={16} borderRadius={8} />
        </Box>
        <Box flex={1}>
          <Skeleton width={56} height={12} borderRadius={4} mb="s4" />
          <Skeleton width="90%" height={16} borderRadius={6} />
        </Box>
      </Box>

      <Box flexDirection="row" gap="s16">
        <Skeleton width={90} height={14} borderRadius={6} />
        <Skeleton width={80} height={14} borderRadius={6} />
      </Box>
    </Box>
  );
}

export function ShipmentDetailsSkeleton() {
  return (
    <Box padding="s20">
      <Skeleton width={140} height={40} borderRadius={12} mb="s20" />

      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s24"
        mb="s16"
        alignItems="center"
        style={styles.card}>
        <Skeleton width={180} height={180} borderRadius={16} mb="s16" />
        <Skeleton width={160} height={14} borderRadius={6} mb="s6" />
        <Skeleton width={120} height={20} borderRadius={8} />
      </Box>

      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        mb="s16"
        style={styles.card}>
        <Skeleton width={130} height={18} borderRadius={6} mb="s16" />
        <Skeleton width="100%" height={16} borderRadius={6} mb="s10" />
        <Skeleton width="70%" height={16} borderRadius={6} mb="s10" />
        <Skeleton width="90%" height={16} borderRadius={6} />
      </Box>

      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        style={styles.card}>
        <Skeleton width={90} height={18} borderRadius={6} mb="s16" />
        <Skeleton width="100%" height={14} borderRadius={6} mb="s8" />
        <Skeleton width="85%" height={14} borderRadius={6} mb="s8" />
        <Skeleton width="70%" height={14} borderRadius={6} mb="s16" />
        <Skeleton width="100%" height={1} borderRadius={1} mb="s12" />
        <Skeleton width={120} height={24} borderRadius={8} />
      </Box>
    </Box>
  );
}

export function WeatherWidgetSkeleton() {
  return (
    <Box
      backgroundColor="surface"
      borderRadius="s16"
      padding="s20"
      style={styles.card}>
      <Box flexDirection="row" justifyContent="space-between" mb="s16">
        <Box>
          <Skeleton width={70} height={12} borderRadius={4} mb="s6" />
          <Skeleton width={110} height={18} borderRadius={6} />
        </Box>
        <Skeleton width={64} height={28} borderRadius={8} />
      </Box>

      <Box flexDirection="row" alignItems="center" mb="s16">
        <Skeleton width={56} height={56} borderRadius={12} />
        <Box ml="s16" flex={1}>
          <Skeleton width={90} height={32} borderRadius={8} mb="s8" />
          <Skeleton width="60%" height={16} borderRadius={6} mb="s6" />
          <Skeleton width="50%" height={13} borderRadius={4} />
        </Box>
      </Box>

      <Box
        flexDirection="row"
        justifyContent="space-between"
        pt="s12"
        borderTopWidth={1}
        borderTopColor="border">
        <Skeleton width={52} height={16} borderRadius={6} />
        <Skeleton width={72} height={16} borderRadius={6} />
        <Skeleton width={40} height={16} borderRadius={6} />
      </Box>

      <Box flexDirection="row" pt="s12" mt="s8" borderTopWidth={1} borderTopColor="border">
        <Box flex={1}>
          <Skeleton width={64} height={13} borderRadius={4} />
        </Box>
        <Box flex={1} alignItems="center">
          <Skeleton width={60} height={13} borderRadius={4} />
        </Box>
        <Box flex={1} alignItems="flex-end">
          <Skeleton width={70} height={13} borderRadius={4} />
        </Box>
      </Box>

      <Box
        flexDirection="row"
        justifyContent="space-around"
        pt="s12"
        mt="s8"
        borderTopWidth={1}
        borderTopColor="border">
        <Skeleton width={52} height={16} borderRadius={6} />
        <Skeleton width={52} height={16} borderRadius={6} />
        <Skeleton width={70} height={16} borderRadius={6} />
      </Box>
    </Box>
  );
}

export function ForecastCardSkeleton() {
  return (
    <Box
      backgroundColor="surface"
      borderRadius="s16"
      padding="s16"
      mr="s12"
      style={styles.forecastCard}>
      <Skeleton width={56} height={12} borderRadius={4} mb="s8" />
      <Skeleton width={40} height={40} borderRadius={8} mb="s8" />
      <Skeleton width={48} height={18} borderRadius={6} mb="s4" />
      <Skeleton width={40} height={13} borderRadius={4} mb="s4" />
      <Skeleton width={44} height={13} borderRadius={4} mb="s8" />
      <Skeleton width="100%" height={24} borderRadius={8} />
    </Box>
  );
}

export function RiverLevelsSkeleton({count = 3}: {count?: number}) {
  return (
    <Box
      backgroundColor="surface"
      borderRadius="s16"
      padding="s20"
      style={styles.card}>
      <Box flexDirection="row" alignItems="center" mb="s16">
        <Skeleton width={20} height={20} borderRadius={10} />
        <Box flex={1} ml="s8">
          <Skeleton width={120} height={16} borderRadius={6} />
        </Box>
        <Skeleton width={60} height={12} borderRadius={4} />
      </Box>

      {Array.from({length: count}).map((_, index) => (
        <Box key={index}>
          {index > 0 && <Box height={1} backgroundColor="border" my="s12" />}
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Box flex={1} mr="s12">
              <Skeleton width="70%" height={16} borderRadius={6} mb="s6" />
              <Skeleton width="50%" height={13} borderRadius={4} />
            </Box>
            <Box mr="s8">
              <Skeleton width={40} height={13} borderRadius={4} />
            </Box>
            <Skeleton width={64} height={24} borderRadius={8} />
          </Box>
          <Box
            mt="s8"
            height={4}
            backgroundColor="border"
            style={styles.riverBar}
            overflow="hidden">
            <Skeleton
              width={`${30 + index * 20}%`}
              height={4}
              borderRadius={4}
              animate={false}
            />
          </Box>
        </Box>
      ))}
    </Box>
  );
}

export function WeatherAlertCardSkeleton() {
  return (
    <Box
      backgroundColor="surface"
      borderRadius="s12"
      padding="s16"
      mb="s12"
      style={styles.smallCard}>
      <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="s8">
        <Skeleton width="55%" height={16} borderRadius={6} />
        <Skeleton width={64} height={22} borderRadius={8} />
      </Box>
      <Skeleton width="100%" height={14} borderRadius={4} mb="s4" />
      <Skeleton width="80%" height={14} borderRadius={4} mb="s8" />
      <Skeleton width={140} height={12} borderRadius={4} />
    </Box>
  );
}

export function TripListSkeleton({count = 3}: {count?: number}) {
  return (
    <>
      {Array.from({length: count}).map((_, index) => (
        <TripCardSkeleton key={index} />
      ))}
    </>
  );
}

export function TripDetailsSkeleton() {
  return (
    <Box padding="s24">
      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        mb="s16"
        style={styles.card}>
        <Box flexDirection="row" alignItems="center" mb="s16">
          <Skeleton width={56} height={56} borderRadius={12} />
          <Box flex={1} ml="s16">
            <Skeleton width="80%" height={20} borderRadius={8} mb="s8" />
            <Skeleton width="60%" height={16} borderRadius={6} />
          </Box>
        </Box>

        <Box backgroundColor="background" padding="s16" borderRadius="s12" mb="s12">
          <Skeleton width="100%" height={18} borderRadius={6} mb="s8" />
          <Skeleton width="80%" height={16} borderRadius={6} />
        </Box>

        <Skeleton width={120} height={36} borderRadius={12} />
      </Box>

      <Box
        backgroundColor="surface"
        borderRadius="s16"
        padding="s20"
        mb="s16"
        style={styles.card}>
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

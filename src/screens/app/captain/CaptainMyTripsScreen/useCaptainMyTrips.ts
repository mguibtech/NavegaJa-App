import {useCallback, useState} from 'react';
import {useFocusEffect, useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {useCaptainTrips, Trip, TripStatus} from '@domain';
import {useVirtualPagination} from '@hooks';

import {AppStackParamList} from '@routes';

export const STATUS_CONFIG = {
  [TripStatus.SCHEDULED]: {label: 'Agendada', color: 'warning' as const, bg: 'warningBg' as const, icon: 'schedule' as const},
  [TripStatus.IN_PROGRESS]: {label: 'Em andamento', color: 'info' as const, bg: 'infoBg' as const, icon: 'directions-boat' as const},
  [TripStatus.COMPLETED]: {label: 'Concluída', color: 'success' as const, bg: 'successBg' as const, icon: 'check-circle' as const},
  [TripStatus.CANCELLED]: {label: 'Cancelada', color: 'danger' as const, bg: 'dangerBg' as const, icon: 'cancel' as const},
};

export type FilterTab = 'all' | 'active' | 'completed';

export function useCaptainMyTrips() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const [filterTab, setFilterTab] = useState<FilterTab>('all');
  const [refreshing, setRefreshing] = useState(false);
  const {trips, isLoading, fetchMyTrips} = useCaptainTrips();

  useFocusEffect(
    useCallback(() => {
      fetchMyTrips();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  async function onRefresh() {
    setRefreshing(true);
    try {
      await fetchMyTrips();
    } finally {
      setRefreshing(false);
    }
  }

  const filteredTrips = trips.filter(trip => {
    if (filterTab === 'active') {
      return trip.status === TripStatus.SCHEDULED || trip.status === TripStatus.IN_PROGRESS;
    }
    if (filterTab === 'completed') {
      return trip.status === TripStatus.COMPLETED || trip.status === TripStatus.CANCELLED;
    }
    // "Todas" — exclui canceladas
    return trip.status !== TripStatus.CANCELLED;
  });

  const {visibleItems: visibleTrips, hasMore: hasMoreTrips, loadMore: loadMoreTrips} =
    useVirtualPagination(filteredTrips);

  function formatDepartureStr(trip: Trip): string {
    try {
      return format(new Date(trip.departureAt), "dd 'de' MMM, HH:mm", {locale: ptBR});
    } catch {
      return trip.departureAt;
    }
  }

  return {
    navigation,
    filterTab,
    setFilterTab,
    refreshing,
    trips,
    isLoading,
    filteredTrips: visibleTrips,
    hasMoreTrips,
    loadMoreTrips,
    onRefresh,
    formatDepartureStr,
    STATUS_CONFIG,
  };
}

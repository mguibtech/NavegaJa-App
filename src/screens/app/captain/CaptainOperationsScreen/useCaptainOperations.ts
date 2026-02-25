import {useEffect} from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {useCaptainTrips, useMyBoats, TripStatus} from '@domain';

import {AppStackParamList} from '@routes';

export const STATUS_CONFIG = {
  [TripStatus.SCHEDULED]: {label: 'Agendada', color: 'warning' as const, bg: 'warningBg' as const},
  [TripStatus.IN_PROGRESS]: {label: 'Em andamento', color: 'info' as const, bg: 'infoBg' as const},
  [TripStatus.COMPLETED]: {label: 'Concluída', color: 'success' as const, bg: 'successBg' as const},
  [TripStatus.CANCELLED]: {label: 'Cancelada', color: 'danger' as const, bg: 'dangerBg' as const},
};

export function useCaptainOperations() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const {trips, isLoading: tripsLoading, fetchMyTrips} = useCaptainTrips();
  const {boats, isLoading: boatsLoading, fetchBoats} = useMyBoats();

  const isLoading = tripsLoading || boatsLoading;

  useEffect(() => {
    fetchMyTrips();
    fetchBoats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onRefresh() {
    fetchMyTrips();
    fetchBoats();
  }

  const recentTrips = trips.slice(0, 3);

  function formatDepartureStr(departureAt: string): string {
    try {
      return format(new Date(departureAt), "dd/MM/yy 'às' HH:mm", {locale: ptBR});
    } catch {
      return departureAt;
    }
  }

  return {
    navigation,
    trips,
    boats,
    isLoading,
    recentTrips,
    onRefresh,
    formatDepartureStr,
    STATUS_CONFIG,
  };
}

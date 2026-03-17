import {useEffect, useMemo} from 'react';
import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {useCaptainTrips, useMyBoats, useBoatStaff, Trip, TripStatus} from '@domain';
import {useAuthStore} from '@store';

import {AppStackParamList} from '@routes';

export const STATUS_CONFIG = {
  [TripStatus.SCHEDULED]: {label: 'Agendada', color: 'warning' as const, bg: 'warningBg' as const},
  [TripStatus.IN_PROGRESS]: {label: 'Em andamento', color: 'info' as const, bg: 'infoBg' as const},
  [TripStatus.COMPLETED]: {label: 'Concluída', color: 'success' as const, bg: 'successBg' as const},
  [TripStatus.CANCELLED]: {label: 'Cancelada', color: 'danger' as const, bg: 'dangerBg' as const},
};

export function useCaptainOperations() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const user = useAuthStore(s => s.user);
  const isBoatManager = user?.role === 'boat_manager';

  const {trips, isLoading: tripsLoading, fetchMyTrips} = useCaptainTrips();
  const {boats: ownedBoats, isLoading: boatsLoading, fetchBoats} = useMyBoats();
  const {staff, isLoading: staffLoading, refetch: refetchStaff} = useBoatStaff();

  const isLoading = tripsLoading || (isBoatManager ? staffLoading : boatsLoading);

  // boat_manager: listar barcos atribuídos; captain: listar barcos próprios
  const boats = useMemo(() => {
    if (isBoatManager) {
      return staff.filter(s => s.isActive).map(s => s.boat);
    }
    return ownedBoats;
  }, [isBoatManager, staff, ownedBoats]);

  const boatsById = useMemo(() => {
    return new Map(boats.map(boat => [boat.id, boat]));
  }, [boats]);

  useEffect(() => {
    fetchMyTrips();
    if (isBoatManager) {
      refetchStaff();
    } else {
      fetchBoats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function onRefresh() {
    fetchMyTrips();
    if (isBoatManager) {
      refetchStaff();
    } else {
      fetchBoats();
    }
  }

  const recentTrips = trips.filter(t => t.status !== TripStatus.CANCELLED).slice(0, 3);

  function getTripBoatSummary(trip: Trip): string | null {
    const tripBoat = trip.boat ?? boatsById.get(trip.boatId);
    if (!tripBoat) {
      return null;
    }

    if (tripBoat.name && tripBoat.type) {
      return `${tripBoat.name} · ${tripBoat.type}`;
    }

    return tripBoat.name || tripBoat.type || null;
  }

  function formatDepartureStr(departureAt: string): string {
    try {
      return format(new Date(departureAt), "dd/MM/yy 'às' HH:mm", {locale: ptBR});
    } catch {
      return departureAt;
    }
  }

  return {
    navigation,
    isBoatManager,
    trips,
    boats,
    isLoading,
    recentTrips,
    onRefresh,
    formatDepartureStr,
    getTripBoatSummary,
    STATUS_CONFIG,
  };
}

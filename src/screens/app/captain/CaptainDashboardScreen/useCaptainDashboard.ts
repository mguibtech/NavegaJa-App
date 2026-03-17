import {useCallback, useEffect, useRef, useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';

import {useCaptainTrips, Trip, TripStatus, useMyBoats} from '@domain';
import {useAuthStore} from '@store';
import {getUnreadCount} from '@services';

import {AppStackParamList} from '@routes';

export const STATUS_CONFIG = {
  [TripStatus.SCHEDULED]: {label: 'Agendada', color: 'warning' as const, bg: 'warningBg' as const},
  [TripStatus.IN_PROGRESS]: {label: 'Em andamento', color: 'info' as const, bg: 'infoBg' as const},
  [TripStatus.COMPLETED]: {label: 'Concluída', color: 'success' as const, bg: 'successBg' as const},
  [TripStatus.CANCELLED]: {label: 'Cancelada', color: 'danger' as const, bg: 'dangerBg' as const},
};

export function useCaptainDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const user = useAuthStore(s => s.user);
  const loadStoredUser = useAuthStore(s => s.loadStoredUser);
  const {trips, isLoading, fetchMyTrips} = useCaptainTrips();
  const {boats, fetchBoats, isLoading: isBoatsLoading} = useMyBoats();

  const [isRefreshingStatus, setIsRefreshingStatus] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isBoatManager = user?.capabilities?.isBoatManager === true;

  useEffect(() => {
    fetchMyTrips();
    if (!isBoatManager) {
      fetchBoats();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useFocusEffect(
    useCallback(() => {
      getUnreadCount().then(setUnreadNotifications).catch(() => {});
    }, []),
  );

  const canOperate = isBoatManager || !user?.capabilities || user.capabilities.canOperate;
  const isBlocked = !isBoatManager && user?.capabilities && !user.capabilities.canOperate;
  const isRejected = !!isBlocked && !!user?.rejectionReason;
  const isPending = !!isBlocked && !isRejected;

  useEffect(() => {
    if (isPending) {
      pollingRef.current = setInterval(() => {
        loadStoredUser();
      }, 30000);
    }
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [isPending, loadStoredUser]);

  const handleRefresh = useCallback(async () => {
    await Promise.all([fetchMyTrips(), fetchBoats(), loadStoredUser()]);
  }, [fetchMyTrips, fetchBoats, loadStoredUser]);

  async function handleCheckStatus() {
    setIsRefreshingStatus(true);
    try {
      await loadStoredUser();
    } finally {
      setIsRefreshingStatus(false);
    }
  }

  function handleBlockedAction() {
    setShowBlockedModal(true);
  }

  // Trips with status SCHEDULED or IN_PROGRESS are considered “current”; keep array for plural handling.
  const currentTrips = trips
    .filter(t => t.status === TripStatus.IN_PROGRESS || t.status === TripStatus.SCHEDULED)
    .sort((a, b) => {
      try {
        return new Date(a.departureAt).getTime() - new Date(b.departureAt).getTime();
      } catch {
        return 0;
      }
    });

  const completedToday = trips.filter(t => {
    if (t.status !== TripStatus.COMPLETED) return false;
    const today = new Date().toDateString();
    return new Date(t.updatedAt).toDateString() === today;
  }).length;

  const pendingBoats = isBoatManager || isBoatsLoading ? [] : boats.filter(b => !b.isVerified && !b.rejectionReason);
  const rejectedBoats = isBoatManager || isBoatsLoading ? [] : boats.filter(b => !b.isVerified && !!b.rejectionReason);

export function formatDeparture(trip: Trip) {
  try {
    return format(new Date(trip.departureAt), "dd/MM 'às' HH:mm", {locale: ptBR});
  } catch {
    return trip.departureAt;
  }
}

  return {
    navigation,
    user,
    trips,
    boats,
    isLoading,
    isBoatsLoading,
    isRefreshingStatus,
    showBlockedModal,
    setShowBlockedModal,
    unreadNotifications,
    isBoatManager,
    canOperate,
    isBlocked,
    isRejected,
    isPending,
    currentTrips,
    completedToday,
    pendingBoats,
    rejectedBoats,
    handleRefresh,
    handleCheckStatus,
    handleBlockedAction,
    formatDeparture,
    STATUS_CONFIG,
  };
}

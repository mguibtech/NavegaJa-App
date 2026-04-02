import {useCallback} from 'react';
import {format} from 'date-fns';
import {ptBR} from 'date-fns/locale';
import {useState} from 'react';

import {useFocusEffect} from '@react-navigation/native';
import {useNavigation} from '@react-navigation/native';
import {useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  useTripDetails,
  useCompleteTrip,
  useCancelTrip,
  useTripManage,
  tripAcceptsShipments,
  getTripShipmentPricePerKg,
  TripStatus,
  ShipmentStatus,
} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

export const STATUS_CONFIG = {
  [TripStatus.SCHEDULED]: {label: 'Agendada', color: 'warning' as const, bg: 'warningBg' as const},
  [TripStatus.IN_PROGRESS]: {label: 'Em andamento', color: 'info' as const, bg: 'infoBg' as const},
  [TripStatus.COMPLETED]: {label: 'Concluída', color: 'success' as const, bg: 'successBg' as const},
  [TripStatus.CANCELLED]: {label: 'Cancelada', color: 'danger' as const, bg: 'dangerBg' as const},
};

export const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  [ShipmentStatus.PENDING]: 'Pendente',
  [ShipmentStatus.PAID]: 'Pago',
  [ShipmentStatus.COLLECTED]: 'Coletado',
  [ShipmentStatus.IN_TRANSIT]: 'Em trânsito',
  [ShipmentStatus.ARRIVED]: 'Chegou',
  [ShipmentStatus.OUT_FOR_DELIVERY]: 'Saiu p/ entrega',
  [ShipmentStatus.DELIVERED]: 'Entregue',
  [ShipmentStatus.CANCELLED]: 'Cancelado',
};

export function useCaptainTripManage() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'CaptainTripManage'>>();
  const {tripId} = route.params;
  const toast = useToast();

  const {trip, isLoading: tripLoading, getTripById: fetchTrip} = useTripDetails(tripId);
  const {completeTrip, isLoading: completeLoading} = useCompleteTrip();
  const {cancelTrip, isLoading: cancelLoading} = useCancelTrip();
  const {manageData, isLoading: manageLoading, isError: manageError, refetch: refetchManage} = useTripManage(tripId);

  const [refreshing, setRefreshing] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  useFocusEffect(
    useCallback(() => {
      fetchTrip(tripId);
      refetchManage();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tripId]),
  );

  async function onRefresh() {
    setRefreshing(true);
    try {
      await Promise.all([fetchTrip(tripId), refetchManage()]);
    } finally {
      setRefreshing(false);
    }
  }

  async function handleCompleteTrip() {
    setShowCompleteModal(false);
    try {
      await completeTrip(tripId);
      toast.showSuccess('Viagem concluída!');
      fetchTrip(tripId);
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao concluir viagem');
    }
  }

  async function handleCancelTrip() {
    setShowCancelModal(false);
    try {
      await cancelTrip(tripId);
      toast.showSuccess('Viagem cancelada.');
      navigation.goBack();
    } catch (err: any) {
      toast.showError(err?.message || 'Erro ao cancelar viagem');
    }
  }

  function formatDate(dateStr: string) {
    try {
      return format(new Date(dateStr), "dd 'de' MMM 'às' HH:mm", {locale: ptBR});
    } catch {
      return dateStr;
    }
  }

  function goBack() {
    navigation.goBack();
  }

  function navigateToChecklist() {
    navigation.navigate('CaptainChecklist', {tripId});
  }

  function navigateToShipmentCollect(shipmentId: string, validationCode?: string) {
    navigation.navigate('CaptainShipmentCollect', {shipmentId, validationCode});
  }

  function navigateToTripLive() {
    if (!trip) {return;}
    navigation.navigate('CaptainTripLive', {
      tripId: trip.id,
      origin: trip.origin,
      destination: trip.destination,
    });
  }

  function navigateToChat(bookingId: string, passengerName?: string) {
    navigation.navigate('Chat', {bookingId, otherName: passengerName});
  }

  function navigateToScanQR() {
    navigation.navigate('ScanBookingQR', {tripId});
  }

  const isActionLoading = completeLoading || cancelLoading;

  const passengers = manageData?.passageiros ?? [];
  const shipments = manageData?.encomendas ?? [];
  const shipmentPolicySource = trip
    ? trip
    : manageData
    ? {
        acceptsShipments: manageData.acceptsShipments,
        cargoPriceKg: manageData.cargoPriceKg ?? null,
        shipmentPricePerKg: manageData.shipmentPricePerKg ?? null,
      }
    : null;
  const acceptsShipments = tripAcceptsShipments(shipmentPolicySource);
  const shipmentPricePerKg = getTripShipmentPricePerKg(shipmentPolicySource);

  return {
    // data
    trip,
    tripLoading,
    manageData,
    manageLoading,
    manageError,
    passengers,
    shipments,
    acceptsShipments,
    shipmentPricePerKg,
    refreshing,
    completeLoading,
    isActionLoading,
    showCompleteModal,
    setShowCompleteModal,
    showCancelModal,
    setShowCancelModal,
    // handlers
    onRefresh,
    handleCompleteTrip,
    handleCancelTrip,
    formatDate,
    goBack,
    navigateToChecklist,
    navigateToShipmentCollect,
    navigateToTripLive,
    navigateToChat,
    navigateToScanQR,
  };
}

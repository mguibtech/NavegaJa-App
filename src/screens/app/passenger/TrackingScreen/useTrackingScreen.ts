import {useEffect, useRef, useState} from 'react';
import {Linking} from 'react-native';
import MapView from 'react-native-maps';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {SosAlert, SosStatus, useTrackBooking, TrackingStatus, useSosAlert} from '@domain';
import {AppStackParamList} from '@routes';

// Coordenadas padrão (Manaus → Parintins) - fallback quando API não tem coordenadas
const MANAUS_COORDS = {latitude: -3.119, longitude: -60.0217};
const PARINTINS_COORDS = {latitude: -2.6283, longitude: -56.7358};

export function useTrackingScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'Tracking'>>();
  const {bookingId} = route.params;

  const mapRef = useRef<MapView>(null);

  const {trackingInfo, isLoading, error, refetch} = useTrackBooking(bookingId);
  const {alerts} = useSosAlert();
  const mySosAlerts = alerts.filter(a => a.status === SosStatus.ACTIVE);

  const [showSosAlerts, setShowSosAlerts] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);

  // Modal state
  const [showCallCaptainModal, setShowCallCaptainModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showSosDetailModal, setShowSosDetailModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedSosAlert, setSelectedSosAlert] = useState<SosAlert | null>(null);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  const trip = trackingInfo?.booking.trip;
  const booking = trackingInfo?.booking;

  // Resolve origin/destination coordinates
  const originCoords = MANAUS_COORDS;
  const destinationCoords = PARINTINS_COORDS;

  // Boat position: prefer real GPS from trip, otherwise interpolate from progress
  const progress = trackingInfo?.progressPercent ?? 0;
  const currentPosition =
    trackingInfo?.currentLat != null && trackingInfo?.currentLng != null
      ? {latitude: trackingInfo.currentLat, longitude: trackingInfo.currentLng}
      : {
          latitude:
            originCoords.latitude +
            (destinationCoords.latitude - originCoords.latitude) *
              (progress / 100),
          longitude:
            originCoords.longitude +
            (destinationCoords.longitude - originCoords.longitude) *
              (progress / 100),
        };

  const routeCoordinates = [originCoords, currentPosition, destinationCoords];

  const handleRefresh = () => {
    refetch();
  };

  const handleCallCaptain = () => {
    setShowCallCaptainModal(true);
  };

  const handleEmergency = () => {
    setShowEmergencyModal(true);
  };

  const handleSosPress = () => {
    navigation.navigate('SosAlert', {tripId: bookingId});
  };

  const handleSosMarkerPress = (alert: SosAlert) => {
    setSelectedSosAlert(alert);
    setShowSosDetailModal(true);
  };

  const handleSafetyOverlayPress = () => {
    setShowSafetyModal(true);
  };

  const calculateNearbyAlerts = () => {
    return mySosAlerts.length;
  };

  const getStatusLabel = (status: TrackingStatus): string => {
    switch (status) {
      case 'scheduled':
        return 'Aguardando Partida';
      case 'boarding':
        return 'Embarque em Andamento';
      case 'in_transit':
        return 'Em Trânsito';
      case 'approaching':
        return 'Chegando ao Destino';
      case 'arrived':
        return 'Chegou ao Destino';
      case 'cancelled':
        return 'Viagem Cancelada';
    }
  };

  const getStatusColor = (
    status: TrackingStatus,
  ): 'success' | 'warning' | 'danger' | 'primary' => {
    switch (status) {
      case 'scheduled':
        return 'primary';
      case 'boarding':
        return 'warning';
      case 'in_transit':
        return 'success';
      case 'approaching':
        return 'success';
      case 'arrived':
        return 'success';
      case 'cancelled':
        return 'danger';
    }
  };

  const getStatusBgColor = (
    status: TrackingStatus,
  ): 'primaryBg' | 'warningBg' | 'dangerBg' | 'successBg' => {
    switch (status) {
      case 'scheduled':
        return 'primaryBg';
      case 'boarding':
        return 'warningBg';
      case 'in_transit':
        return 'successBg';
      case 'approaching':
        return 'successBg';
      case 'arrived':
        return 'successBg';
      case 'cancelled':
        return 'dangerBg';
    }
  };

  const handleGoBack = () => navigation.goBack();

  const handleConfirmCallCaptain = () => {
    Linking.openURL(`tel:${captainPhone}`);
    setShowCallCaptainModal(false);
  };

  const handleCancelCallCaptain = () => {
    setShowCallCaptainModal(false);
  };

  const handleConfirmEmergency = () => {
    Linking.openURL('tel:190');
    setShowEmergencyModal(false);
  };

  const handleCancelEmergency = () => {
    setShowEmergencyModal(false);
  };

  const handleCloseSosDetail = () => {
    setShowSosDetailModal(false);
    setSelectedSosAlert(null);
  };

  const captainName = trip?.captain?.name ?? 'Capitão';
  const captainPhone = trip?.captain?.phone ?? '';
  const boatName = trip?.boat?.name ?? '';
  const trackingStatus = trackingInfo?.trackingStatus ?? 'scheduled';

  return {
    mapRef,
    trip,
    booking,
    trackingInfo,
    isLoading,
    error,
    mySosAlerts,
    showSosAlerts,
    setShowSosAlerts,
    showDangerZones,
    setShowDangerZones,
    showCallCaptainModal,
    setShowCallCaptainModal,
    showEmergencyModal,
    setShowEmergencyModal,
    showSosDetailModal,
    showSafetyModal,
    setShowSafetyModal,
    showErrorModal,
    setShowErrorModal,
    selectedSosAlert,
    originCoords,
    destinationCoords,
    currentPosition,
    routeCoordinates,
    progress,
    captainName,
    captainPhone,
    boatName,
    trackingStatus,
    handleRefresh,
    handleCallCaptain,
    handleEmergency,
    handleSosPress,
    handleSosMarkerPress,
    handleSafetyOverlayPress,
    calculateNearbyAlerts,
    getStatusLabel,
    getStatusColor,
    getStatusBgColor,
    handleGoBack,
    handleConfirmCallCaptain,
    handleCancelCallCaptain,
    handleConfirmEmergency,
    handleCancelEmergency,
    handleCloseSosDetail,
  };
}

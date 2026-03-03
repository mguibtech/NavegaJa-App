import {useEffect, useRef, useState} from 'react';
import {Linking} from 'react-native';
import MapView from 'react-native-maps';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {SosAlert, SosStatus, SosType, useTrackBooking, TrackingStatus, useSosAlert, usePersonalContacts, PersonalContact, useLocationLabel, useFloodInundation, RISK_FILL, RISK_STROKE} from '@domain';
import {AppStackParamList} from '@routes';
import {useToast, useVolumeButtonSos} from '@hooks';
import {api} from '@api';
import {API_ENDPOINTS} from '@api/config';

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
  const toast = useToast();
  const {alerts, createAlert} = useSosAlert();
  const {contacts} = usePersonalContacts();
  const {label: locationLabel, fetchLabel} = useLocationLabel();
  const mySosAlerts = alerts.filter(a => a.status === SosStatus.ACTIVE);

  const [showSosAlerts, setShowSosAlerts] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [livePosition, setLivePosition] = useState<{latitude: number; longitude: number} | null>(null);
  const [sosTriggering, setSosTriggering] = useState(false);
  const [showSosResultModal, setShowSosResultModal] = useState(false);
  const [unlinkedSosContacts, setUnlinkedSosContacts] = useState<PersonalContact[]>([]);

  // Modal state
  const [showCallCaptainModal, setShowCallCaptainModal] = useState(false);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);
  const [showSosDetailModal, setShowSosDetailModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [selectedSosAlert, setSelectedSosAlert] = useState<SosAlert | null>(null);

  useEffect(() => {
    const lat = trackingInfo?.currentLat;
    const lng = trackingInfo?.currentLng;
    if (lat != null && lng != null) {
      fetchLabel(lat, lng);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingInfo?.currentLat, trackingInfo?.currentLng]);

  useEffect(() => {
    if (error) {
      setShowErrorModal(true);
    }
  }, [error]);

  // GPS polling — atualiza posição do barco a cada 15s enquanto viagem está em andamento
  useEffect(() => {
    const tripId = trackingInfo?.booking.tripId;
    const status = trackingInfo?.trackingStatus;
    if (!tripId || status === 'arrived' || status === 'cancelled' || status === 'scheduled') {
      return;
    }
    async function pollLocation() {
      try {
        const res = await api.get<{lat: number; lng: number}>(API_ENDPOINTS.TRIP_LOCATION(tripId!));
        if (res?.lat != null && res?.lng != null) {
          setLivePosition({latitude: res.lat, longitude: res.lng});
        }
      } catch {
        // falha silenciosa — mantém posição anterior
      }
    }
    pollLocation();
    const interval = setInterval(pollLocation, 15_000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingInfo?.booking.tripId, trackingInfo?.trackingStatus]);

  // Flood inundation polygons — usa posição da embarcação como centro
  const inundLat = trackingInfo?.currentLat ?? MANAUS_COORDS.latitude;
  const inundLng = trackingInfo?.currentLng ?? MANAUS_COORDS.longitude;
  const {inundation} = useFloodInundation(inundLat, inundLng);

  const trip = trackingInfo?.booking.trip;
  const booking = trackingInfo?.booking;

  // Resolve origin/destination coordinates
  const originCoords = MANAUS_COORDS;
  const destinationCoords = PARINTINS_COORDS;

  // Boat position: prefer live GPS poll, then tracking API, then interpolate from progress
  const progress = trackingInfo?.progressPercent ?? 0;
  const currentPosition =
    livePosition ??
    (trackingInfo?.currentLat != null && trackingInfo?.currentLng != null
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
        });

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

  async function handleSosTrigger() {
    if (sosTriggering) {return;}
    setSosTriggering(true);
    try {
      await createAlert(SosType.GENERAL, {
        tripId: trip?.id,
        description: 'SOS acionado pelo passageiro',
      });
      const unlinked = contacts.filter(c => !c.linkedUserId);
      setUnlinkedSosContacts(unlinked);
      setShowSosResultModal(true);
    } catch {
      toast.showError('Erro ao enviar SOS. Verifique a sua ligação e tente novamente.');
    } finally {
      setSosTriggering(false);
    }
  }

  function handleWhatsApp(contact: PersonalContact) {
    const lat = currentPosition.latitude.toFixed(6);
    const lng = currentPosition.longitude.toFixed(6);
    const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const msg = `🆘 EMERGÊNCIA! Preciso de ajuda urgente! A minha localização: ${mapsUrl}`;
    Linking.openURL(
      `whatsapp://send?phone=55${contact.phone}&text=${encodeURIComponent(msg)}`,
    ).catch(() => {
      Linking.openURL(`sms:${contact.phone}?body=${encodeURIComponent(msg)}`);
    });
  }

  function handleCloseSosResult() {
    setShowSosResultModal(false);
  }

  // Physical Volume Down button — 3× in 2s triggers SOS (Android only)
  useVolumeButtonSos({
    onTrigger: handleSosTrigger,
    onHint: remaining =>
      toast.showInfo(
        `SOS: prima mais ${remaining} vez${remaining === 1 ? '' : 'es'} o volume ↓`,
      ),
    enabled: !sosTriggering,
  });

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
    locationLabel,
    inundation,
    RISK_FILL,
    RISK_STROKE,
    sosTriggering,
    showSosResultModal,
    unlinkedSosContacts,
    handleSosTrigger,
    handleWhatsApp,
    handleCloseSosResult,
  };
}

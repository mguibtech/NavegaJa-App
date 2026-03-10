import { useEffect, useRef, useState } from 'react';
import { Linking } from 'react-native';
import MapView from 'react-native-maps';

import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { SosAlert, SosStatus, SosType, useTrackBooking, TrackingStatus, useSosAlert, usePersonalContacts, PersonalContact, useLocationLabel, useFloodInundation, RISK_FILL, RISK_STROKE } from '@domain';
import { AppStackParamList } from '@routes';
import { useToast } from '@hooks';
import { api } from '@api';
import { API_ENDPOINTS } from '@api/config';

const FALLBACK_COORDS = { latitude: -3.119, longitude: -60.0217 }; // Manaus

// Chaves sem acentos para comparação robusta (evita problemas de Unicode NFC vs NFD)
// Usado apenas para os marcadores de origem/destino e linha do percurso no mapa
const CITY_COORDS: Record<string, { latitude: number; longitude: number }> = {
  manaus: { latitude: -3.119, longitude: -60.0217 },
  parintins: { latitude: -2.6277, longitude: -56.736 },
  itacoatiara: { latitude: -3.1439, longitude: -58.4442 },
  tefe: { latitude: -3.3684, longitude: -64.7124 },
  barreirinha: { latitude: -2.7869, longitude: -57.0501 },
  coari: { latitude: -4.0856, longitude: -63.1416 },
  maues: { latitude: -3.3714, longitude: -57.7189 },
  tabatinga: { latitude: -4.255, longitude: -69.9327 },
  labrea: { latitude: -7.2592, longitude: -64.7986 },
  humaita: { latitude: -7.5057, longitude: -63.0173 },
  'benjamin constant': { latitude: -4.3759, longitude: -70.0339 },
  'sao gabriel da cachoeira': { latitude: -0.1303, longitude: -67.0892 },
  borba: { latitude: -4.384, longitude: -59.5875 },
  autazes: { latitude: -3.5777, longitude: -59.1301 },
  'nova olinda do norte': { latitude: -3.8847, longitude: -59.0906 },
  'presidente figueiredo': { latitude: -2.0227, longitude: -60.0249 },
  iranduba: { latitude: -3.2819, longitude: -60.1879 },
  manacapuru: { latitude: -3.2998, longitude: -60.6217 },
  careiro: { latitude: -3.3521, longitude: -59.7445 },
  anori: { latitude: -3.7697, longitude: -61.6447 },
  'fonte boa': { latitude: -2.5233, longitude: -66.0928 },
  manicore: { latitude: -5.8105, longitude: -61.3024 },
  alvaraes: { latitude: -3.2136, longitude: -64.8067 },
  beruri: { latitude: -3.9005, longitude: -61.3527 },
};

function getCityCoords(city?: string | null): { latitude: number; longitude: number } {
  if (!city) { return FALLBACK_COORDS; }
  const key = city
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s*[-–]\s*(am|pa)\.?\s*$/i, '')
    .trim();
  return CITY_COORDS[key] ?? FALLBACK_COORDS;
}

export function useTrackingScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'Tracking'>>();
  const { bookingId } = route.params;

  const mapRef = useRef<MapView>(null);

  const { trackingInfo, isLoading, error, refetch } = useTrackBooking(bookingId);
  const toast = useToast();
  const { alerts, createAlert } = useSosAlert();
  const { contacts } = usePersonalContacts();
  const { label: locationLabel, fetchLabel } = useLocationLabel();
  const mySosAlerts = alerts.filter(a => a.status === SosStatus.ACTIVE);

  const [showSosAlerts, setShowSosAlerts] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [livePosition, setLivePosition] = useState<{ latitude: number; longitude: number } | null>(null);
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

  // GPS polling — corre para todos os estados excepto cancelado
  // O backend devolve coords da origem (scheduled), GPS real (in_transit), destino (arrived)
  useEffect(() => {
    const tripId = trackingInfo?.booking.tripId;
    const status = trackingInfo?.trackingStatus;
    if (!tripId || status === 'cancelled') {
      return;
    }
    async function pollLocation() {
      try {
        const res = await api.get<{ lat: number | string; lng: number | string }>(
          API_ENDPOINTS.TRIP_LOCATION(tripId!),
        );

        if (res?.lat != null && res?.lng != null) {
          setLivePosition(normalizeCoords(res.lat, res.lng, FALLBACK_COORDS));
        }
      } catch {
        // falha silenciosa
      }
    }
    pollLocation();
    const interval = setInterval(pollLocation, 15_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trackingInfo?.booking.tripId, trackingInfo?.trackingStatus]);

  // Flood inundation polygons — usa posição da embarcação como centro
  const inundLat = livePosition?.latitude ?? trackingInfo?.currentLat ?? FALLBACK_COORDS.latitude;
  const inundLng = livePosition?.longitude ?? trackingInfo?.currentLng ?? FALLBACK_COORDS.longitude;
  const { inundation } = useFloodInundation(inundLat, inundLng);

  const trip = trackingInfo?.booking.trip;
  const booking = trackingInfo?.booking;
  const trackingStatus = trackingInfo?.trackingStatus ?? 'scheduled';
  const progress = trackingInfo?.progressPercent ?? 0;

  // Marcadores fixos de origem/destino (linha do percurso no mapa)
  // Prefer real geocoding coordinates stored in the trip; fall back to city-name lookup
  const originFallback = getCityCoords(trip?.origin);
  const destinationFallback = getCityCoords(trip?.destination);

  const originCoords =
    trip?.originLat != null && trip?.originLng != null
      ? normalizeCoords(trip.originLat, trip.originLng, originFallback)
      : originFallback;

  const destinationCoords =
    trip?.destinationLat != null && trip?.destinationLng != null
      ? normalizeCoords(trip.destinationLat, trip.destinationLng, destinationFallback)
      : destinationFallback;

  const currentPosition =
    livePosition ??
    (trackingInfo?.currentLat != null && trackingInfo?.currentLng != null
      ? normalizeCoords(trackingInfo.currentLat, trackingInfo.currentLng, originCoords)
      : originCoords);

  const routeCoordinates = [
    originCoords,
    currentPosition,
    destinationCoords,
  ];

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
    navigation.navigate('SosAlert', { tripId: bookingId });
  };

  async function handleSosTrigger() {
    if (sosTriggering) { return; }
    setSosTriggering(true);
    try {
      await createAlert(SosType.GENERAL, {
        tripId: trip?.id,
        description: 'SOS acionado pelo passageiro',
      });
      const unlinked = contacts.filter(c => !c.linkedUserId);
      setUnlinkedSosContacts(unlinked);
      setShowSosResultModal(true);
    } catch (err: any) {
      toast.showError(err?.message ?? 'Erro ao enviar SOS. Verifique a sua ligação e tente novamente.');
    } finally {
      setSosTriggering(false);
    }
  }

  function parseCoord(value: unknown, fallback: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }

    if (typeof value === 'string') {
      const parsed = Number(value.replace(',', '.').trim());
      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    return fallback;
  }

  function normalizeCoords(
    lat: unknown,
    lng: unknown,
    fallback: { latitude: number; longitude: number },
  ) {
    return {
      latitude: parseCoord(lat, fallback.latitude),
      longitude: parseCoord(lng, fallback.longitude),
    };
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

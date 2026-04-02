import {useEffect, useRef, useState} from 'react';
import {Linking} from 'react-native';
import MapView from 'react-native-maps';

import {RouteProp, useNavigation, useRoute} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';

import {
  PersonalContact,
  RISK_FILL,
  RISK_STROKE,
  SosAlert,
  SosStatus,
  SosType,
  TrackingStatus,
  useFloodInundation,
  useLocationLabel,
  usePersonalContacts,
  useSosAlert,
  useTrackBooking,
} from '@domain';
import {AppStackParamList} from '@routes';
import {useToast} from '@hooks';
import {api} from '@api';
import {API_ENDPOINTS} from '@api/config';
import {
  FALLBACK_COORDS,
  TRACKING_POLL_INTERVAL_MS,
  getCityCoords,
  getErrorMessage,
  getTrackingStatusBgColor,
  getTrackingStatusColor,
  getTrackingStatusLabel,
  normalizeCoords,
} from './trackingScreenUtils';

export function useTrackingScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'Tracking'>>();
  const {bookingId} = route.params;

  const mapRef = useRef<MapView>(null);
  const toast = useToast();

  const {trackingInfo, isLoading, error, refetch} = useTrackBooking(bookingId);
  const {alerts, createAlert} = useSosAlert();
  const {contacts} = usePersonalContacts();
  const {label: locationLabel, fetchLabel} = useLocationLabel();

  const mySosAlerts = alerts.filter(alert => alert.status === SosStatus.ACTIVE);

  const [showSosAlerts, setShowSosAlerts] = useState(true);
  const [showDangerZones, setShowDangerZones] = useState(true);
  const [livePosition, setLivePosition] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [sosTriggering, setSosTriggering] = useState(false);
  const [showSosResultModal, setShowSosResultModal] = useState(false);
  const [unlinkedSosContacts, setUnlinkedSosContacts] = useState<
    PersonalContact[]
  >([]);

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

  useEffect(() => {
    const tripId = trackingInfo?.booking.tripId;
    const status = trackingInfo?.trackingStatus;

    if (!tripId || status === 'cancelled') {
      return;
    }
    const activeTripId = tripId;

    async function pollLocation() {
      try {
        const response = await api.get<{lat: number | string; lng: number | string}>(
          API_ENDPOINTS.TRIP_LOCATION(activeTripId),
        );

        if (response?.lat != null && response?.lng != null) {
          setLivePosition(
            normalizeCoords(response.lat, response.lng, FALLBACK_COORDS),
          );
        }
      } catch {
        // Polling de localizacao pode falhar momentaneamente sem quebrar a tela.
      }
    }

    pollLocation();
    const interval = setInterval(pollLocation, TRACKING_POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [trackingInfo?.booking.tripId, trackingInfo?.trackingStatus]);

  const inundLat =
    livePosition?.latitude ?? trackingInfo?.currentLat ?? FALLBACK_COORDS.latitude;
  const inundLng =
    livePosition?.longitude ??
    trackingInfo?.currentLng ??
    FALLBACK_COORDS.longitude;
  const {inundation} = useFloodInundation(inundLat, inundLng);

  const trip = trackingInfo?.booking.trip;
  const booking = trackingInfo?.booking;
  const trackingStatus = trackingInfo?.trackingStatus ?? 'scheduled';
  const progress = trackingInfo?.progressPercent ?? 0;

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

  const routeCoordinates = [originCoords, currentPosition, destinationCoords];

  const captainName = trip?.captain?.name ?? 'Capitao';
  const captainPhone = trip?.captain?.phone ?? '';
  const boatName = trip?.boat?.name ?? '';

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
    if (sosTriggering) {
      return;
    }

    setSosTriggering(true);

    try {
      await createAlert(SosType.GENERAL, {
        tripId: trip?.id,
        description: 'SOS acionado pelo passageiro',
      });

      setUnlinkedSosContacts(contacts.filter(contact => !contact.linkedUserId));
      setShowSosResultModal(true);
    } catch (triggerError) {
      toast.showError(
        getErrorMessage(
          triggerError,
          'Erro ao enviar SOS. Verifique a sua ligacao e tente novamente.',
        ),
      );
    } finally {
      setSosTriggering(false);
    }
  }

  function handleWhatsApp(contact: PersonalContact) {
    const lat = currentPosition.latitude.toFixed(6);
    const lng = currentPosition.longitude.toFixed(6);
    const mapsUrl = `https://maps.google.com/?q=${lat},${lng}`;
    const message = `EMERGENCIA! Preciso de ajuda urgente! A minha localizacao: ${mapsUrl}`;

    Linking.openURL(
      `whatsapp://send?phone=55${contact.phone}&text=${encodeURIComponent(message)}`,
    ).catch(() => {
      Linking.openURL(`sms:${contact.phone}?body=${encodeURIComponent(message)}`);
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
    getStatusLabel: getTrackingStatusLabel as (status: TrackingStatus) => string,
    getStatusColor: getTrackingStatusColor,
    getStatusBgColor: getTrackingStatusBgColor,
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

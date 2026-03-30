import {useEffect, useState} from 'react';
import {Linking} from 'react-native';

import {useNavigation, useRoute, RouteProp} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Camera, useCameraDevice, useCodeScanner} from 'react-native-vision-camera';

import {useCheckInBooking, useTripManage, TripManagePassenger} from '@domain';
import {isOfflineQueuedError} from '@infra';
import {useToast} from '@hooks';
import {AppStackParamList} from '@routes';

export function useScanBookingQRScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<RouteProp<AppStackParamList, 'ScanBookingQR'>>();
  const {tripId} = route.params;
  const toast = useToast();

  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedBookingId, setScannedBookingId] = useState<string | null>(null);
  const [matchedPassenger, setMatchedPassenger] = useState<TripManagePassenger | null>(null);

  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showInvalidQRModal, setShowInvalidQRModal] = useState(false);
  const [showConfirmPanel, setShowConfirmPanel] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showAlreadyCheckedIn, setShowAlreadyCheckedIn] = useState(false);

  const {checkIn, isLoading} = useCheckInBooking();
  const {manageData} = useTripManage(tripId);

  const device = useCameraDevice('back');

  useEffect(() => {
    checkCameraPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function checkCameraPermission() {
    const status = await Camera.requestCameraPermission();
    setHasPermission(status === 'granted');
    if (status === 'denied') {
      setShowPermissionModal(true);
    }
  }

  const codeScanner = useCodeScanner({
    codeTypes: ['qr'],
    onCodeScanned: codes => {
      if (!isScanning || codes.length === 0) {return;}
      const code = codes[0];
      if (code?.value) {
        setIsScanning(false);
        handleQRCodeScanned(code.value);
      }
    },
  });

  function parseBookingId(qrData: string): string | null {
    // Tenta JSON: {"bookingId": "uuid"} ou {"id": "uuid"}
    try {
      const parsed = JSON.parse(qrData);
      if (parsed.bookingId) {return parsed.bookingId;}
      if (parsed.id) {return parsed.id;}
    } catch {
      // não é JSON
    }
    // Tenta UUID direto (36 chars com hífens)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(qrData.trim())) {
      return qrData.trim();
    }
    return null;
  }

  function handleQRCodeScanned(qrData: string) {
    const bookingId = parseBookingId(qrData);

    if (!bookingId) {
      setShowInvalidQRModal(true);
      setIsScanning(true);
      return;
    }

    // Tenta encontrar o passageiro na lista da viagem
    const passenger = manageData?.passageiros.find(p => p.bookingId === bookingId) ?? null;

    if (passenger?.checkedInAt) {
      setMatchedPassenger(passenger);
      setShowAlreadyCheckedIn(true);
      return;
    }

    setScannedBookingId(bookingId);
    setMatchedPassenger(passenger);
    setShowConfirmPanel(true);
  }

  async function confirmCheckIn() {
    if (!scannedBookingId) {return;}
    setShowConfirmPanel(false);

    try {
      await checkIn(scannedBookingId);
      toast.showSuccess('Check-in realizado com sucesso!');
      navigation.goBack();
    } catch (err: any) {
      if (isOfflineQueuedError(err)) {
        toast.showInfo(err.message);
        navigation.goBack();
        return;
      }

      // Passageiro está no manifesto da viagem → provavelmente já embarcou (cache desatualizado)
      if (matchedPassenger) {
        setShowAlreadyCheckedIn(true);
      } else {
        setErrorMessage(err?.message || 'Não foi possível realizar o check-in');
        setShowErrorModal(true);
      }
      setIsScanning(true);
    }
  }

  function handleGoBack() {
    navigation.goBack();
  }

  function handlePermissionConfirm() {
    setShowPermissionModal(false);
    Linking.openSettings();
  }

  function handlePermissionCancel() {
    setShowPermissionModal(false);
    navigation.goBack();
  }

  function handleInvalidQRClose() {
    setShowInvalidQRModal(false);
    setIsScanning(true);
  }

  function handleConfirmCancel() {
    setShowConfirmPanel(false);
    setScannedBookingId(null);
    setMatchedPassenger(null);
    setIsScanning(true);
  }

  function handleErrorModalClose() {
    setShowErrorModal(false);
    setErrorMessage('');
    setIsScanning(true);
  }

  function handleAlreadyCheckedInClose() {
    setShowAlreadyCheckedIn(false);
    setMatchedPassenger(null);
    setIsScanning(true);
  }

  return {
    // Camera
    device,
    hasPermission,
    isScanning,
    codeScanner,
    // State
    scannedBookingId,
    matchedPassenger,
    isLoading,
    // Handlers
    handleGoBack,
    confirmCheckIn,
    handlePermissionConfirm,
    handlePermissionCancel,
    handleInvalidQRClose,
    handleConfirmCancel,
    handleErrorModalClose,
    handleAlreadyCheckedInClose,
    // Modal/Panel states
    showPermissionModal,
    showInvalidQRModal,
    showConfirmPanel,
    showErrorModal,
    errorMessage,
    showAlreadyCheckedIn,
  };
}

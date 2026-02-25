import {useEffect, useState} from 'react';
import {Linking} from 'react-native';

import {useNavigation} from '@react-navigation/native';
import {NativeStackNavigationProp} from '@react-navigation/native-stack';
import {Camera, useCameraDevice, useCodeScanner} from 'react-native-vision-camera';

import {useCollectShipment} from '@domain';
import {useToast} from '@hooks';
import {AppStackParamList} from '@routes';

export function useScanShipmentQRScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AppStackParamList>>();

  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState<{
    shipmentId: string;
    trackingCode?: string;
    validationCode?: string;
  } | null>(null);

  // Modal states
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showInvalidQRModal, setShowInvalidQRModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const {collect, isLoading} = useCollectShipment();
  const toast = useToast();

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
      if (!isScanning || codes.length === 0) return;

      const code = codes[0];
      if (code?.value) {
        setIsScanning(false);
        handleQRCodeScanned(code.value);
      }
    },
  });

  async function handleQRCodeScanned(qrData: string) {
    try {
      // QR Code format: {"shipmentId": "uuid", "trackingCode": "NJ2024000123"}
      const data = JSON.parse(qrData);

      if (!data.shipmentId) {
        setShowInvalidQRModal(true);
        setIsScanning(true);
        return;
      }

      setScannedData(data);
      setShowConfirmModal(true);
    } catch {
      setShowInvalidQRModal(true);
      setIsScanning(true);
    }
  }

  async function confirmCollection() {
    if (!scannedData) return;

    setShowConfirmModal(false);

    try {
      // TODO: Implementar captura de foto opcional
      const result = await collect(scannedData.shipmentId, scannedData.validationCode);

      toast.showSuccess(result.message);

      // Navegar para detalhes da encomenda
      navigation.replace('ShipmentDetails', {shipmentId: scannedData.shipmentId});
    } catch (error: any) {
      setErrorMessage(error?.message || 'Não foi possível coletar a encomenda');
      setShowErrorModal(true);
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
    setShowConfirmModal(false);
    setScannedData(null);
    setIsScanning(true);
  }

  function handleErrorModalClose() {
    setShowErrorModal(false);
    setErrorMessage('');
  }

  return {
    // Camera
    device,
    hasPermission,
    isScanning,
    codeScanner,
    // State
    scannedData,
    isLoading,
    // Handlers
    handleGoBack,
    confirmCollection,
    handlePermissionConfirm,
    handlePermissionCancel,
    handleInvalidQRClose,
    handleConfirmCancel,
    handleErrorModalClose,
    // Modal states
    showPermissionModal,
    showInvalidQRModal,
    showConfirmModal,
    showErrorModal,
    errorMessage,
  };
}

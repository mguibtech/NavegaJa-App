import React, {useState, useEffect} from 'react';
import {StyleSheet, Linking} from 'react-native';

import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {Camera, useCameraDevice, useCodeScanner} from 'react-native-vision-camera';

import {Box, Button, Text, Icon, ConfirmationModal, InfoModal} from '@components';
import {useCollectShipment} from '@domain';
import {useToast} from '@hooks';

import {AppStackParamList} from '@routes';

type Props = NativeStackScreenProps<AppStackParamList, 'ScanShipmentQR'>;

export function ScanShipmentQRScreen({navigation}: Props) {
  const [hasPermission, setHasPermission] = useState(false);
  const [isScanning, setIsScanning] = useState(true);
  const [scannedData, setScannedData] = useState<{shipmentId: string; trackingCode?: string; validationCode?: string} | null>(null);

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

  if (!device || !hasPermission) {
    return (
      <>
        <Box flex={1} backgroundColor="background">
          {/* Header */}
          <Box
            backgroundColor="surface"
            paddingHorizontal="s20"
            paddingVertical="s16"
            flexDirection="row"
            alignItems="center"
            style={{
              shadowColor: '#000',
              shadowOffset: {width: 0, height: 2},
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 3,
            }}>
            <Button
              title=""
              preset="outline"
              leftIcon="arrow-back"
              onPress={() => navigation.goBack()}
            />
            <Text preset="headingSmall" color="text" bold ml="s12">
              Escanear QR Code
            </Text>
          </Box>

          <Box flex={1} alignItems="center" justifyContent="center" padding="s20">
            <Icon name="qr-code-scanner" size={80} color="textSecondary" />
            <Text preset="paragraphMedium" color="textSecondary" mt="s16">
              {!hasPermission ? 'Permissão de câmera negada' : 'Carregando câmera...'}
            </Text>
          </Box>
        </Box>

        {/* Permission Modal */}
        <ConfirmationModal
          visible={showPermissionModal}
          title="Permissão Necessária"
          message="É necessário permitir o acesso à câmera para escanear QR Codes das encomendas"
          icon="camera-alt"
          iconColor="warning"
          confirmText="Abrir Configurações"
          cancelText="Voltar"
          onConfirm={() => {
            setShowPermissionModal(false);
            Linking.openSettings();
          }}
          onCancel={() => {
            setShowPermissionModal(false);
            navigation.goBack();
          }}
        />
      </>
    );
  }

  return (
    <>
      <Box flex={1} backgroundColor="background">
        {/* Header */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s20"
          paddingVertical="s16"
          flexDirection="row"
          alignItems="center"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 3,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}>
          <Button
            title=""
            preset="outline"
            leftIcon="arrow-back"
            onPress={() => navigation.goBack()}
          />
          <Text preset="headingSmall" color="text" bold ml="s12">
            Escanear QR Code
          </Text>
        </Box>

        {/* Camera Preview */}
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isScanning}
          codeScanner={codeScanner}
        />

        {/* Overlay com moldura de scanner */}
        {isScanning && (
          <Box style={StyleSheet.absoluteFill} pointerEvents="none">
            <Box flex={1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}} />
            <Box flexDirection="row">
              <Box flex={1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}} />
              <Box
                width={250}
                height={250}
                borderWidth={3}
                borderColor="primary"
                borderRadius="s16"
              />
              <Box flex={1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}} />
            </Box>
            <Box flex={1} style={{backgroundColor: 'rgba(0,0,0,0.5)'}} alignItems="center" pt="s24">
              <Text
                preset="paragraphMedium"
                bold
                style={{color: '#FFFFFF'}}>
                Posicione o QR Code no centro
              </Text>
            </Box>
          </Box>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <Box
            style={[
              StyleSheet.absoluteFill,
              {backgroundColor: 'rgba(0,0,0,0.7)'},
            ]}
            alignItems="center"
            justifyContent="center">
            <Box alignItems="center">
              <Box
                width={60}
                height={60}
                borderRadius="s24"
                backgroundColor="primaryBg"
                alignItems="center"
                justifyContent="center"
                mb="s16">
                <Icon name="inventory" size={32} color="primary" />
              </Box>
              <Text
                preset="headingMedium"
                bold
                style={{color: '#FFFFFF'}}>
                Coletando encomenda...
              </Text>
            </Box>
          </Box>
        )}
      </Box>

      {/* Invalid QR Modal */}
      <InfoModal
        visible={showInvalidQRModal}
        title="QR Code Inválido"
        message="Este QR Code não corresponde a uma encomenda do NavegaJá. Verifique e tente novamente."
        icon="qr-code-scanner"
        iconColor="danger"
        buttonText="Tentar Novamente"
        onClose={() => {
          setShowInvalidQRModal(false);
          setIsScanning(true);
        }}
      />

      {/* Confirm Collection Modal */}
      <ConfirmationModal
        visible={showConfirmModal}
        title="Coletar Encomenda"
        message={`Código: ${scannedData?.trackingCode || 'N/A'}\n\nConfirma a coleta desta encomenda?`}
        icon="inventory-2"
        iconColor="success"
        confirmText="Confirmar Coleta"
        cancelText="Cancelar"
        confirmPreset="primary"
        onConfirm={confirmCollection}
        onCancel={() => {
          setShowConfirmModal(false);
          setScannedData(null);
          setIsScanning(true);
        }}
        isLoading={isLoading}
      />

      {/* Error Modal */}
      <InfoModal
        visible={showErrorModal}
        title="Erro ao Coletar"
        message={errorMessage}
        icon="error-outline"
        iconColor="danger"
        buttonText="Entendi"
        onClose={() => {
          setShowErrorModal(false);
          setErrorMessage('');
        }}
      />
    </>
  );
}

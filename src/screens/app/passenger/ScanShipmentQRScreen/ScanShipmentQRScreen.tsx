import React from 'react';
import {StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Camera} from 'react-native-vision-camera';

import {Box, Button, Text, Icon, ConfirmationModal, InfoModal} from '@components';

import {useScanShipmentQRScreen} from './useScanShipmentQRScreen';

export function ScanShipmentQRScreen() {
  const {top} = useSafeAreaInsets();
  const {
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
  } = useScanShipmentQRScreen();

  if (!device || !hasPermission) {
    return (
      <>
        <Box flex={1} backgroundColor="background">
          {/* Header */}
          <Box
            backgroundColor="surface"
            paddingHorizontal="s20"
            flexDirection="row"
            alignItems="center"
            style={{
              paddingTop: top + 12,
              paddingBottom: 16,
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
              onPress={handleGoBack}
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
          onConfirm={handlePermissionConfirm}
          onCancel={handlePermissionCancel}
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
          flexDirection="row"
          alignItems="center"
          style={{
            paddingTop: top + 12,
            paddingBottom: 16,
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
            onPress={handleGoBack}
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
        onClose={handleInvalidQRClose}
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
        onCancel={handleConfirmCancel}
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
        onClose={handleErrorModalClose}
      />
    </>
  );
}

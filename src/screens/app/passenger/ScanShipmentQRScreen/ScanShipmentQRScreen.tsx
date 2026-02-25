import React from 'react';
import {StyleSheet, Image} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Camera} from 'react-native-vision-camera';

import {Box, Button, Text, Icon, TouchableOpacityBox, ConfirmationModal, InfoModal} from '@components';

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
    capturedPhotoUri,
    // Handlers
    handleGoBack,
    handleTakePhoto,
    confirmCollection,
    handlePermissionConfirm,
    handlePermissionCancel,
    handleInvalidQRClose,
    handleConfirmCancel,
    handleErrorModalClose,
    // Modal/Panel states
    showPermissionModal,
    showInvalidQRModal,
    showConfirmPanel,
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

      {/* Confirm Collection Panel — painel fixo no fundo da tela */}
      {showConfirmPanel && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          backgroundColor="surface"
          borderRadius="s24"
          padding="s20"
          style={{
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            shadowColor: '#000',
            shadowOffset: {width: 0, height: -4},
            shadowOpacity: 0.15,
            shadowRadius: 12,
            elevation: 10,
          }}>
          {/* Drag handle */}
          <Box
            width={40}
            height={4}
            backgroundColor="border"
            borderRadius="s8"
            alignSelf="center"
            mb="s16"
          />

          {/* Código da encomenda */}
          <Box flexDirection="row" alignItems="center" mb="s16">
            <Box
              width={44}
              height={44}
              borderRadius="s12"
              backgroundColor="successBg"
              alignItems="center"
              justifyContent="center"
              mr="s12">
              <Icon name="inventory-2" size={24} color="success" />
            </Box>
            <Box flex={1}>
              <Text preset="paragraphSmall" color="textSecondary">Encomenda escaneada</Text>
              <Text preset="paragraphMedium" color="text" bold>
                {scannedData?.trackingCode || scannedData?.shipmentId?.slice(0, 8).toUpperCase() || 'N/A'}
              </Text>
            </Box>
          </Box>

          {/* Foto opcional */}
          <Box mb="s16">
            <Text preset="paragraphSmall" color="textSecondary" mb="s8">
              Foto de confirmação (opcional)
            </Text>
            {capturedPhotoUri ? (
              <Box flexDirection="row" alignItems="center" gap="s12">
                <Image
                  source={{uri: capturedPhotoUri}}
                  style={{width: 72, height: 72, borderRadius: 8}}
                  resizeMode="cover"
                />
                <TouchableOpacityBox
                  flex={1}
                  flexDirection="row"
                  alignItems="center"
                  paddingVertical="s10"
                  paddingHorizontal="s12"
                  backgroundColor="background"
                  borderRadius="s8"
                  onPress={handleTakePhoto}>
                  <Icon name="camera-alt" size={18} color="primary" />
                  <Text preset="paragraphSmall" color="primary" bold ml="s8">
                    Tirar outra foto
                  </Text>
                </TouchableOpacityBox>
              </Box>
            ) : (
              <TouchableOpacityBox
                flexDirection="row"
                alignItems="center"
                paddingVertical="s12"
                paddingHorizontal="s16"
                backgroundColor="background"
                borderRadius="s12"
                onPress={handleTakePhoto}>
                <Icon name="camera-alt" size={20} color="primary" />
                <Box ml="s12">
                  <Text preset="paragraphSmall" color="primary" bold>
                    Tirar foto da encomenda
                  </Text>
                  <Text preset="paragraphCaptionSmall" color="textSecondary">
                    Recomendado para comprovante
                  </Text>
                </Box>
              </TouchableOpacityBox>
            )}
          </Box>

          {/* Botões */}
          <Box flexDirection="row" gap="s12">
            <TouchableOpacityBox
              flex={1}
              paddingVertical="s14"
              borderRadius="s12"
              backgroundColor="background"
              alignItems="center"
              onPress={handleConfirmCancel}>
              <Text preset="paragraphMedium" color="text" bold>Cancelar</Text>
            </TouchableOpacityBox>
            <TouchableOpacityBox
              flex={2}
              paddingVertical="s14"
              borderRadius="s12"
              backgroundColor="primary"
              alignItems="center"
              flexDirection="row"
              justifyContent="center"
              onPress={confirmCollection}>
              <Icon name="check-circle" size={20} color="surface" />
              <Text preset="paragraphMedium" color="surface" bold ml="s8">
                Confirmar Coleta
              </Text>
            </TouchableOpacityBox>
          </Box>
        </Box>
      )}

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

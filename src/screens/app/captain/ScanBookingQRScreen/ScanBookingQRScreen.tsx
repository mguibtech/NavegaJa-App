import React from 'react';
import {StyleSheet} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

import {Camera} from 'react-native-vision-camera';

import {Box, Text, Icon, TouchableOpacityBox, ConfirmationModal, InfoModal} from '@components';

import {useScanBookingQRScreen} from './useScanBookingQRScreen';

export function ScanBookingQRScreen() {
  const {top} = useSafeAreaInsets();
  const {
    device,
    hasPermission,
    isScanning,
    codeScanner,
    scannedBookingId,
    matchedPassenger,
    isLoading,
    handleGoBack,
    confirmCheckIn,
    handlePermissionConfirm,
    handlePermissionCancel,
    handleInvalidQRClose,
    handleConfirmCancel,
    handleErrorModalClose,
    handleAlreadyCheckedInClose,
    showPermissionModal,
    showInvalidQRModal,
    showConfirmPanel,
    showErrorModal,
    errorMessage,
    showAlreadyCheckedIn,
  } = useScanBookingQRScreen();

  const headerStyle = {
    paddingTop: top + 12,
    paddingBottom: 16,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  };

  if (!device || !hasPermission) {
    return (
      <>
        <Box flex={1} backgroundColor="background">
          <Box
            backgroundColor="surface"
            paddingHorizontal="s20"
            flexDirection="row"
            alignItems="center"
            style={headerStyle}>
            <TouchableOpacityBox onPress={handleGoBack} padding="s8" mr="s4">
              <Icon name="arrow-back" size={24} color="text" />
            </TouchableOpacityBox>
            <Text preset="headingSmall" color="text" bold ml="s8">
              Escanear QR de Check-in
            </Text>
          </Box>

          <Box flex={1} alignItems="center" justifyContent="center" padding="s20">
            <Icon name="qr-code-scanner" size={80} color="textSecondary" />
            <Text preset="paragraphMedium" color="textSecondary" mt="s16" textAlign="center">
              {!hasPermission ? 'Permissão de câmera negada' : 'Carregando câmera...'}
            </Text>
          </Box>
        </Box>

        <ConfirmationModal
          visible={showPermissionModal}
          title="Permissão Necessária"
          message="É necessário permitir o acesso à câmera para escanear o QR Code do passageiro"
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
        {/* Header flutuante */}
        <Box
          backgroundColor="surface"
          paddingHorizontal="s20"
          flexDirection="row"
          alignItems="center"
          style={{
            ...headerStyle,
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          }}>
          <TouchableOpacityBox onPress={handleGoBack} padding="s8" mr="s4">
            <Icon name="arrow-back" size={24} color="text" />
          </TouchableOpacityBox>
          <Text preset="headingSmall" color="text" bold ml="s8">
            Escanear QR de Check-in
          </Text>
        </Box>

        {/* Camera */}
        <Camera
          style={StyleSheet.absoluteFill}
          device={device}
          isActive={isScanning}
          codeScanner={codeScanner}
        />

        {/* Overlay com moldura */}
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
            <Box
              flex={1}
              style={{backgroundColor: 'rgba(0,0,0,0.5)'}}
              alignItems="center"
              pt="s24">
              <Text preset="paragraphMedium" bold style={{color: '#FFFFFF'}}>
                Aponte para o QR Code do passageiro
              </Text>
              <Text preset="paragraphCaptionSmall" style={{color: 'rgba(255,255,255,0.7)'}} mt="s8">
                Ticket de embarque do app NavegaJá
              </Text>
            </Box>
          </Box>
        )}

        {/* Loading overlay */}
        {isLoading && (
          <Box
            style={[StyleSheet.absoluteFill, {backgroundColor: 'rgba(0,0,0,0.7)'}]}
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
                <Icon name="how-to-reg" size={32} color="primary" />
              </Box>
              <Text preset="headingMedium" bold style={{color: '#FFFFFF'}}>
                Realizando check-in...
              </Text>
            </Box>
          </Box>
        )}
      </Box>

      {/* Confirm Panel */}
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

          <Box flexDirection="row" alignItems="center" mb="s20">
            <Box
              width={48}
              height={48}
              borderRadius="s12"
              backgroundColor="primaryBg"
              alignItems="center"
              justifyContent="center"
              mr="s12">
              <Icon name="how-to-reg" size={26} color="primary" />
            </Box>
            <Box flex={1}>
              <Text preset="paragraphSmall" color="textSecondary">
                {matchedPassenger ? 'Passageiro identificado' : 'Reserva encontrada'}
              </Text>
              <Text preset="paragraphMedium" color="text" bold>
                {matchedPassenger?.passenger.name || scannedBookingId?.slice(0, 8).toUpperCase()}
              </Text>
              {matchedPassenger && (
                <Text preset="paragraphCaptionSmall" color="textSecondary">
                  {matchedPassenger.seats} {matchedPassenger.seats === 1 ? 'assento' : 'assentos'} · {matchedPassenger.passenger.phone}
                </Text>
              )}
            </Box>
          </Box>

          <Box flexDirection="row" gap="s12">
            <TouchableOpacityBox
              flex={1}
              paddingVertical="s14"
              borderRadius="s12"
              backgroundColor="background"
              alignItems="center"
              onPress={handleConfirmCancel}>
              <Text preset="paragraphMedium" color="text" bold>
                Cancelar
              </Text>
            </TouchableOpacityBox>
            <TouchableOpacityBox
              flex={2}
              paddingVertical="s14"
              borderRadius="s12"
              backgroundColor="primary"
              alignItems="center"
              flexDirection="row"
              justifyContent="center"
              onPress={confirmCheckIn}>
              <Icon name="check-circle" size={20} color="surface" />
              <Text preset="paragraphMedium" color="surface" bold ml="s8">
                Confirmar Check-in
              </Text>
            </TouchableOpacityBox>
          </Box>
        </Box>
      )}

      {/* QR Inválido */}
      <InfoModal
        visible={showInvalidQRModal}
        title="QR Code Inválido"
        message="Este QR Code não corresponde a uma reserva do NavegaJá. Peça ao passageiro para abrir o Ticket no app."
        icon="qr-code-scanner"
        iconColor="danger"
        buttonText="Tentar Novamente"
        onClose={handleInvalidQRClose}
      />

      {/* Já fez check-in */}
      <InfoModal
        visible={showAlreadyCheckedIn}
        title="Já Embarcou"
        message={`${matchedPassenger?.passenger.name || 'Este passageiro'} já realizou check-in nesta viagem.`}
        icon="check-circle"
        iconColor="success"
        buttonText="OK"
        onClose={handleAlreadyCheckedInClose}
      />

      {/* Erro */}
      <InfoModal
        visible={showErrorModal}
        title="Erro no Check-in"
        message={errorMessage}
        icon="error-outline"
        iconColor="danger"
        buttonText="Entendi"
        onClose={handleErrorModalClose}
      />
    </>
  );
}

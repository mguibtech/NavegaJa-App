import React from 'react';
import {Modal, ScrollView, StyleSheet, ActivityIndicator} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MapView, {Marker, Polyline, Polygon, PROVIDER_GOOGLE} from 'react-native-maps';

import {
  Box,
  Button,
  Icon,
  Text,
  TouchableOpacityBox,
  BoatMarker,
  SosMarker,
  DangerZone,
  DangerZoneData,
  SafetyOverlay,
  SosHoldButton,
  InfoModal,
  ConfirmationModal,
} from '@components';
import {SafetyLevel} from '@domain';

import {useTrackingScreen} from './useTrackingScreen';

// Zonas de perigo estáticas — dados geográficos reais do Rio Amazonas
const DANGER_ZONES: DangerZoneData[] = [
  {
    id: 'zone-001',
    type: 'circle',
    name: 'Corredeiras do Ariaú',
    description: 'Área com correnteza forte e pedras submersas',
    level: 'high',
    center: {latitude: -3.05, longitude: -60.1},
    radius: 2000,
  },
  {
    id: 'zone-002',
    type: 'polygon',
    name: 'Zona de Pirataria',
    description: 'Relatos de assaltos a embarcações',
    level: 'critical',
    coordinates: [
      {latitude: -2.85, longitude: -59.4},
      {latitude: -2.82, longitude: -59.35},
      {latitude: -2.88, longitude: -59.32},
      {latitude: -2.91, longitude: -59.38},
    ],
  },
];

export function TrackingScreen() {
  const {top} = useSafeAreaInsets();
  const {
    mapRef,
    trip,
    booking,
    trackingInfo,
    isLoading,
    mySosAlerts,
    showSosAlerts,
    setShowSosAlerts,
    showDangerZones,
    setShowDangerZones,
    showCallCaptainModal,
    showEmergencyModal,
    showSosDetailModal,
    showSafetyModal,
    setShowSafetyModal,
    showErrorModal,
    setShowErrorModal,
    selectedSosAlert,
    currentPosition,
    routeCoordinates,
    originCoords,
    destinationCoords,
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
  } = useTrackingScreen();

  if (isLoading && !trackingInfo) {
    return (
      <Box flex={1} backgroundColor="background" alignItems="center" justifyContent="center">
        <ActivityIndicator size="large" color="#0B5D8A" />
        <Text preset="paragraphMedium" color="textSecondary" mt="s12">
          Carregando rastreamento...
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={1} backgroundColor="background">
      {/* Header */}
      <Box
        backgroundColor="surface"
        paddingHorizontal="s20"
        paddingBottom="s16"
        style={{
          paddingTop: top + 16,
          shadowColor: '#000',
          shadowOffset: {width: 0, height: 2},
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 3,
        }}>
        <Box flexDirection="row" alignItems="center">
          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s20"
            backgroundColor="background"
            alignItems="center"
            justifyContent="center"
            borderWidth={1}
            borderColor="border"
            marginRight="s12"
            onPress={handleGoBack}>
            <Icon name="arrow-back" size={22} color="text" />
          </TouchableOpacityBox>

          <Box flex={1}>
            <Box flexDirection="row" alignItems="center" gap="s8" flexWrap="wrap">
              <Text preset="headingSmall" color="text" bold>
                Rastreamento
              </Text>
              <Box
                flexDirection="row"
                alignItems="center"
                backgroundColor={getStatusBgColor(trackingStatus)}
                paddingHorizontal="s8"
                paddingVertical="s4"
                borderRadius="s8">
                <Box
                  width={6}
                  height={6}
                  borderRadius="s8"
                  backgroundColor={getStatusColor(trackingStatus)}
                  marginRight="s4"
                />
                <Text preset="paragraphCaptionSmall" color={getStatusColor(trackingStatus)} bold>
                  {getStatusLabel(trackingStatus)}
                </Text>
              </Box>
            </Box>
            <Text preset="paragraphSmall" color="textSecondary" mt="s4">
              {trip?.origin ?? '—'} → {trip?.destination ?? '—'}
            </Text>
          </Box>

          <TouchableOpacityBox
            width={40}
            height={40}
            borderRadius="s20"
            backgroundColor="background"
            alignItems="center"
            justifyContent="center"
            borderWidth={1}
            borderColor="border"
            onPress={handleRefresh}>
            <Icon name="refresh" size={22} color="text" />
          </TouchableOpacityBox>
        </Box>
      </Box>

      {/* Posição atual da embarcação (geocoding reverso) */}
      {locationLabel && (
        <Box
          backgroundColor='surface'
          paddingHorizontal='s20'
          paddingVertical='s10'
          borderTopWidth={1}
          borderTopColor='border'
          flexDirection='row'
          alignItems='center'>
          <Icon name='place' size={14} color='textSecondary' />
          <Text preset='paragraphCaptionSmall' color='textSecondary' ml='s6'>
            {locationLabel}
          </Text>
        </Box>
      )}

      <ScrollView
        contentContainerStyle={{padding: 24, paddingBottom: 148}}
        showsVerticalScrollIndicator={false}>

        {/* Trip not started yet banner */}
        {trackingStatus === 'scheduled' && trip && (
          <Box
            backgroundColor="primaryBg"
            borderRadius="s16"
            padding="s16"
            mb="s16"
            flexDirection="row"
            alignItems="center">
            <Icon name="schedule" size={24} color="primary" />
            <Box ml="s12" flex={1}>
              <Text preset="paragraphMedium" color="primary" bold>
                Viagem ainda não iniciada
              </Text>
              <Text preset="paragraphSmall" color="textSecondary" mt="s4">
                Partida prevista às {new Date(trip.departureAt).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
              </Text>
            </Box>
          </Box>
        )}

        {/* Google Maps */}
        <Box
          height={320}
          backgroundColor="surface"
          borderRadius="s20"
          mb="s16"
          overflow="hidden"
          style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            provider={PROVIDER_GOOGLE}
            style={styles.map}
            initialRegion={{
              latitude: currentPosition.latitude,
              longitude: currentPosition.longitude,
              latitudeDelta: 1.5,
              longitudeDelta: 1.5,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            showsCompass={true}
            showsScale={true}>
            {/* Rota */}
            <Polyline
              coordinates={routeCoordinates}
              strokeColor="#0B5D8A"
              strokeWidth={3}
            />

            {/* Origem */}
            <Marker
              coordinate={originCoords}
              title={trip?.origin ?? 'Origem'}
              description="Porto de Origem"
              pinColor="green"
            />

            {/* Barco */}
            <BoatMarker
              coordinate={currentPosition}
              title={boatName || 'Embarcação'}
              description={`Progresso: ${progress}%`}
            />

            {/* Destino */}
            <Marker
              coordinate={destinationCoords}
              title={trip?.destination ?? 'Destino'}
              description="Porto de Destino"
              pinColor="red"
            />

            {/* SOS Alerts */}
            {showSosAlerts &&
              mySosAlerts.map(alert => (
                <SosMarker
                  key={alert.id}
                  alert={alert}
                  onCalloutPress={() => handleSosMarkerPress(alert)}
                />
              ))}

            {/* Danger Zones */}
            {showDangerZones &&
              DANGER_ZONES.map(zone => (
                <DangerZone key={zone.id} zone={zone} />
              ))}

            {/* Flood Inundation Polygons — apenas com dados reais do Flood Hub */}
            {inundation?.source === 'flood_hub' &&
              inundation.polygons.map(poly => (
                <Polygon
                  key={poly.id}
                  coordinates={poly.coordinates}
                  fillColor={RISK_FILL[poly.risk]}
                  strokeColor={RISK_STROKE[poly.risk]}
                  strokeWidth={1}
                />
              ))}
          </MapView>

          {/* Safety Overlay */}
          <SafetyOverlay
            level={SafetyLevel.CAUTION}
            score={72}
            nearbyAlerts={calculateNearbyAlerts()}
            onPress={handleSafetyOverlayPress}
          />

          {/* Map Filter Buttons */}
          <Box position="absolute" bottom={12} right={12} gap="s8">
            <TouchableOpacityBox
              width={40}
              height={40}
              borderRadius="s20"
              backgroundColor={showSosAlerts ? 'danger' : 'surface'}
              alignItems="center"
              justifyContent="center"
              onPress={() => setShowSosAlerts(!showSosAlerts)}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}>
              <Icon
                name="crisis-alert"
                size={20}
                color={showSosAlerts ? 'surface' : 'danger'}
              />
            </TouchableOpacityBox>

            <TouchableOpacityBox
              width={40}
              height={40}
              borderRadius="s20"
              backgroundColor={showDangerZones ? 'warning' : 'surface'}
              alignItems="center"
              justifyContent="center"
              onPress={() => setShowDangerZones(!showDangerZones)}
              style={{
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
              }}>
              <Icon
                name="warning"
                size={20}
                color={showDangerZones ? 'surface' : 'warning'}
              />
            </TouchableOpacityBox>
          </Box>
        </Box>

        {/* Trip Info + Progresso */}
        <Box
          backgroundColor="surface"
          borderRadius="s16"
          padding="s16"
          mb="s12"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}>
          <Box flexDirection="row" gap="s12" mb="s16">
            <Box
              flex={1}
              backgroundColor="primaryBg"
              paddingVertical="s10"
              paddingHorizontal="s10"
              borderRadius="s12">
              <Icon name="schedule" size={18} color="primary" />
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                Chegada Prevista
              </Text>
              <Text preset="paragraphSmall" color="text" bold>
                {trackingInfo?.estimatedArrival ?? '—'}
              </Text>
            </Box>

            <Box
              flex={1}
              backgroundColor="secondaryBg"
              paddingVertical="s10"
              paddingHorizontal="s10"
              borderRadius="s12">
              <Icon name="directions-boat" size={18} color="secondary" />
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                Embarcação
              </Text>
              <Text preset="paragraphSmall" color="text" bold numberOfLines={1}>
                {boatName || '—'}
              </Text>
            </Box>

            <Box
              flex={1}
              backgroundColor="accentBg"
              paddingVertical="s10"
              paddingHorizontal="s10"
              borderRadius="s12">
              <Icon name="event-seat" size={18} color="accent" />
              <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                Assento
              </Text>
              <Text preset="paragraphSmall" color="text" bold>
                {booking?.seatNumber ?? '—'}
              </Text>
            </Box>
          </Box>

          {/* Progresso inline */}
          <Box flexDirection="row" alignItems="center" gap="s12">
            <Box flex={1} height={6} backgroundColor="border" borderRadius="s8" overflow="hidden">
              <Box
                width={`${progress}%`}
                height="100%"
                backgroundColor={trackingStatus === 'cancelled' ? 'danger' : 'primary'}
              />
            </Box>
            <Text preset="paragraphCaptionSmall" color="primary" bold>
              {progress}%
            </Text>
          </Box>
        </Box>

        {/* Capitão + Ações */}
        <Box
          backgroundColor="surface"
          borderRadius="s16"
          padding="s16"
          mb="s24"
          style={{
            shadowColor: '#000',
            shadowOffset: {width: 0, height: 2},
            shadowOpacity: 0.08,
            shadowRadius: 4,
            elevation: 2,
          }}>
          {captainPhone ? (
            <>
              <Box flexDirection="row" alignItems="center" mb="s16">
                <Box
                  width={48}
                  height={48}
                  borderRadius="s48"
                  backgroundColor="primaryBg"
                  alignItems="center"
                  justifyContent="center"
                  marginRight="s12">
                  <Icon name="person" size={24} color="primary" />
                </Box>
                <Box flex={1}>
                  <Text preset="paragraphMedium" color="text" bold>
                    {captainName}
                  </Text>
                  <Text preset="paragraphSmall" color="textSecondary">
                    {captainPhone}
                  </Text>
                </Box>
              </Box>
              <Box flexDirection="row" gap="s12">
                <Box flex={1}>
                  <Button
                    title="Ligar"
                    onPress={handleCallCaptain}
                    rightIcon="phone"
                  />
                </Box>
                <TouchableOpacityBox
                  flex={1}
                  height={52}
                  backgroundColor="dangerBg"
                  borderRadius="s12"
                  flexDirection="row"
                  alignItems="center"
                  justifyContent="center"
                  gap="s8"
                  onPress={handleEmergency}>
                  <Icon name="warning" size={20} color="danger" />
                  <Text preset="paragraphMedium" color="danger" bold>
                    Emergência
                  </Text>
                </TouchableOpacityBox>
              </Box>
            </>
          ) : (
            <TouchableOpacityBox
              height={52}
              backgroundColor="dangerBg"
              borderRadius="s12"
              flexDirection="row"
              alignItems="center"
              justifyContent="center"
              gap="s8"
              onPress={handleEmergency}>
              <Icon name="warning" size={22} color="danger" />
              <Text preset="paragraphLarge" color="danger" bold>
                Emergência
              </Text>
            </TouchableOpacityBox>
          )}
        </Box>
      </ScrollView>

      {/* SOS Hold Button */}
      <Box
        position="absolute"
        bottom={16}
        left={0}
        right={0}
        alignItems="center"
        style={{pointerEvents: 'box-none'}}>
        <SosHoldButton onTrigger={handleSosTrigger} disabled={sosTriggering} />
        <Text
          preset="paragraphCaptionSmall"
          color="textSecondary"
          mt="s4"
          style={{textAlign: 'center', opacity: 0.7}}>
          ou prima volume ↓ 3×
        </Text>
      </Box>

      {/* Error Modal */}
      <InfoModal
        visible={showErrorModal}
        title="Erro ao carregar"
        message="Não foi possível carregar os dados do rastreamento. Verifique sua conexão e tente novamente."
        icon="error"
        iconColor="danger"
        buttonText="OK"
        onClose={() => setShowErrorModal(false)}
      />

      {/* Call Captain Modal */}
      <ConfirmationModal
        visible={showCallCaptainModal}
        title="Ligar para o Capitão"
        message={`Deseja ligar para ${captainName}?`}
        icon="phone"
        iconColor="primary"
        confirmText="Ligar"
        cancelText="Cancelar"
        confirmPreset="primary"
        onConfirm={handleConfirmCallCaptain}
        onCancel={handleCancelCallCaptain}
      />

      {/* Emergency Modal */}
      <ConfirmationModal
        visible={showEmergencyModal}
        title="Emergência"
        message="Você será conectado com os serviços de emergência."
        icon="warning"
        iconColor="danger"
        confirmText="Chamar Emergência"
        cancelText="Cancelar"
        confirmPreset="primary"
        onConfirm={handleConfirmEmergency}
        onCancel={handleCancelEmergency}
      />

      {/* SOS Detail Modal */}
      <InfoModal
        visible={showSosDetailModal && selectedSosAlert != null}
        title={`SOS: ${selectedSosAlert?.user?.name || 'Usuário'}`}
        message={`${selectedSosAlert?.description || 'Sem descrição'}${selectedSosAlert?.contactNumber ? `\n\nContato: ${selectedSosAlert.contactNumber}` : '\n\nSem contato informado'}`}
        icon="crisis-alert"
        iconColor="danger"
        buttonText="Fechar"
        onClose={handleCloseSosDetail}
      />

      {/* Safety Info Modal */}
      <InfoModal
        visible={showSafetyModal}
        title="Segurança da Navegação"
        message={`Condições atuais da rota:\n\n• Clima: Favorável\n• Tráfego: Normal\n• Alertas próximos: ${mySosAlerts.length}\n• Zonas de perigo: ${DANGER_ZONES.length}`}
        icon="security"
        iconColor="info"
        buttonText="OK"
        onClose={() => setShowSafetyModal(false)}
      />

      {/* SOS Result Modal */}
      <Modal
        visible={showSosResultModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseSosResult}>
        <Box
          flex={1}
          style={{backgroundColor: 'rgba(0,0,0,0.6)'}}
          justifyContent="flex-end">
          <Box
            backgroundColor="surface"
            padding="s24"
            paddingBottom="s32"
            style={{borderTopLeftRadius: 20, borderTopRightRadius: 20}}>
            {/* Header */}
            <Box alignItems="center" mb="s20">
              <Box
                width={64}
                height={64}
                borderRadius="s48"
                backgroundColor="dangerBg"
                alignItems="center"
                justifyContent="center"
                mb="s12">
                <Icon name="crisis-alert" size={32} color="danger" />
              </Box>
              <Text preset="headingSmall" color="text" bold>
                SOS Enviado!
              </Text>
              <Text
                preset="paragraphSmall"
                color="textSecondary"
                mt="s8"
                style={{textAlign: 'center'}}>
                {unlinkedSosContacts.length > 0
                  ? 'A equipa NavegaJá foi notificada. Notifique os restantes contactos via WhatsApp:'
                  : 'A equipa NavegaJá e os seus contactos foram notificados.'}
              </Text>
            </Box>

            {/* Unlinked contacts — WhatsApp buttons */}
            {unlinkedSosContacts.length > 0 && (
              <Box mb="s20">
                {unlinkedSosContacts.map(contact => (
                  <TouchableOpacityBox
                    key={contact.id}
                    backgroundColor="successBg"
                    borderRadius="s12"
                    padding="s12"
                    mb="s8"
                    flexDirection="row"
                    alignItems="center"
                    onPress={() => handleWhatsApp(contact)}>
                    <Icon name="phone" size={20} color="success" />
                    <Box flex={1} ml="s12">
                      <Text preset="paragraphMedium" color="text" bold>
                        {contact.name}
                      </Text>
                      <Text preset="paragraphSmall" color="textSecondary">
                        {contact.phone}
                      </Text>
                    </Box>
                    <Icon name="open-in-new" size={16} color="success" />
                  </TouchableOpacityBox>
                ))}
              </Box>
            )}

            <Button title="Fechar" onPress={handleCloseSosResult} />
          </Box>
        </Box>
      </Modal>
    </Box>
  );
}

const styles = StyleSheet.create({
  mapContainer: {
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});

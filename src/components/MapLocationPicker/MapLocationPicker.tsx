import React, {useState, useRef} from 'react';
import {Modal, ActivityIndicator, Platform, StyleSheet} from 'react-native';
import MapView, {Marker, MapPressEvent, Region} from 'react-native-maps';

import {Box, Button, Icon, Text, TouchableOpacityBox} from '@components';
import {locationAPI, ReverseGeocode} from '@domain';

export interface MapLocationPickerProps {
  visible: boolean;
  initialLat?: number;
  initialLng?: number;
  title?: string;
  onConfirm: (lat: number, lng: number, label: string, cidade?: string) => void;
  onClose: () => void;
}

const MANAUS_REGION: Region = {
  latitude: -3.1019,
  longitude: -60.025,
  latitudeDelta: 8,
  longitudeDelta: 8,
};

const styles = StyleSheet.create({
  header: {
    elevation: 3,
  },
  map: {
    flex: 1,
  },
  hintOverlay: {
    top: 16,
    elevation: 4,
  },
  bottomPanel: {
    elevation: 8,
  },
});

export function MapLocationPicker({
  visible,
  initialLat,
  initialLng,
  title = 'Selecionar localização',
  onConfirm,
  onClose,
}: MapLocationPickerProps) {
  const hasInitial = initialLat != null && initialLng != null;
  const [pin, setPin] = useState<{lat: number; lng: number} | null>(
    hasInitial ? {lat: initialLat!, lng: initialLng!} : null,
  );
  const [label, setLabel] = useState('');
  const [cidade, setCidade] = useState<string | undefined>(undefined);
  const [isReverseLoading, setIsReverseLoading] = useState(false);
  const mapRef = useRef<MapView>(null);

  async function handleMapPress(e: MapPressEvent) {
    const {latitude, longitude} = e.nativeEvent.coordinate;
    setPin({lat: latitude, lng: longitude});
    setIsReverseLoading(true);
    try {
      const result: ReverseGeocode = await locationAPI.getReverseGeocode(latitude, longitude);
      setLabel(result.label);
      setCidade(result.cidade);
    } catch {
      setLabel(`${latitude.toFixed(5)}, ${longitude.toFixed(5)}`);
    } finally {
      setIsReverseLoading(false);
    }
  }

  function handleConfirm() {
    if (!pin) {return;}
    onConfirm(pin.lat, pin.lng, label || `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`, cidade);
    onClose();
  }

  const initialRegion: Region = hasInitial
    ? {latitude: initialLat!, longitude: initialLng!, latitudeDelta: 0.5, longitudeDelta: 0.5}
    : MANAUS_REGION;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}>
      <Box flex={1}>
        {/* Header */}
        <Box
          paddingTop={Platform.OS === 'ios' ? 's48' : 's20'}
          paddingHorizontal="s16"
          paddingBottom="s12"
          backgroundColor="surface"
          flexDirection="row"
          alignItems="center"
          style={styles.header}>
          <TouchableOpacityBox onPress={onClose} mr="s12">
            <Icon name="close" size={24} color="text" />
          </TouchableOpacityBox>
          <Text preset="paragraphMedium" color="text" bold flex={1}>
            {title}
          </Text>
        </Box>

        {/* Map */}
        <Box flex={1}>
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={initialRegion}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton>
            {pin && (
              <Marker
                coordinate={{latitude: pin.lat, longitude: pin.lng}}
                draggable
                onDragEnd={e => {
                  const {latitude, longitude} = e.nativeEvent.coordinate;
                  setPin({lat: latitude, lng: longitude});
                }}
              />
            )}
          </MapView>

          {/* Hint overlay */}
          <Box
            position="absolute"
            alignSelf="center"
            backgroundColor="surface"
            borderRadius="s12"
            paddingHorizontal="s16"
            paddingVertical="s8"
            style={styles.hintOverlay}
            flexDirection="row"
            alignItems="center">
            <Icon name="touch-app" size={16} color="textSecondary" />
            <Text preset="paragraphCaptionSmall" color="textSecondary" ml="s8">
              Toque no mapa para marcar a localização
            </Text>
          </Box>
        </Box>

        {/* Bottom panel */}
        <Box
          backgroundColor="surface"
          padding="s16"
          style={styles.bottomPanel}>
          {pin ? (
            <>
              <Box flexDirection="row" alignItems="flex-start" mb="s12">
                <Icon name="place" size={20} color="secondary" />
                <Box flex={1} ml="s8">
                  {isReverseLoading ? (
                    <Box flexDirection="row" alignItems="center">
                      <ActivityIndicator size="small" color="#0B5D8A" />
                      <Text preset="paragraphSmall" color="textSecondary" ml="s8">
                        Obtendo endereço…
                      </Text>
                    </Box>
                  ) : (
                    <Text preset="paragraphSmall" color="text">
                      {label || `${pin.lat.toFixed(5)}, ${pin.lng.toFixed(5)}`}
                    </Text>
                  )}
                  <Text preset="paragraphCaptionSmall" color="textSecondary" mt="s4">
                    {pin.lat.toFixed(6)}, {pin.lng.toFixed(6)}
                  </Text>
                </Box>
              </Box>
              <Button
                title="Confirmar localização"
                onPress={handleConfirm}
                disabled={isReverseLoading}
              />
            </>
          ) : (
            <Box alignItems="center" paddingVertical="s8">
              <Text preset="paragraphSmall" color="textSecondary">
                Toque no mapa para selecionar um ponto
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Modal>
  );
}
